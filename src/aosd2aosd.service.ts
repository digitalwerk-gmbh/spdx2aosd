import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

let newObject = {};
let componentObject = {};
let subcomponentObject = {};
let counter = 1;
const idMapping: Array<object> = [];

@Injectable()
export class Aosd2aosdService {
  aosd2ToAosd3Converter = (input: string, output: string) => {
    try {
      // Define input and output
      const inputPath = input;
      const outputPath = output;
      let tmpModified = [];
      let tmpLinking = [];

      const inputData = fs.readFileSync(inputPath, { encoding: 'utf8' });
      // Convert JSON string to object
      const inputDataArray = JSON.parse(inputData);

      // Define new object header
      newObject = {
        $schema: './aosd.schema2.0.0.json',
        schemaVersion: '2.0.0',
        externalId: '',
        scanned: true,
        versionName: '',
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
        componentObject = {
          id: mappingObject.componentId,
          componentName: dependenciesArray[i]['name'],
          componentVersion: dependenciesArray[i]['version'],
          scmUrl: dependenciesArray[i]['scmUrl'],
          modified: false,
          linking: '',
          usedSubcomponents: [],
          componentDependencies: dependenciesArray[i]['externalDependencies'],
          subcomponents: [],
        };

        // Loop over all subcomponents(parts)
        tmpModified = [];
        tmpLinking = [];
        for (let j = 0; j < dependenciesArray[i]['parts'].length; j++) {
          // Loop over providers
          dependenciesArray[i]['parts'][j]['providers'][0][
            'additionalLicenses'
          ].map((adl) => {
            // Create subcomponent object
            componentObject['usedSubcomponents'].push(j + 1);
            let tmpCopyright = [];
            if (adl.hasOwnProperty('copyrights')) {
              tmpCopyright = [adl['copyrights']['notice']];
            }
            subcomponentObject = {
              subId: j + 1,
              subcomponentName: dependenciesArray[i]['parts'][j]['name'],
              subcomponentDescription: dependenciesArray[i]['parts'][
                j
              ].hasOwnProperty('description')
                ? dependenciesArray[i]['parts'][j]['description']
                : '',
              license: adl['name'],
              spdxId: adl['spdxId'],
              copyrights: tmpCopyright,
              authors: [],
              licenseText: adl['text'],
              licenseTextUrl: adl['url'],
              permissionNotice: '',
              alternative: false,
            };
            // collect data from all parts of a component
            tmpModified.push(
              dependenciesArray[i]['parts'][j]['providers'][0]['modified'],
            );
            // collect data from all parts of a component
            tmpLinking.push(
              dependenciesArray[i]['parts'][j]['providers'][0]['usage'],
            );
            // Push data into new subcomponent object
            componentObject['subcomponents'].push(subcomponentObject);
            componentObject['usedSubcomponents'].push(
              Object.values(subcomponentObject)[0],
            );
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

      console.log("TEST: ", newObject['components']);

      // Convert strings to numbers in components
      for (let i = 0; i < newObject['components'].length; i++) {
        const id = newObject['components'][i].id;
        const findId = CheckValue(id, idMapping, 'componentId');
        newObject['components'][i].id = findId[0]['number'];

        const temporaryId = [];
        newObject['components'][i].componentDependencies.map((dep: any) => {
          const findId = CheckValue(dep, idMapping, 'componentId');
          temporaryId.push(findId[0]['number']);
        });
        newObject['components'][i].componentDependencies = temporaryId;
      }
      // Write new JSON format
      fs.writeFileSync(outputPath, JSON.stringify(newObject, null, '\t'));
      return newObject;
    } catch (error) {
      console.log('DEBUG: ', error.message);
      return {};
    }
  };
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
    console.log(error.message);
    return Object;
  }
  return Object;
};
