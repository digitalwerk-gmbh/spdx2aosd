const fs = require('fs');
const ExcelJS = require('exceljs');
require('dotenv').config();
import { AosdObject, AosdComponent, AosdSubComponent } from "../interfaces/interfaces";
import { validateAosd } from './aosdvalidator';
import { generateDataValidationMessage } from "./helper";
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let validationResults: Array<string> = [];

export const convertUpXls = async (cliArgument: string): Promise<void> => {
    try {
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        const myWorkBook = new ExcelJS.Workbook();
        let json: any = [];
        let tmpArray: Array<object> = [];
        myWorkBook.xlsx.readFile(inputJsonPath)
        .then(() => {
            const worksheet = myWorkBook.getWorksheet('records');
            let counter = 0;
            worksheet.eachRow({ includeEmpty: false }, function(row: any) {
                let rowObject = {
                    id: 0,
		            software_name: '',
		            software_version: '',
		            software_download_link: '',
		            license_spdx: '',
		            license_text: '',
		            use_linkage: '',
		            use_modification: '',
		            use_distribution: '',
		            use_start: '',
		            use_end: '',
		            use_comment: ''
                };
                tmpArray = [];
                row.eachCell({ includeEmpty: true }, function(cell: any, colNumber: any) {
                    if (cell.value === null) {
                        cell.value = '';
                        // Replace line breaks - problem error message
                        // myString.replace(/\n/g, ' ') 
                    }
                    if (colNumber === 5 && cell.value !== '' && cell.value !== null) {
                        cell.value = cell.value.text;
                    }
                    switch(colNumber) {
                        case 1: rowObject.id = counter; 
		                case 3: rowObject.software_name = cell.value;
		                case 4: rowObject.software_version = cell.value;
		                case 5: rowObject.software_download_link = cell.value;
		                case 6: rowObject.license_spdx = cell.value; 
		                case 7: rowObject.license_text = cell.value; 
		                case 8: rowObject.use_linkage = cell.value; 
		                case 9: rowObject.use_modification = cell.value; 
		                case 10: rowObject.use_distribution = cell.value; 
		                case 11: rowObject.use_start = cell.value;  
		                case 12: rowObject.use_end = cell.value; 
		                case 13: rowObject.use_comment = cell.value; 
                    }    
                })
                if (counter !== 0) {
                    json.push(rowObject);
                }
                counter++;
            });

            // Converter AOSD1.0 to AOSD2.1
            // Create new Aosd JSON Object
            let newObject: AosdObject  = {
                schemaVersion: '2.1.0',
                externalId: cliArgument,
                scanned: true,
                directDependencies: [],
                components: [],
            };

            // Starting Id
            let initialId: number = 1;

            for (let i = 0; i < json?.length; i++) {
                // Create component object
                let componentObject: AosdComponent = {
                    id: initialId,
                    componentName: json[i]['software_name'].toString().replace(/\n/g, ''),
                    componentVersion: json[i]['software_version'].toString().replace(/\n/g, ''),
                    scmUrl: json[i]['software_download_link'] !== null && json[i]['software_download_link'].length > 0 ? json[i]['software_download_link'] : 'http://noscmurlfound/sorryforthat',
                    modified: modificationMapper(json[i]['use_modification']),
                    linking: linkingMapper(json[i]['use_linkage']),
                    transitiveDependencies: [],
                    subcomponents: [],
                };

                // Create subComponent object
                let subcomponentObject: AosdSubComponent = {
                    subcomponentName: 'main',
                    spdxId: spdxKeyMapper(json[i]['license_spdx']),
                    copyrights: [],
                    authors: [],
                    licenseText: json[i]['license_text'],
                    licenseTextUrl: '',
                    selectedLicense: "",
                    additionalLicenseInfos: ""
                };

                // Push data into new subcomponent object
                componentObject['subcomponents'].push(subcomponentObject);    

                //Push data into the new object
                newObject['directDependencies'].push(initialId);
                newObject['components'].push(componentObject);
                initialId++;
            }

            // Prepare output file
            const outputFileName: string = cliArgument.replace(".xlsx", "") + "_aosd2.1" + ".json";
            outputFile = outputJsonPath + outputFileName;

            // Write data to aosd json format
            fs.writeFileSync(outputFile, JSON.stringify(newObject, null, '\t'));

            // Validate the aosd json result 
            const validationAosdResult = validateAosd(process.env.OUTPUT_JSON_PATH + outputFileName, process.env.AOSD2_1_JSON_SCHEME);
            // If the scheme validation returns errors add them to log
            if (validationAosdResult.length > 0) {
                validationResults = validationResults.concat(validationAosdResult);
            }
            
            // Check for validation error
            const validationMessage: string = generateDataValidationMessage(validationResults);
            fs.writeFileSync(process.env.LOG_FILE_PATH, validationMessage, { encoding: 'utf8' });
            console.log("We are done! - Thank's for using our aosd1.0 to aosd2.1 converter!");
        })    
        .catch((error:any) => {
            fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
            console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        });
    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}

export const convertUpCsv = async (cliArgument: string): Promise<void> => {
    try {} catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}

const linkingMapper = (linkingInformation: string): string | null => {
    try {
        switch(linkingInformation) {
            case 'no': return 'process_call';
            case 'nein': return 'process_call';
            case 'yes, statically': return 'static_linking';
            case 'yes, dynamically': return 'dynamic_linking';
            case 'statisch': return 'static_linking';
            case 'dynamisch': return 'dynamic_linking';
            default: null;
        }
        return null;
    } catch(error: any) {
        return null;
    }
}

const modificationMapper = (modificationInformation: string): boolean| null => {
    try {
        switch(modificationInformation) {
            case 'no': return false;
            case 'yes': return true;
            case 'No': return false;
            case 'Yes': return true;
            case 'nein': return false;
            case 'ja': return true;
            case 'Nein': return false;
            case 'Ja': return true;
            default: null;
        }
        return null;
    } catch(error: any) {
        return null;
    }
}

const spdxKeyMapper = (spdxKeyInformation: string): string => {
    try {
        switch(spdxKeyInformation) {
            case '_different licenses including such with strict copyleft [no official SPDX]': return 'LicenseRef-scancode-other-copyleft';
            case '_different licenses including such with limited but no strict copyleft [no official SPDX]': return 'LicenseRef-scancode-other-copyleft';
            case '_different licenses all without copyleft [no official SPDX]': return 'LicenseRef-scancode-other-permissive';
            case '_Public Domain [no official SPDX]': return 'LicenseRef-scancode-public-domain';
            default: spdxKeyInformation;        }
        return spdxKeyInformation;
    } catch(error: any) {
        return spdxKeyInformation;
    }
}
