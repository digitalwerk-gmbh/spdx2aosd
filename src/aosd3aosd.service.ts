import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

let externalDependenciesArray: Array<string> = [];
let newObject = {};
let dependenciesObject = {};
let licensesObject = {};
let partsObject = {};
let providersObject = {};
let dataObject = {};

@Injectable()
export class Aosd3aosdService {
  aosd3ToAosd2Converter = (input: string, output: string) => {
    try {
      // Define input and output
      const inputPath = input;
      const outputPath = output;

      const inputData = fs.readFileSync(inputPath, { encoding: 'utf8' });
      // Convert JSON string to object
      const inputDataArray = JSON.parse(inputData);
      //console.log("TEST: ", inputDataArray);

      // Convert direct dependencies to strings
      const tempArray = [];
      for (let i = 0; i < inputDataArray['directDependencies'].length; i++) {
        tempArray.push(inputDataArray['directDependencies'][i].toString());
      }
      // Create new object header
      newObject = {
        $schema: './aosd.schema.json',
        directDependencies: tempArray,
        dependencies: [],
      };

      // Define components
      const componentsArray = inputDataArray['components'];

      // Loop over all components and subcomponents
      for (let i = 0; i < componentsArray.length; i++) {
        for (let j = 0; j < componentsArray[i]['subcomponents'].length; j++) {
          // Convert external dependencies to strings
          externalDependenciesArray = [];
          for (
            let k = 0;
            k < componentsArray[i]['transitiveDependencies'].length;
            k++
          ) {
            externalDependenciesArray.push(
              componentsArray[i]['transitiveDependencies'][k].toString(),
            );
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
              },
            },
            externalDependencies: externalDependenciesArray,
          };

          // Loop over every component
          componentsArray[i]['subcomponents'].map((part) => {
            if (part['subcomponentName'] === 'main') {
              // Create licenses object
              licensesObject = {
                name: part['license'],
                spdxId: part['spdxId'],
                text: part['licenseText'],
                url: part['licenseTextUrl'],
                copyrights: {
                  holders:
                    part['copyrights'].length > 0 ? part['copyrights'] : [],
                },
                origin: 'packagemanagement',
              };
            }
            // Create part object
            let partName = part['subcomponentName'];
            if (partName === 'main') {
              partName = 'default';
            }
            partName = partName.replace(" ","_");
            partsObject = {
              name: partName,
              description: '',
              providers: [],
              external: true,
            };

            //Create additional licenses

            // chanched naming for two linking items that must be merged
            let linkingType = componentsArray[i]['linking'];
            //"sys_call_dyn_link", -> "sys_call"
            if (componentsArray[i]['linking'] === 'sys_call') {
              linkingType = 'sys_call_dyn_link';
            }
            //"sys_call_process" -> "process_call",
            if (componentsArray[i]['linking'] === 'process_call') {
              linkingType = 'sys_call_process';
            }

            providersObject = {
              additionalLicenses: [],
              modified: componentsArray[i]['modified'],
              usage: linkingType,
            };
            // Create object for additional licenses data
            dataObject = {
              name: part['license'],
              spdxId: part['spdxId'],
              text: part['licenseText'],
              url: part['licenseTextUrl'],
              copyrights: {
                holders:
                  part['copyrights'].length > 0 ? part['copyrights'] : [],
                notice: '',
              },
              origin: 'packagemanagement',
            };
            //Push data into the new object
            partsObject['providers'].push(providersObject);
            providersObject['additionalLicenses'].push(dataObject);
            dependenciesObject['parts'].push(partsObject);
          });
        }
        //Push data into the new object
        dependenciesObject['licenses'].push(licensesObject);
        newObject['dependencies'].push(dependenciesObject);
      }

      // Write new JSON format
      fs.writeFileSync(outputPath, JSON.stringify(newObject, null, '\t'));
      return newObject;
    } catch (error) {
      console.log("DEBUG-ERROR", error);
      return {};
    }
  };
}
