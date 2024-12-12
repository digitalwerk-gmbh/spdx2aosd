const fs = require('fs');
require('dotenv').config();
import { getMultibleUsedIds, generateDataValidationMessage, getMissingComponentIds, validateDependencies, loadSPDXKeys, validateSPDXIds, validateLicenseTextUrl, validateSelectedLicenseForDualLicenses, validateComponentsForModificationAndLinking } from './helper';
import { AosdSubComponent, DependencyObject, LicenseAosd, Part, Provider } from '../interfaces/interfaces';
import { validateAosd } from './aosdvalidator';
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let externalDependenciesArray: Array<string> = [];
let dependenciesObject: DependencyObject;
let licensesObject: LicenseAosd;
let partsObject: Part;
let dependenciesArray = [];
let validationResults: Array<string> = [];

export const convertDown = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        
        // First validate input aosd file
        const validationResult = validateAosd(process.env.INPUT_JSON_PATH + cliArgument, process.env.AOSD2_1_JSON_SCHEME);
       
        // If the scheme validation returns errors add them to log
        if (validationResult.length > 0) {
            validationResults = validationResults.concat(validationResult);
        }
        validationResults.push('\n-----------------------------------------------------\nData-Validation errors:\n-----------------------------------------------------\n');

        // Read the input aosd json file
        let jsonInputFile = fs.readFileSync(inputJsonPath, { encoding: 'utf8' });
        let inputDataArray = JSON.parse(jsonInputFile);
    
        // Set id arrays for check data validation
        const directCheckArray: Array<number> = inputDataArray['directDependencies'];
        let transCheckArray: Array<number> = [];
        let componentIdCheckArray: Array<number> = [];

        // Convert direct dependencies to strings
        const tempArray: Array<string> = [];
        for (let i = 0; i < inputDataArray['directDependencies']?.length; i++) {
            tempArray.push(inputDataArray['directDependencies'][i].toString());
        }

        // Define components
        const componentsArray = inputDataArray['components'];

        // Loop over all components and subcomponents
        for (let i = 0; i < componentsArray?.length; i++) {
            for (let j = 0; j < componentsArray[i]['subcomponents']?.length; j++) {
                
                // Convert external dependencies to strings
                externalDependenciesArray = [];
                for (let k = 0; k < componentsArray[i]['transitiveDependencies']?.length; k++) {
                    externalDependenciesArray.push(componentsArray[i]['transitiveDependencies'][k].toString());
                    // Collect transitive dependencies
                    transCheckArray.push(componentsArray[i]['transitiveDependencies'][k]);
                }

                // Collect component ids
                componentIdCheckArray.push(componentsArray[i]['id']);

                // Create dependency object
                dependenciesObject = {
                    id: componentsArray[i]['id']?.toString(),
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
                                holders: subcomponent['copyrights']?.length > 0 ? subcomponent['copyrights'] : [],
                                notice: '',
                            },
                            origin: 'packagemanagement',
                        };
                    }
                    
                    // Create part object
                    let partName = subcomponent['subcomponentName'];
                    if (typeof partName === 'string') {
                        if (partName === 'main') {
                            partName = 'default';
                        }
                    partName = partName.replace(" ","_");
                    }

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
                            holders: subcomponent['copyrights']?.length > 0 ? subcomponent['copyrights'] : [], 
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
        
        // Validate modification and linking
        validateComponentsForModificationAndLinking(componentsArray, validationResults);

        // Validate licenseTextUrl
        if (inputDataArray.scanned === false) {
           validateLicenseTextUrl(componentsArray, validationResults);
        }

        // Validate selectedLicense
        validateSelectedLicenseForDualLicenses(componentsArray, validationResults);

        // Validate 'spdxId' from licenses,json
        const validSPDXKeys = loadSPDXKeys(); 
        componentsArray?.forEach((component: { componentName: string; subcomponents: any[]; }) => {
            const componentName = component.componentName;
           
            component.subcomponents?.forEach((subcomponent) => {
               const spdxIds = [subcomponent.spdxId];
               const spdxValidationErrors = validateSPDXIds(spdxIds, validSPDXKeys, componentName, subcomponent.subcomponentName, subcomponent.selectedLicense);
               validationResults = validationResults.concat(spdxValidationErrors);
            });
        });

        // Validate direct dependencies
        validationResults = validationResults.concat(
            validateDependencies(inputDataArray['directDependencies'], componentsArray, "direct dependency")
        );
         
        // Validate transitive dependencies
        validationResults = validationResults.concat(
            validateDependencies(transCheckArray, componentsArray, "transitive dependency")
        );
  
        // Check if component is in direct and transitive dependencies
        const duplicateIds = getMultibleUsedIds(directCheckArray, transCheckArray);
        for (let i=0; i < duplicateIds?.length; i++) {
            validationResults.push('Warning: we have found a possible circle dependency for - component name: ' + componentsArray[i]['componentName'] + ' - with id: ' + componentsArray[i]['id']);
        }

        // Check if component is neither in direct dependencies nor in transitive dependencies
        const missingIds = getMissingComponentIds(directCheckArray, transCheckArray, componentIdCheckArray);
        for (let i=0; i < missingIds.length; i++) {
            validationResults.push('Warning: we have found component(s) that is neither in direct dependencies nor in transitive dependencies - component id: ' + missingIds[i]);
        }

        // Validate the aosd json result 
        const validationAosdResult = validateAosd(process.env.OUTPUT_JSON_PATH + outputFileName, process.env.AOSD2_0_JSON_SCHEME);
        // If the scheme validation returns errors add them to log
        if (validationAosdResult.length > 0) {
            validationResults = validationResults.concat(validationAosdResult);
        }

        // Check for validation error
        const validationMessage: string = generateDataValidationMessage(validationResults);
        const result = fs.writeFileSync(process.env.LOG_FILE_PATH, validationMessage, { encoding: 'utf8' });

        // Display success message
        console.log("We are done! - Thank's for using our aosd2.1 to aosd2.0 converter!");
    } catch(error) {
        console.log(error);
        console.log("Sorry for that - something went wrong! Please check the  file in the root folder for detailed information.");
    }
}

