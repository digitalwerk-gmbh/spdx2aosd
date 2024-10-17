const fs = require('fs');
require('dotenv').config();
import { generateDataValidationMessage, generateUniqueSubcomponentName } from './helper'
import { AosdObject, AosdComponent, AosdSubComponent, LicenseAosd } from "../interfaces/interfaces";
import { validateAosd } from './aosdvalidator';
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let counter: number = 1;
let idMapping: Array<object> = [];
let tmpModified: Array<boolean | null> = [];
let tmpLinking: Array<string | null> = [];
let validationResults: Array<string> = [];
let uniqueNameCounter: number = 0;

export const convertUp = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;

        // First validate input aosd file
        const validationResult = validateAosd(process.env.INPUT_JSON_PATH + cliArgument, process.env.AOSD2_0_JSON_SCHEME);
        
        // If the scheme validation returns errors add them to log
        if (validationResult.length > 0) {
            validationResults = validationResults.concat(validationResult);
        }
        validationResults.push('\n-----------------------------------------------------\nData-Validation errors:\n-----------------------------------------------------\n');

        // Read the input aosd json file
        const jsonInputFile = fs.readFileSync(inputJsonPath, { encoding: 'utf8' });
        const inputDataArray = JSON.parse(jsonInputFile);

        // Create new Aosd JSON Object
        let newObject: AosdObject  = {
            schemaVersion: '2.1.0',
            externalId: '',
            scanned: true,
            directDependencies: inputDataArray['directDependencies'],
            components: [],
        };

        // Define dependencies
        let i = 0;
        const dependenciesArray = inputDataArray['dependencies'];

        // Loop over all dependencies
        for (i = 0; i < dependenciesArray.length; i++) {
            let iterator = 1;

            // Create ID generator
            const mappingObject = {
                number: counter,
                componentId: dependenciesArray[i]['id'],
            };
            idMapping.push(mappingObject);

            // Create component object
            let componentObject: AosdComponent = {
                id: mappingObject.componentId,
                componentName: dependenciesArray[i]['name'],
                componentVersion: dependenciesArray[i]['version'],
                scmUrl: dependenciesArray[i]['scmUrl'],
                modified: false,
                linking: '',
                transitiveDependencies: dependenciesArray[i]['externalDependencies'],
                subcomponents: [],
            };

            // Loop over all subcomponents(parts)
            tmpModified = [];
            tmpLinking = [];
            let maincounter = 0;
            for (let j = 0; j < dependenciesArray[i]['parts'].length; j++) {
                // Loop over providers
                dependenciesArray[i]['parts'][j]['providers'][0]['additionalLicenses'].map((adl: LicenseAosd) => {
                    // Create new copyright array
                    let tmpCopyright: Array<string> = [];
                    if (adl.hasOwnProperty('copyrights')) {
                        if (adl['copyrights'].hasOwnProperty('notice') && adl['copyrights']['notice'] !== "") {
                            tmpCopyright = [adl['copyrights']['notice']];
                        } else {
                            if (adl['copyrights'].hasOwnProperty('holders') && adl['copyrights']['holders'][0] !== "" ) {
                                tmpCopyright = adl['copyrights']['holders'];
                            }
                        }    
                    }

                    // New logic for take over part or additionalLicense name
                    let tmpSubcomponentName: string = generateUniqueSubcomponentName(dependenciesArray[i]['parts'].length, dependenciesArray[i]['parts'][j]['providers'][0]['additionalLicenses'].length, maincounter, uniqueNameCounter, dependenciesArray[i]['parts'][j]['name'], adl['name']);

                    // Create subcomponent object
                    let subcomponentObject: AosdSubComponent = {
                        subcomponentName: tmpSubcomponentName,
                        spdxId: adl['spdxId'],
                        copyrights: tmpCopyright,
                        authors: [],
                        licenseText: adl['text'],
                        licenseTextUrl: adl.hasOwnProperty('url') ? adl['url'] : '',
                        selectedLicense: "",
                        additionalLicenseInfos: ""
                    };
                    // collect data from all parts of a component
                    if (dependenciesArray[i]['parts'][j]['providers'][0].hasOwnProperty('modified')) {
                        tmpModified.push(
                            dependenciesArray[i]['parts'][j]['providers'][0]['modified'],
                        );
                    } else {
                        tmpModified.push(null);
                    }
                
                    // collect data from all parts of a component
                    if (dependenciesArray[i]['parts'][j]['providers'][0].hasOwnProperty('usage')) {
                        tmpLinking.push(
                            dependenciesArray[i]['parts'][j]['providers'][0]['usage'],
                        );
                    } else {
                        tmpLinking.push(null);
                    }

                    // Push data into new subcomponent object
                    componentObject['subcomponents'].push(subcomponentObject);

                    // Check if we have allready a subcomponent with the name main e.q. default
                    if (dependenciesArray[i]['parts'][j]['name'] === 'default') {
                        maincounter++;
                    }
                    uniqueNameCounter++;
            }); 
            }
            // Make array data unique
            tmpModified = Array.from(new Set(tmpModified));
            tmpLinking = Array.from(new Set(tmpLinking));

            // Write data to comonent object
            componentObject['modified'] = tmpModified.length > 0 ? tmpModified[0] : null;
            componentObject['linking'] = tmpLinking.length > 0 ? tmpLinking[0] : null;

            //Push data into the new object
            newObject['components'].push(componentObject);
            counter++;
        }

        // Convert strings to numbers in direct dependencies
        const temporaryId = [];
        for (let i = 0; i < newObject['directDependencies'].length; i++) {
            const id = newObject['directDependencies'][i];
            const findId = CheckValue(id, idMapping, 'componentId');
            temporaryId.push(findId[0]['number']);
        }
        newObject['directDependencies'] = temporaryId;

        // Convert strings to numbers in components
        for (let i = 0; i < newObject['components'].length; i++) {
            const id = newObject['components'][i].id;
            const findId = CheckValue(id, idMapping, 'componentId');
            newObject['components'][i].id = findId[0]['number'];

            const temporaryId: Array<number>= [];
            newObject['components'][i].transitiveDependencies.map((dep: any) => {
                const findId = CheckValue(dep, idMapping, 'componentId');
                temporaryId.push(findId[0]['number']);
            });
            newObject['components'][i].transitiveDependencies = temporaryId;
        }
  
        // Prepare output file
        const outputFileName: string = cliArgument.replace(".json", "") + "_aosd2.1" + ".json";
        outputFile = outputJsonPath + outputFileName;

        // Write data to aosd json format
        fs.writeFileSync(outputFile, JSON.stringify(newObject, null, '\t'));

        // Validate the aosd json result 
        const validationAosdResult = validateAosd(process.env.OUTPUT_JSON_PATH + outputFileName, process.env.AOSD2_0_JSON_SCHEME);
        // If the scheme validation returns errors add them to log
        if (validationAosdResult.length > 0) {
            validationResults = validationResults.concat(validationAosdResult);
        }

        // Check for validation error
        const validationMessage: string = generateDataValidationMessage(validationResults);
        fs.writeFileSync(process.env.LOG_FILE_PATH, validationMessage, { encoding: 'utf8' });
        console.log("We are done! - Thank's for using our aosd2.0 to aosd2.1 converter!");
    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}

const CheckValue = (value: any, arrayData: any[], objectkey: string) => {
    let Object = [];
    try {
      switch (objectkey) {
        case 'componentId':
          Object = arrayData.filter(function (ids) {
            return ids.componentId === value;
          });
          break;
      }
    } catch (error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        return Object;
    }
    return Object;
};
