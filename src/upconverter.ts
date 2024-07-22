const fs = require('fs');
require('dotenv').config();
import { writeErrorLog, checkErrorMessage } from './errorhandler'
import { checkValue, getUniqueValues } from './helper'
import { AosdObject, AosdComponent, AosdSubComponent, License } from "../interfaces/interfaces";
import { validateAosd } from "./aosdvalidator";
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let counter: number = 1;
let idMapping: Array<object> = [];
let tmpModified: Array<boolean> = [];
let tmpLinking: Array<string> = [];

export const convertUp = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;

        // First validate input spdx file
        // const validationSpdxResult = validateSpdx(cliArgument);
        // console.log(validationSpdxResult);

        const inputData = fs.readFileSync(inputJsonPath, { encoding: 'utf8' });
        // Convert JSON string to object
        const inputDataArray = JSON.parse(inputData);

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
            for (let j = 0; j < dependenciesArray[i]['parts'].length; j++) {
                // Loop over providers
                dependenciesArray[i]['parts'][j]['providers'][0]['additionalLicenses'].map((adl: License) => {
                    // Create subcomponent object
                    let tmpCopyright: Array<string> = [];
                    if (adl.hasOwnProperty('copyrights')) {
                        tmpCopyright = [adl['copyrights']['notice']];
                    }

                    let subcomponentObject: AosdSubComponent = {
                        subcomponentName: dependenciesArray[i]['parts'][j]['name'] === 'default' ? 'main' : dependenciesArray[i]['parts'][j]['name'],
                        spdxId: adl['spdxId'],
                        copyrights: tmpCopyright,
                        authors: [],
                        licenseText: adl['text'],
                        licenseTextUrl: adl['url'],
                        selectedLicense: "",
                        additionalLicenseInfos: ""
                    };
                    // collect data from all parts of a component
                    tmpModified.push(
                        dependenciesArray[i]['parts'][0]['modified'],
                    );
                    // collect data from all parts of a component
                    tmpLinking.push(
                        dependenciesArray[i]['parts'][0]['usage'],
                    );
                    // Push data into new subcomponent object
                    componentObject['subcomponents'].push(subcomponentObject);
            }); 
            }
            // Make array data unique
            tmpModified = Array.from(new Set(tmpModified));
            tmpLinking = Array.from(new Set(tmpLinking));
            // Write data to comonent object
            componentObject['modified'] = tmpModified[0];
            componentObject['linking'] = tmpLinking[0];
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

        // console.log("TEST: ", newObject['components']);

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
        // const validationAosdResult = validateAosd(outputFileName);
        // console.log(validationAosdResult);

        // fs.writeFileSync('error.log', error);
        
        console.log("We are done! - Thank's for using our aosd2.0 to aosd2.1 converter!");
    } catch(error) {
        // writeErrorLog({ message: checkErrorMessage(error) })
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
    } catch (error) {
        // writeErrorLog({ message: checkErrorMessage(error) })
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        return Object;
    }
    return Object;
};