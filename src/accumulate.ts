const fs = require('fs');
require('dotenv').config();
import { AosdObject, AosdComponent, AosdSubComponent } from '../interfaces/interfaces';
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let seenIds: Array<string> = [];
let tmpId: string = '';
let tmpCopyrights: Array<string> = [];
let tmpAuthors: Array<string> = [];
let tmpSubcomponents: Array<AosdSubComponent> = [];
let newSubcomponentsArray: Array<AosdSubComponent> = [];
let removedSubcomponents: string = '';
let removedCounter: number = 0;

export const accumulate = async (cliArgument: string): Promise<void> => {
    try {
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;

        // Read the input aosd json file
        const jsonInputFile = fs.readFileSync(inputJsonPath, { encoding: 'utf8' });
        const inputDataArray = JSON.parse(jsonInputFile);

        // Create new Aosd JSON Object
        let newObject: AosdObject  = {
            schemaVersion: '2.1.0',
            externalId: inputDataArray['externalId'],
            scanned: true,
            directDependencies: inputDataArray['directDependencies'],
            components: [],
        };

        // Define components
        const componentsArray = inputDataArray['components'];

        // Create subcomponent object
        let subcomponentsObject: Array<AosdSubComponent> = [];

        // Loop over all components and subcomponents
        for (let i = 0; i < componentsArray.length; i++) {
            // Initialise Array for every new component
            seenIds = [];
            newSubcomponentsArray = [];
            for (let j = 0; j < componentsArray[i]['subcomponents'].length; j++) {
                // Check for double content
                tmpId = componentsArray[i]['subcomponents'][j]['spdxId'] + componentsArray[i]['subcomponents'][j]['subcomponentName'];
                if (seenIds.includes(tmpId)) {
                    removedSubcomponents += '[' + componentsArray[i]['componentName'] + ']' + componentsArray[i]['subcomponents'][j]['subcomponentName'] + '\n';
                    removedCounter++;
                } else {
                    // Filter all subcomponents with same spdx and license text
                    tmpSubcomponents = componentsArray[i]['subcomponents'].filter((sc: { spdxId: any; licenseText: any; }) => {
                        return sc.spdxId === componentsArray[i]['subcomponents'][j]['spdxId'] && sc.licenseText === componentsArray[i]['subcomponents'][j]['licenseText']
                    });
                    tmpCopyrights = [];
                    tmpAuthors = [];
                    for (let k = 0; k < tmpSubcomponents.length; k++) {
                        tmpCopyrights = tmpCopyrights.concat(tmpSubcomponents[k]['copyrights']);
                        tmpAuthors = tmpAuthors.concat(tmpSubcomponents[k]['authors']);
                        tmpId = tmpSubcomponents[k]['spdxId'] + tmpSubcomponents[k]['subcomponentName'];
                        seenIds.push(tmpId);
                    }
                    let newSubcomponent = {
                        subcomponentName: componentsArray[i]['subcomponents'][j]['subcomponentName'], 
                        spdxId: componentsArray[i]['subcomponents'][j]['spdxId'], 
                        copyrights: [...new Set(tmpCopyrights)],
                        authors: [...new Set(tmpAuthors)],
                        licenseText: componentsArray[i]['subcomponents'][j]['licenseText'],
                        licenseTextUrl: componentsArray[i]['subcomponents'][j]['licenseTextUrl'],
                        selectedLicense: componentsArray[i]['subcomponents'][j]['selectedLicense'],
                        additionalLicenseInfos: componentsArray[i]['subcomponents'][j]['additionalLicenseInfos'],
                    };
                    newSubcomponentsArray.push(newSubcomponent);
                }
            }

            // Create component object
            let componentObject: AosdComponent = {
                id: componentsArray[i]['id'],
                componentName: componentsArray[i]['componentName'],
                componentVersion: componentsArray[i]['componentVersion'],
                scmUrl: componentsArray[i]['scmUrl'],
                modified: componentsArray[i]['modified'],
                linking: componentsArray[i]['linking'],
                transitiveDependencies: componentsArray[i]['transitiveDependencies'],
                subcomponents: [],
            }

            // Push data into new subcomponent object
            componentObject['subcomponents']=newSubcomponentsArray;
            newObject['components'].push(componentObject);
        }

        // Prepare output file
        const outputFileName: string = cliArgument.replace('.json', '') + '_accumulated' + '.json';
        outputFile = outputJsonPath + outputFileName;

        // Write data to aosd json format
        fs.writeFileSync(outputFile, JSON.stringify(newObject, null, '\t'));
        
        // Generate statistics for erro.log file
        
        // Input file data
        const istats = fs.statSync(inputJsonPath)
        const ifileSizeInBytes = istats.size;
        // Convert the file size to megabytes (optional)
        const ifileSizeInMegabytes = ifileSizeInBytes / (1024*1024);

        // Output file data
        const ostats = fs.statSync(outputFile)
        const ofileSizeInBytes = ostats.size;
        // Convert the file size to megabytes (optional)
        const ofileSizeInMegabytes = ofileSizeInBytes / (1024*1024);

        let logData: string = '';
        logData += '-----------------------------------------------------\nStatistics:\n-----------------------------------------------------\n';
        logData += 'Removed subcomponents:             ' + removedCounter + '\n';
        logData += 'approximate file size original:    ' + ifileSizeInMegabytes.toFixed(2) + ' MB\n';
        logData += 'approximate file size accumulated: ' + ofileSizeInMegabytes.toFixed(2) + ' MB\n';
        logData += '\n-----------------------------------------------------\nRemoved duplicate subcomponents:\n-----------------------------------------------------\n';
        logData += removedSubcomponents;
        const result = fs.writeFileSync(process.env.LOG_FILE_PATH, logData, { encoding: 'utf8' });
        // Display success message
        console.log('We are done! - Thank\'s for using aosd2.1 accumulation script!');


    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log('Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.');
    }
}
