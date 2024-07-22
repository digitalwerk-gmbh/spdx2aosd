const fs = require('fs');
require('dotenv').config();
import { writeErrorLog, checkErrorMessage } from './errorhandler';
import { checkValue, getUniqueValues } from './helper';
import { AosdSubComponent, DependencyObject, License, Part, Provider } from '../interfaces/interfaces';
import { validateAosd } from './aosdvalidator';
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let externalDependenciesArray: Array<string> = [];
let dependenciesObject: DependencyObject;
let licensesObject: License;
let partsObject: Part;
let dependenciesArray = [];
let validationResults: Array<string> = [];
let uniqueValidationResults: Array<string> = [];

export const convertDown = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        
        // First validate input aosd file
        const validationSpdxResult = validateAosd(cliArgument);
        //console.log(validationSpdxResult);

        // Read the input spdx json file
        let jsonInputFile = fs.readFileSync(inputJsonPath);
        let inputDataArray = JSON.parse(jsonInputFile);

        // Convert direct dependencies to strings
        const tempArray: Array<string> = [];
        for (let i = 0; i < inputDataArray['directDependencies'].length; i++) {
            tempArray.push(inputDataArray['directDependencies'][i].toString());
        }

        // Define components
        const componentsArray = inputDataArray['components'];

        // Loop over all components and subcomponents
        for (let i = 0; i < componentsArray.length; i++) {
            for (let j = 0; j < componentsArray[i]['subcomponents'].length; j++) {
                // Convert external dependencies to strings
                externalDependenciesArray = [];
                for (let k = 0; k < componentsArray[i]['transitiveDependencies'].length; k++) {
                    externalDependenciesArray.push(componentsArray[i]['transitiveDependencies'][k].toString());
                }

                // Create dependency object
                dependenciesObject = {
                    id: componentsArray[i]['id'].toString(),
                    name: componentsArray[i]['componentName'],
                    version: componentsArray[i]['componentVersion'],
                    versionRange: componentsArray[i]['componentVersion'],
                    scmUrl: componentsArray[i]['scmUrl'],
                    licenses: [],
                    parts: [],
                    deployPackage: {
                        name: 'default',
                        downloadUrl: '',
                        checksums: {
                            integrity: '',
                        }
                    },
                    externalDependencies: externalDependenciesArray,
                };

                // Loop over every component
                componentsArray[i]['subcomponents'].map((subcomponent: AosdSubComponent) => {
                    if (subcomponent['subcomponentName'] === 'main') {
                        // Create licenses object
                        licensesObject = {
                            name: subcomponent['subcomponentName'],
                            spdxId: subcomponent['spdxId'],
                            text: subcomponent['licenseText'],
                            url: subcomponent['licenseTextUrl'],
                            copyrights: {
                                holders: subcomponent['copyrights'].length > 0 ? subcomponent['copyrights'] : [],
                                notice: '',
                            },
                            origin: 'packagemanagement',
                        };
                    }
                    
                    // Create part object
                    let partName = subcomponent['subcomponentName'];
                    if (partName === 'main') {
                        partName = 'default';
                    }
                    partName = partName.replace(" ","_");

                    // Create additional licenses
                    let linkingType = componentsArray[i]['linking'];
                    if (componentsArray[i]['linking'] === 'sys_call') {
                        linkingType = 'sys_call_dyn_link';
                    }
                    //"sys_call_process" -> "process_call",
                    if (componentsArray[i]['linking'] === 'process_call') {
                        linkingType = 'sys_call_process';
                    }

                    // create a new part
                    partsObject = {
                        name: partName,
                        description: '',
                        providers: [],
                        external: true,
                    };

                    // Check for incompatibility with modified and linking
                    if (componentsArray[i]['modified'] === null) {
                        validationResults.push('Warning: incompatibility with modification - component name: ' + componentsArray[i]['componentName'] + ' - subcomponent: ' + subcomponent['subcomponentName']);
                    }
                    if (linkingType === null) {
                        validationResults.push('Warning: incompatibility with linking      - component name: ' + componentsArray[i]['componentName'] + ' - subcomponent: ' + subcomponent['subcomponentName']);
                    }

                    // Add data to provider object
                    let providersObject: Provider = {
                        additionalLicenses: [],
                        modified: componentsArray[i]['modified'],
                        usage: linkingType,
                    };

                    // Create object for additional licenses data
                    let dataObject = {
                        name: subcomponent['spdxId'],
                        spdxId: subcomponent['spdxId'],
                        text: subcomponent['licenseText'],
                        url: subcomponent['licenseTextUrl'],
                        copyrights: {
                            holders: subcomponent['copyrights'].length > 0 ? subcomponent['copyrights'] : [], 
                            notice: '',
                        },
                        origin: 'packagemanagement',
                    };
                    //Push data into the new object
                    providersObject['additionalLicenses'].push(dataObject);
                    partsObject['providers'].push(providersObject);
                    dependenciesObject['parts'].push(partsObject);
                });
            }
            // Push data into the new objects
            dependenciesObject['licenses'].push(licensesObject);
            dependenciesArray.push(dependenciesObject);
        }

        // Create new object header
        let newObject = {
            $schema: './aosd.schema.json',
            directDependencies: tempArray,
            dependencies: dependenciesArray,
        };
        

        // Prepare output file
        const outputFileName: string = cliArgument.replace(".json", "") + "_aosd2.0" + ".json";
        outputFile = outputJsonPath + outputFileName;
        
        // Write data to aosd json format
        fs.writeFileSync(outputFile, JSON.stringify(newObject, null, '\t'));
                
        // Validate the aosd json result 
        // const validationAosdResult = validateAosd(outputFileName);
        // console.log(validationAosdResult);

        // Check for validation error
        let validationMessage: string = '';
        uniqueValidationResults = getUniqueValues(validationResults);
        validationMessage = validationMessage + '-----------------------------------------------------\n';
        validationMessage = validationMessage + 'Validation errors:\n';
        validationMessage = validationMessage + '-----------------------------------------------------\n';
        for (let i = 0; i < uniqueValidationResults.length; i++) {
            validationMessage = validationMessage + uniqueValidationResults[i] + '\n';
        }
        const result = fs.writeFileSync(process.env.LOG_FILE_PATH, validationMessage, { encoding: 'utf8' });

        console.log("We are done! - Thank's for using our aosd2.1 to aosd2.0 converter!");
    } catch(error) {
        console.log(error);
	    //writeErrorLog({ message: checkErrorMessage(error) })
        console.log("Sorry for that - something went wrong! Please check the  file in the root folder for detailed information.");
    }
}
