const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
import { SpdxException, SpdxLicense, DejaLicense, LicenseJson, Options, LicenseProperties, LicenseDataObject } from "../interfaces/interfaces";
import crypto from 'crypto';
// npm run licenses

let flicenseDataArray: Array<LicenseJson> = [];
let tmpLicenseBlock: LicenseJson;
let licenseUrls: Array<string> = [];
let options: Options = {
    method: 'GET',
    url: '',
    headers: {},
};
let dejaCodeHash: string = '';
let spdxExceptionHash: string = '';
let spdxLicensesHash: string = '';
let lastDejaUpdate: string = '';
let lastExceptionUpdate: string = '';
let lastLicenseUpdate: string = '';
const spdxexceptionurl = process.env.SPDX_EXCEPTIONS_URL;
const spdxlicensesurl = process.env.SPDX_LICENSES_URL;
const dejalicensesurl = process.env.SCAN_CODE_LICENSE_DB;
const dejalicenseurl = process.env.SCAN_CODE_LICENSE;
let check: LicenseDataObject;

export const getAllLicenses = async (): Promise<void> => {
    try {
        // Check update status
        if (fs.existsSync(process.env.LICENSE_FILE_PATH)) {
            const checkData = fs.readFileSync(process.env.LICENSE_FILE_PATH);
            check = JSON.parse(checkData);
            lastDejaUpdate = check['metadata']['dejaCodeHash'];
            lastExceptionUpdate = check['metadata']['spdxExceptionHash'];
            lastLicenseUpdate = check['metadata']['spdxLicensesHash'];
        }

        // Try to get deja code license list
        options = {
            method: 'GET',
            url: dejalicensesurl,
            headers: {},
        };
        await axios.request(options).then(function ({ data }: { data: Array<DejaLicense> }) {
            dejaCodeHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
            for (let i = 0; i < data.length; i++) {
                licenseUrls.push(dejalicenseurl + data[i]['json']);
            }
        }).catch(function (error: any) {
            console.error(error);
        });

        // Filter
        if (lastDejaUpdate !== dejaCodeHash) {

            // Try to get data for single deja code license
            let iteration = 0;
            for (let i = 0; i < licenseUrls.length; i++) {
                options = {
                    method: 'GET',
                    url: licenseUrls[i],
                    headers: {},
                };
                await axios.request(options).then(function ({ data }: { data: LicenseProperties }) {
                    tmpLicenseBlock = {
                        id: iteration,
                        key: data['key'],
                        short_name: data['short_name'],
                        name: data['name'],
                        category: data['category'],
                        owner: data['owner'],
                        homepage_url: data['homepage_url'],
                        is_exception: data['is_exception'],
                        is_depricated: data.hasOwnProperty('s_depricated') ? data['is_depricated'] : false,
                        notes: data.hasOwnProperty('notes') ? data['notes'] : '',
                        spdx_license_key: data['spdx_license_key'],
                        text_urls: data.hasOwnProperty('text_urls') ? data['text_urls'] : [],
                        other_urls: data.hasOwnProperty('other_urls') ? data['other_urls'] : [],
                        ignorable_copyrights: data.hasOwnProperty('ignorable_copyrights') ? data['ignorable_copyrights'] : [],
                        ignorable_holders: data.hasOwnProperty('ignorable_holders') ? data['ignorable_holders'] : [],
                        standard_notice: data.hasOwnProperty('standard_notice') ? data['standard_notice'] : '',
                        other_spdx_license_keys: data.hasOwnProperty('other_spdx_license_keys') ? data['other_spdx_license_keys'] : [],
                        osi_license_key: data.hasOwnProperty('osi_license_key') ? data['osi_license_key'] : '',
                        osi_url: data.hasOwnProperty('osi_url') ? data['osi_url'] : '',
                        faq_url: data.hasOwnProperty('faq_url') ? data['faq_url'] : '',
                        ignorable_urls: data.hasOwnProperty('ignorable_urls') ? data['ignorable_urls'] : [],
                        text: data['text'],
                    };
                    flicenseDataArray.push(tmpLicenseBlock);
                }).catch(function (error: any) {
                    console.error(error);
                });
                iteration++;
            };
        } else {
            flicenseDataArray = check['data']
            console.log('No deja license update is neccessary!')
        }

        // Try to get spdx exceptions list
        options = {
            method: 'GET',
            url: spdxexceptionurl,
            headers: {},
        };
        await axios.request(options).then(function ({ data }: { data: SpdxException }) {
            spdxExceptionHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

            // Check 
            if (lastExceptionUpdate !== spdxExceptionHash) {
                for (let i = 0; i < data['exceptions'].length; i++) {
                    const filteredData = flicenseDataArray.filter((l) => l.spdx_license_key === data['exceptions'][i]['licenseExceptionId']);
                    if (filteredData.length === 1) {
                        const id = filteredData[0]['id'];
                        flicenseDataArray[id]['is_exception'] = true,
                        flicenseDataArray[id]['is_depricated'] = data['exceptions'][i]['isDeprecatedLicenseId']
                    }
                }
                console.log('Successful crawled spdx exceptions.');               
            } else {
                console.log('No exceptions update is neccessary!')
            }
        }).catch(function (error: any) {
            console.error(error);
        });

        // Try to get spdx licenses list
        options = {
            method: 'GET',
            url: spdxlicensesurl,
            headers: {},
        };
        await axios.request(options).then(function ({ data }: { data: SpdxLicense }) {
            spdxLicensesHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

            // Check
            if (lastLicenseUpdate !== spdxLicensesHash) {
                for (let i = 0; i < data['licenses'].length; i++) {
                    const filteredData = flicenseDataArray.filter((l) => l.spdx_license_key === data['licenses'][i]['licenseId']);
                    if (filteredData.length === 1) {
                        const id = filteredData[0]['id'];
                        flicenseDataArray[id]['is_depricated'] = data['licenses'][i]['isDeprecatedLicenseId']
                    }                   
                }
                console.log('Successful crawled spdx licenses.')          
            } else {
                console.log('No licenses update is neccessary!') 
            }
        }).catch(function (error: any) {
            console.error(error);
        });

        // Write complete data to json file
        const licenseObject: LicenseDataObject = {
            metadata: {
                dejaCodeHash: dejaCodeHash,
                spdxExceptionHash: spdxExceptionHash,
                spdxLicensesHash: spdxLicensesHash,
            },
            data: flicenseDataArray,
        }
        await fs.writeFileSync(process.env.LICENSE_FILE_PATH, JSON.stringify(licenseObject));
        console.log('Successful created license.json file!')   
        console.log('Successful created license.json file with ' + flicenseDataArray.length + ' licenses!')     
    } catch(error: any) {
        console.error(error);
    }
}
getAllLicenses();
