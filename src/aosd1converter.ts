const fs = require('fs');
const ExcelJS = require('exceljs');
require('dotenv').config();
import * as path from 'path';
import { parseStream } from 'fast-csv';
import { AosdObject, AosdComponent, AosdSubComponent } from "../interfaces/interfaces";
import { validateAosd } from './aosdvalidator';
import { generateDataValidationMessage, linkingMapper, loadSPDXKeys, loadDeprecatedSPDXKeys, modificationMapper, spdxKeyMapper, validateComponentsForModificationAndLinking, validateSelectedLicenseForDualLicenses, validateSPDXIds, validateLicenseTextUrl} from "./helper";
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let validationResults: Array<string> = [];
const validSPDXKeys = loadSPDXKeys();
const deprecatedSPDXKeys = loadDeprecatedSPDXKeys();
let csvDataArray: Array<object> = [];

export const convertUpXls = async (cliArgument: string): Promise<void> => {
    try {
        validationResults.push('-----------------------------------------------------\nData-Validation errors:\n-----------------------------------------------------\n');
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        const myWorkBook = await new ExcelJS.Workbook();
        let json: any = [];
        let tmpArray: Array<object> = [];
        await myWorkBook.xlsx.readFile(inputJsonPath)
        .then(() => {
            const worksheet = myWorkBook.getWorksheet('records');
            let rowCounter = 0;
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
                let colCounter = 1;
                row.eachCell({ includeEmpty: true }, function(cell: any, colNumber: any) {
                    if (cell.value === null) {
                        cell.value = '';
                    }
                    // Check if the columns are complete and int the correct order 
                    // -----------------------------------------------------------
                    // Expected AOSD1.0 template columns
                    // -----------------------------------------------------------
                    // (1)  Column (A) - id
                    // (2)  Column (B) - software_name
                    // (3)  Column (C) - software_version
                    // (4)  Column (D) - software_download_link
                    // (5)  Column (E) - license_spdx
                    // (6)  Column (F) - license_text
                    // (7)  Column (G) - use_linkage
                    // (8)  Column (H) - use_modification
                    // (9)  Column (I) - use_start
                    // (10) Column (J) - use_end
                    // (11) Column (K) - use_comment

                    if (rowCounter === 0) {
                        if (colCounter === 1 && cell.value !== 'id') { throw new Error("Column A must have the name id.");};
                        if (colCounter === 2 && cell.value !== 'software_name') { throw new Error("Column B must have the name software_name.");};
                        if (colCounter === 3 && cell.value !== 'software_version') { throw new Error("Column C must have the name software_version.");};
                        if (colCounter === 4 && cell.value !== 'software_download_link') { throw new Error("Column D must have the name software_download_link.");};
                        if (colCounter === 5 && cell.value !== 'license_spdx') { throw new Error("Column E must have the name license_spdx.");};
                        if (colCounter === 6 && cell.value !== 'license_text') { throw new Error("Column F must have the name license_text.");};
                        if (colCounter === 7 && cell.value !== 'use_linkage') { throw new Error("Column G must have the name use_linkage.");};
                        if (colCounter === 8 && cell.value !== 'use_modification') { throw new Error("Column H must have the name use_modification.");};
                        if (colCounter === 9 && cell.value !== 'use_start') { throw new Error("Column I must have the name use_start.");};
                        if (colCounter === 10 && cell.value !== 'use_end') { throw new Error("Column J must have the name use_end.");};
                        if (colCounter === 11 && cell.value !== 'use_comment') { throw new Error("Column K must have the name use_comment.");};
                    }

                    if (rowCounter !== 0 && colNumber === 4 && cell.value !== '' && cell.value !== null) {
                        cell.value = cell.value.text;
                    } 
                    switch(colNumber) {
                        case 1: rowObject.id = rowCounter; 
		                case 2: rowObject.software_name = cell.value;
		                case 3: rowObject.software_version = cell.value;
		                case 4: rowObject.software_download_link = cell.value;
		                case 5: rowObject.license_spdx = cell.value; 
		                case 6: rowObject.license_text = cell.value; 
		                case 7: rowObject.use_linkage = cell.value; 
                        case 8: rowObject.use_modification = cell.value; 
		                case 9: rowObject.use_start = cell.value;  
		                case 10: rowObject.use_end = cell.value; 
		                case 11: rowObject.use_comment = cell.value;
                    }
                    colCounter++;
                })
                // Do not push header row
                if (rowCounter !== 0) {
                    json.push(rowObject);
                }
                rowCounter++;
            });

            // Converter AOSD1.0 XLSX to AOSD2.1 JSON
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
                    componentVersion: json[i]['software_version'].toString().length > 0 ? json[i]['software_version'].toString().replace(/\n/g, '') : 'no-version',
                    scmUrl: json[i]['software_download_link'] !== null && json[i]['software_download_link'].length > 0 ? json[i]['software_download_link'] : 'http://noscmurlfound/sorryforthat',
                    modified: modificationMapper(json[i]['use_modification']),
                    linking: linkingMapper(json[i]['use_linkage']),
                    transitiveDependencies: [],
                    subcomponents: [],
                };

                // Create subComponent object
                let subcomponentObject: AosdSubComponent = {
                    subcomponentName: 'main',
                    spdxId: json[i]['license_spdx'].length > 0 ? spdxKeyMapper(json[i]['license_spdx'], validationResults) : 'no-spdxId',
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

                // Validate spdxId
                const spdxValidationMessages = validateSPDXIds([spdxKeyMapper(json[i]['license_spdx'], validationResults)], validSPDXKeys, deprecatedSPDXKeys, componentObject.componentName, subcomponentObject.subcomponentName);
                validationResults.push(...spdxValidationMessages);
                initialId++;
            }

            // Validate modification and linking
            validateComponentsForModificationAndLinking(newObject.components, validationResults);

            // Validate selectedLicense
            validateSelectedLicenseForDualLicenses(newObject.components, validationResults);

            // Validate licenseTextUrl
            if (newObject.scanned === false) {
                validateLicenseTextUrl(newObject.components, validationResults);
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
            console.log("We are done! - Thank's for using our aosd1.0 xlsx to aosd2.1 converter! - Please look at the error.log for Info / Warning / Error");
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
    try {
        validationResults.push('-----------------------------------------------------\nData-Validation errors:\n-----------------------------------------------------\n');
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        const stream = fs.createReadStream(path.resolve(inputJsonPath), { encoding: "utf8" })
        parseStream(stream, { headers: true, delimiter: ';' })
        .on('error', (error: any) => console.error(error))
        .on('data', (rowData) => {
            csvDataArray.push(rowData);
        })
        .on('end', async () => await outputData(csvDataArray, cliArgument));
        console.log("We are done! - Thank's for using our aosd1.0 csv to aosd2.1 converter! - Please look at the error.log for Info / Warning / Error");
    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}

const outputData = async (csvData: Array<object>, cliArgument: string) => {
    try {
        // Converter AOSD1.0 CSV to AOSD2.1 JSON
        // Create new Aosd JSON Object
        let newObject: AosdObject  = {
            schemaVersion: '2.1.0',
            externalId: cliArgument,
            scanned: true,
            directDependencies: [],
            components: [],
        };

        // Starting IdcsvDataArray
        let initialId: number = 1;
        for (let i = 0; i < csvData?.length; i++) {
            // Create component object
            const tmpRecord = JSON.stringify(csvData[i]);
            const record = JSON.parse(tmpRecord);
            let componentObject: AosdComponent = {
                id: initialId,
                componentName: record['software_name'].toString().replace(/\n/g, ''),
                componentVersion: record['software_version'].toString().length > 0 ? record['software_version'].toString().replace(/\n/g, '').replace('+', '').replace('-', '').substring(0, 49) : 'no-version',
                scmUrl: record['software_download_link'] !== null && record['software_download_link'].length > 0 ? record['software_download_link'] : 'http://noscmurlfound/sorryforthat',
                modified: modificationMapper(record['use_modification']),
                linking: linkingMapper(record['use_linkage']),
                transitiveDependencies: [],
                subcomponents: [],
            };

            // Create subComponent object
            let subcomponentObject: AosdSubComponent = {
                subcomponentName: 'main',
                spdxId: record['license_spdx'].length > 0 ? spdxKeyMapper(record['license_spdx'], validationResults) : 'no-spdxId',
                copyrights: [],
                authors: [],
                licenseText: record['license_text'],
                licenseTextUrl: '',
                selectedLicense: "",
                additionalLicenseInfos: ""
            };

            // Push data into new subcomponent object
            componentObject['subcomponents'].push(subcomponentObject);    

            //Push data into the new object
            newObject['directDependencies'].push(initialId);
            newObject['components'].push(componentObject);
                
            // Validate spdxId
            const spdxValidationMessages = validateSPDXIds([spdxKeyMapper(record['license_spdx'], validationResults)], validSPDXKeys, deprecatedSPDXKeys, componentObject.componentName, subcomponentObject.subcomponentName);
            validationResults.push(...spdxValidationMessages);
            initialId++;
        }

        // Validate modification and linking
        validateComponentsForModificationAndLinking(newObject.components, validationResults);

        // Validate selectedLicense
        validateSelectedLicenseForDualLicenses(newObject.components, validationResults);

        // Validate licenseTextUrl
        if (newObject.scanned === false) {
            validateLicenseTextUrl(newObject.components, validationResults);
        }

        // Prepare output file
        const outputFileName: string = cliArgument.replace(".csv", "") + "_aosd2.1" + ".json";
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
    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
};