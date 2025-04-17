const fs = require('fs');
const JSONStream = require('JSONStream');
require('dotenv').config();
import { validateAosd } from './aosdvalidator';
import { LicenseDataObject, ExtractedLicense, MappedLicense, AosdObject, AosdComponent, AosdSubComponent, SpdxPackages, SpdxFiles, SpdxRelationsships, SpdxIdToInternalId, exportMapper } from '../interfaces/interfaces';
import { generateDataValidationMessage, generateStringFromJsonObject, loadSPDXKeys, validateComponentsForModificationAndLinking, validateSelectedLicenseForDualLicenses, validateSPDXIds } from './helper';
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let counter: number = 1;
let licenseData: LicenseDataObject;
let idMapping: Array<exportMapper> = [];
let validationResults: Array<string> = [];
let tmpLicense: Array<ExtractedLicense> = [];
const COPYRIGHT_REPLACE_PATTERN: Array<string> = ["NOASSERTION", "NONE"];
export const convertSpdx = async (cliArgument: string): Promise<void> => {
    try {
        // Check update status of licenses
        if (fs.existsSync(process.env.LICENSE_FILE_PATH)) {
            const checkData = fs.readFileSync(process.env.LICENSE_FILE_PATH);
            licenseData = JSON.parse(checkData);
        } else {
            throw new Error('The licenses.json file is missing! - Please generate the licenses file before running this script!');
        }
        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        // First validate input aosd file
        const validationSpdxResult = validateAosd(process.env.INPUT_JSON_PATH + cliArgument, process.env.SPDX_JSON_SCHEME);
        // If the scheme validation returns errors add them to log
        if (validationSpdxResult.length > 0) {
            validationResults = validationResults.concat(validationSpdxResult);
        }
        validationResults.push('\n-----------------------------------------------------\nData-Validation errors:\n-----------------------------------------------------\n');
        // Read the input spdx json file
        let jsonInputFile = fs.readFileSync(inputJsonPath, { encoding: 'utf8' });
        let jsonInputArray = JSON.parse(jsonInputFile);
        // Collect license id and license text
        let licenseTextMap: Array<MappedLicense> = [];
        jsonInputArray['hasExtractedLicensingInfos']?.forEach((licenseInfo: ExtractedLicense) => {
            let mapl: MappedLicense = {
                licenseId: licenseInfo.licenseId,
                extractedText: licenseInfo.extractedText,
            }
            licenseTextMap.push(mapl);
        });
        // Get the license text from the licenses.json file if needed
        const getLicenseText = (licenseId: string) => {
            // Try to get the license text from the licenseTextMap
            let filteredText = licenseTextMap.filter(l => l.licenseId === licenseId)
            if (filteredText.length === 1) {
                return filteredText[0]['extractedText'];
            } else {
                // If not found, try to get the license text from jsonLicenseArray
                const licenseInfo  = licenseData.data.filter(license => license.spdx_license_key === licenseId);
                return licenseInfo.length > 0 ? licenseInfo[0].text : "";
            }
        };
        // Create new Aosd JSON Object
        let newObject: AosdObject  = {
            schemaVersion: '2.1.0',
            externalId: '',
            scanned: false,
            directDependencies: [],
            components: [],
        };
        // Convert SPDXIDs to internal Ids
        const dependenciesArray: Array<SpdxPackages> = jsonInputArray['packages'];
        const spdxIdToInternalIdMap: Array<SpdxIdToInternalId> = [];
        dependenciesArray?.forEach((spdxBlock: SpdxPackages, index: number) => {
            let spdxb: SpdxIdToInternalId = {
                SPDXID : spdxBlock.SPDXID,
                internalId: counter + index,
            }
            spdxIdToInternalIdMap.push(spdxb);
        });
        // Get transitive dependencies for a given component ID
        const relationships: Array<SpdxRelationsships> = jsonInputArray['relationships'];
        const getTransitiveDependencies = (componentId: string, relationships: Array<SpdxRelationsships>) => {
                const transDepsIds: Array<string> = [];
                relationships.forEach((rel: SpdxRelationsships) => {
                if (rel.spdxElementId === componentId) {
                    if (rel.relationshipType === 'DEPENDS_ON') {
                        transDepsIds.push(rel.relatedSpdxElement);
                    }
                }
                if (rel.relatedSpdxElement === componentId) {
                    if (rel.relationshipType === 'DEPENDENCY_OF') {
                        transDepsIds.push(rel.spdxElementId);
                    }
                }
                if (rel.spdxElementId === componentId) {
                    if ((rel.relationshipType === 'DYNAMIC_LINK' || rel.relationshipType === 'STATIC_LINK') && rel.relatedSpdxElement !== rel.spdxElementId) {
                        transDepsIds.push(rel.relatedSpdxElement);
                    }
                }
            });
            // Ensure id uniqueness
            return [...new Set(transDepsIds)];
        };
        // Get linking type for a given component ID
        const getLinkingType = (componentId: string, relationships: Array<SpdxRelationsships>) => {
            let linkingType = relationships.filter(rel => rel.spdxElementId === componentId)
            .map(rel => rel.relationshipType)
            .find(type => type === 'DYNAMIC_LINK' || type === 'STATIC_LINK');
            switch(linkingType) {
                case 'DYNAMIC_LINK': {
                    return "dynamic_linking";
                }
                case 'STATIC_LINK': {
                    return "static_linking";
                }
                    default: {
                    return null;
                }
            }
        };
        // Get file from package bekause hasFiles is depricated
        const getPackageFiles = (componentId: string, relationships: Array<SpdxRelationsships>) => {
            let linkingType = relationships.filter(rel => rel.spdxElementId === componentId && rel.relationshipType === 'CONTAINS')
            let filesArray: Array<string> = [];
            for (let fc=0; fc<linkingType.length; fc++) {
                filesArray.push(linkingType[fc]['relatedSpdxElement']);
            }
            return filesArray;
        }
        // Check modified value for a given component ID
        const isModified = (componentId: string, relationships: Array<SpdxRelationsships>) => {
            relationships?.forEach(rel => {
                if (rel.spdxElementId === componentId && rel.relationshipType === "OTHER" && !rel.comment) {
                    validationResults.push(`Comment "MODIFIED" is missing for relationshipType "OTHER" in component ${componentId}`);
                }
            });
            return relationships.some(rel => rel.spdxElementId === componentId && (rel.comment === "MODIFIED" || rel.comment === "FILE_MODIFIED"));
        };
        // Validate component ids vs directDependencies and transitiveDependencies
        const validateComponentIds = (component: AosdComponent, directDependencies: Array<number>): Array<number> => {
            const missingIds: Array<number> = [];
            return missingIds;
        }
        // Process each dependency
        dependenciesArray?.forEach((dependency: SpdxPackages) => {
            const mappingObject: exportMapper = {
                mapId: counter,
                originalId: dependency.SPDXID,
            };
            idMapping.push(mappingObject);
            let componentObject: AosdComponent = {
                id: Number(mappingObject.mapId),
                componentName: dependency['name'],
                componentVersion: dependency['versionInfo'],
                scmUrl: dependency['downloadLocation'] !== "NOASSERTION" ? dependency['downloadLocation'] : "",
                modified: isModified(dependency['SPDXID'], relationships) ? true : false,
                linking: getLinkingType(dependency['SPDXID'], relationships),
                transitiveDependencies: getTransitiveDependencies(dependency['SPDXID'], relationships),
                subcomponents: [],
            };
            if (!componentObject.componentName) {
                validationResults.push(`Component name is missing for component with ID ${mappingObject.mapId}`);
            }
             // Collect data from the spdx files array
            const filesArray: Array<SpdxFiles> = jsonInputArray['files'];
            // If we have no hasFiles Property we create one from relationships data
            if(!dependency.hasOwnProperty('hasFiles')) {
                dependency['hasFiles'] = getPackageFiles(dependency['SPDXID'], relationships);
            }
            // Check if we have file information
            if (dependency['hasFiles'].length > 0) {
                newObject.scanned = true;
            }

            const validSPDXKeys = loadSPDXKeys();
            // Check for licenseConcluded and create a subcomponent if it exists
            if (dependency.licenseConcluded && dependency.licenseConcluded !== 'NOASSERTION'  && dependency.licenseConcluded !== 'NONE' && !dependency.hasFiles.length) {
               let licenseText = getLicenseText(dependency.licenseConcluded);
               if (!COPYRIGHT_REPLACE_PATTERN.includes(dependency.copyrightText)) {
               }
               let subcomponentObject: AosdSubComponent = {
                  subcomponentName: "main",
                  spdxId: dependency.licenseConcluded,
                  copyrights: !COPYRIGHT_REPLACE_PATTERN.includes(dependency.copyrightText) && dependency.copyrightText !== null && dependency.copyrightText !== undefined ? [dependency.copyrightText] : [],
                  authors: [],
                  licenseText: licenseText.trim(),
                  licenseTextUrl: "",
                  selectedLicense: "",
                  additionalLicenseInfos: "",
               };
               componentObject['subcomponents'].push(subcomponentObject);
            }
            
            // Iterate over files
            dependency['hasFiles']?.forEach((fileId: String, index: number) => {
                const fileData: Array<SpdxFiles> = filesArray.filter(file => file.SPDXID === fileId);
                let licenseText = "";
                let spdxKey = fileData[0]?.licenseConcluded;
                spdxKey = spdxKey?.replaceAll("(", "").replaceAll(")", "");
                const conjunctions: Array<String> = [];
                const conjunctionMappings = [
                    { key: " AND ", value: "AND" },
                    { key: " and ", value: "AND" },
                    { key: " OR ", value: "OR" },
                    { key: " or ", value: "OR" },
                    { key: " WITH ", value: "WITH" },
                    { key: " with ", value: "WITH" },
                    { key: "-WITH-", value: "WITH" },
                    { key: "-with-", value: "WITH" },
                ];
                conjunctionMappings?.forEach(mapping => {
                    if (spdxKey?.includes(mapping.key)) {
                        spdxKey = spdxKey?.replaceAll(mapping.key, "#");
                        conjunctions.push(mapping.value);
                    }
                });
                const tempLicenses = spdxKey?.split("#");
                let currentComponentName = dependency['name'];
                
                const resolveSelectedLicense = (licenseComment: string, source: string = '') => {
                    const currentSubcomponentName = fileData[0]?.fileName;
                    // Return empty string if licenseComment is empty
                    if (!licenseComment?.trim()) return "";
                    // Check if the licenseComment exists in licenses.json
                    const spdxLicense = licenseData.data.find(license => license.spdx_license_key === licenseComment);
                    if (spdxLicense) return spdxLicense.spdx_license_key;
                    // Check in hasExtractedLicensingInfos if not found in licenses.json
                    const extractedLicense = jsonInputArray['hasExtractedLicensingInfos'].find((eInfo: { licenseId: string; }) => eInfo.licenseId === licenseComment);
                    if (extractedLicense) {
                        const isValidSpdxKey = licenseData.data.some(license => license.spdx_license_key === extractedLicense.name);
                        if (isValidSpdxKey) return extractedLicense.name;
                        return "";
                    }
                    // Log error if no valid key found in licenseComment
                    if (source === 'licenseComment') {
                        validationResults.push(`Warning: invalid SPDX key(s) in licenseComment - "${licenseComment}" - component name: ${currentComponentName} - subcomponent: ${currentSubcomponentName}`);
                    }
                    return "";
                };
                tempLicenses?.forEach((license, index) => {
                    if (index > 0) {
                        const conjunction = conjunctions[index - 1];
                        licenseText += `\n\n${conjunction}\n\n`;
                    }
                    const resolvedLicense = resolveSelectedLicense(license.replace("chosen: ", "").trim() || "");
                    licenseText += getLicenseText(resolvedLicense);
                    // maybe move this function to helper.ts
                    const text = getLicenseText(license.replace("chosen: ", "").trim() || "");
                    licenseText += text;
                });
                let tmpSpdxKey: string = fileData[0]?.licenseConcluded.replace("chosen: ", "").trim() || "";
                for (let k=0; k<tempLicenses?.length; k++) {
                    tmpLicense = jsonInputArray['hasExtractedLicensingInfos'].filter((eInfo: { licenseId: string; }) => eInfo.licenseId ===  tempLicenses[k]);
                    if (tmpLicense.length === 1) {
                        tmpSpdxKey = tmpSpdxKey.replace(tmpLicense[0]['licenseId'], tmpLicense[0]['name']);
                    }
                }
                // Update the selectedLicense based on licenseComments
                let selectedLicense = fileData[0]?.licenseComments?.replace("chosen: ", "").trim() || "";
                selectedLicense = resolveSelectedLicense(selectedLicense, 'licenseComment');
                // Determine copyright text to use
                let copyrightText = "";
                if (index === 0) {
                   // For the "main" subcomponent, check the package-level copyrightText if file-level copyrightText doesn't exist
                   copyrightText = fileData[0]?.copyrightText;
                   if (!copyrightText || COPYRIGHT_REPLACE_PATTERN.includes(copyrightText)) {
                      copyrightText = dependency.copyrightText;
                   }
                } else {
                    // For other subcomponents, only use file-level copyrightText
                    copyrightText = fileData[0]?.copyrightText;
                }
                let subcomponentObject: AosdSubComponent = {
                    subcomponentName: index === 0 ? "main" : fileData[0]?.fileName,
                    spdxId: tmpSpdxKey,
                    copyrights: !COPYRIGHT_REPLACE_PATTERN.includes(copyrightText) && copyrightText !== null && copyrightText !== undefined ? [copyrightText] : [],
                    authors: [],
                    licenseText: licenseText.trim(),
                    licenseTextUrl: "",
                    selectedLicense: selectedLicense,
                    additionalLicenseInfos: fileData[0]?.noticeText? fileData[0].noticeText : ""
                };
                componentObject['subcomponents'].push(subcomponentObject);

                // Validate spdxId
                const spdxValidationMessages = validateSPDXIds([tmpSpdxKey], validSPDXKeys, dependency.name, fileData[0]?.fileName);
                validationResults.push(...spdxValidationMessages);
            });
            newObject['components'].push(componentObject);
            counter++;
        });

        // Add direct dependencies
        newObject.directDependencies = newObject.components.map(component => component.id);

        // Validate modification and linking
        validateComponentsForModificationAndLinking(newObject.components, validationResults);

        // Validate selectedLicense
        validateSelectedLicenseForDualLicenses(newObject.components, validationResults);

        // Rewrite ids of transitive dependencies
        const remapIds = (componentId: String) => {
            const filteredId = idMapping.filter(id => id.originalId === componentId);
            return filteredId[0]?.mapId;
        };
        // Remove transitive dependencies from direct dependencies
        const transitiveDependencies = new Set();
        newObject.components?.forEach(component => {
            let tmpId: number = 0;
            let tmpIdArray: Array<number> = [];
            for (let i=0; i < component.transitiveDependencies.length; i++) {
                tmpId = remapIds(component.transitiveDependencies[i].toString());
                tmpIdArray.push(tmpId);
            }
            component.transitiveDependencies = tmpIdArray;
            transitiveDependencies.add(Number(tmpId));
            // Check for empty subcomponent arrays
            if (Object.keys(component.subcomponents).length === 0) {
                validationResults.push("We have found an empty subcomponent in component with componentName: " + component.componentName);
            }
        });
        // Remove all ids in directDependencies that can be found in transitiveDependencies
        newObject.directDependencies = newObject.directDependencies.filter(id => !transitiveDependencies.has(id));
        // Prepare output file
        const outputFileName: string = cliArgument.replace(".json", "") + "_aosd2.1" + ".json";
        outputFile = outputJsonPath + outputFileName;
        // Stringify
        const fileString = await generateStringFromJsonObject(newObject);
        fs.writeFileSync(outputFile, fileString);
        // Validate the aosd json result
        const validationAosdResult = validateAosd(process.env.OUTPUT_JSON_PATH + outputFileName, process.env.AOSD2_1_JSON_SCHEME);
        // If the scheme validation returns errors add them to log
        if (validationAosdResult.length > 0) {
            validationResults = validationResults.concat(validationAosdResult);
        }
        // Check for validation error
        const validationMessage: string = generateDataValidationMessage(validationResults);
        const result = fs.writeFileSync(process.env.LOG_FILE_PATH, validationMessage, { encoding: 'utf8' });
        // Display success message
        console.log("We are done! - Thank's for using spdx to aosd2.1 converter!");
    } catch(error: any) {
        console.log(error);
        console.log("Sorry for that - something went wrong! Please check the  file in the root folder for detailed information.");
    }
}
