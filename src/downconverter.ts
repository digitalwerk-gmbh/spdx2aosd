const fs = require('fs');
require('dotenv').config();
import { AosdObject, AosdComponent, AosdSubComponent, DependencyObject, License, Part, DeployPackage, Provider } from "../interfaces/interfaces";
import { validateAosd } from "./aosdvalidator";
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let counter: number = 1;
let externalDependenciesArray: Array<string> = [];


// let newObject = {};
let dependenciesObjects: Array<DependencyObject> | any = [];
let dependenciesObject: DependencyObject;
let licensesObjects: Array<License> = [];
let licensesObject: License;
let partsObjects: Array<Part> | any = [];
let partsObject: Part;
let providersObjects: Array<License> = [];
let dataObject = {};
let dependenciesArray = [];


export const convertDown = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        
        // First validate input spdx file
        // const validationSpdxResult = validateSpdx(cliArgument);
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
                    // chanched naming for two linking items that must be merged
                    let linkingType = componentsArray[i]['linking'];
                    // "sys_call_dyn_link", -> "sys_call"
                    if (componentsArray[i]['linking'] === 'sys_call') {
                        linkingType = 'sys_call_dyn_link';
                    }
                    //"sys_call_process" -> "process_call",
                    if (componentsArray[i]['linking'] === 'process_call') {
                        linkingType = 'sys_call_process';
                    }

                    partsObject = {
                        name: partName,
                        description: '',
                        providers: [],
                        modified: componentsArray[i]['modified'],
                        usage: linkingType,
                        external: true,
                    };
                    let providersObject: Provider = {
                        additionalLicenses: [],
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
        console.log("We are done! - Thank's for using our aosd2.1 to aosd2.0 converter!");
    } catch(error) {
        console.error(error);
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}