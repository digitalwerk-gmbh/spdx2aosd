const fs = require('fs');
require('dotenv').config();
import { validateAosd } from "./aosdvalidator";
import { validateSpdx } from "./spdxvalidator";
import { LicenseDataObject, ExtractedLicense, MappedLicense, AosdObject, AosdComponent, AosdSubComponent, SpdxPackages, SpdxFiles, SpdxRelationsships, SpdxIdToInternalId, exportMapper } from "../interfaces/interfaces";
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';
let counter: number = 1;
let licenseData: LicenseDataObject;
let idMapping: Array<exportMapper> = [];
let errorMessages: Array<string> = [];

export const convertSpdx = async (cliArgument: string): Promise<void> => {
    try {
        // Check update status of licenses
        if (fs.existsSync(process.env.LICENSE_FILE_PATH)) {
            const checkData = fs.readFileSync(process.env.LICENSE_FILE_PATH);
            licenseData = JSON.parse(checkData);
        } else {
            throw new Error("The licenses.json file is missing! - Please generate the licenses file before running this script!");
        }

        // Set file paths
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;

        // First validate input spdx file
        const validationSpdxResult = validateSpdx(cliArgument);
        //console.log(validationSpdxResult);

        // Read the input spdx json file
        let jsonInputFile = fs.readFileSync(inputJsonPath);
        let jsonInputArray = JSON.parse(jsonInputFile);

        // Collect license id and license text
        let licenseTextMap: Array<MappedLicense> = [];
        jsonInputArray['hasExtractedLicensingInfos'].forEach((licenseInfo: ExtractedLicense) => {
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
            if (filteredText.length > 3) {
                return filteredText;
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
        dependenciesArray.forEach((spdxBlock: SpdxPackages, index: number) => {
            let spdxb: SpdxIdToInternalId = {
                SPDXID : spdxBlock.SPDXID,
                internalId: counter + index,
            }
            spdxIdToInternalIdMap.push(spdxb);
        });

        // Get transitive dependencies for a given component ID
        const relationships: Array<SpdxRelationsships> = jsonInputArray['relationships'];
        const getTransitiveDependencies = (componentId: string, relationships: Array<SpdxRelationsships>) => {
                const transDepsIds: Array<String> = []; 
                relationships.forEach((rel: SpdxRelationsships) => { 
                if (rel.spdxElementId === componentId) {
                    if (rel.relationshipType === 'DEPENDS_ON' || rel.relationshipType === 'DYNAMIC_LINK' || rel.relationshipType === 'STATIC_LINK') {
                        transDepsIds.push(rel.relatedSpdxElement);
                    }
                } else if (rel.relatedSpdxElement === componentId) {
                    if (rel.relationshipType === 'DEPENDENCY_OF') {
                        transDepsIds.push(rel.spdxElementId);
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
            relationships.forEach(rel => {
                if (rel.spdxElementId === componentId && rel.relationshipType === "OTHER" && !rel.comment) {
                    errorMessages.push(`Comment "MODIFIED" is missing for relationshipType "OTHER" in component ${componentId}`);
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
        dependenciesArray.forEach((dependency: SpdxPackages) => {
            const mappingObject: exportMapper = {
                mapId: counter,
                originalId: dependency.SPDXID,
            };

            idMapping.push(mappingObject);

            let componentObject: AosdComponent = {
                id: Number(mappingObject.mapId),
                componentName: dependency['name'],
                componentVersion: dependency['versionInfo'],
                scmUrl: dependency['downloadLocation'],
                modified: isModified(dependency['SPDXID'], relationships) ? true : false,
                linking: getLinkingType(dependency['SPDXID'], relationships),
                transitiveDependencies: getTransitiveDependencies(dependency['SPDXID'], relationships),
                subcomponents: [],
            };

            if (!componentObject.componentName) {
                errorMessages.push(`Component name is missing for component with ID ${mappingObject.mapId}`);
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

            // Iterate over files
            dependency['hasFiles'].forEach((fileId: String, index: number) => {
                const fileData: Array<SpdxFiles> = filesArray.filter(file => file.SPDXID === fileId);
                let licenseText = "";
                let spdxKey = fileData[0].licenseConcluded;
                spdxKey = spdxKey.replaceAll("(", "").replaceAll(")", "");
    
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
    
                conjunctionMappings.forEach(mapping => {
                    if (spdxKey.includes(mapping.key)) {
                        spdxKey = spdxKey.replaceAll(mapping.key, "#");
                        conjunctions.push(mapping.value);
                    }
                });
    
                const tempLicenses = spdxKey.split("#");
                tempLicenses.forEach((license, index) => {
                    if (index > 0) {
                        const conjunction = conjunctions[index - 1];
                        licenseText += `\n\n${conjunction}\n\n`;
                    }
                    const text = getLicenseText(license);
                    licenseText += text;
                });
    
                let subcomponentObject: AosdSubComponent = {
                    subcomponentName: index === 0 ? "main" : fileData[0].fileName,
                    spdxId: fileData[0].licenseConcluded,
                    copyrights: fileData[0].copyrightText !== "NOASSERTION" ? [fileData[0].copyrightText] : [],
                    authors: [],
                    licenseText: licenseText.trim(),
                    licenseTextUrl: "",
                    selectedLicense: fileData[0].licenseComments?.replace("chosen: ", "").trim() || "",
                    additionalLicenseInfos: ""
                };
                componentObject['subcomponents'].push(subcomponentObject);
            });
            newObject['components'].push(componentObject);
            counter++;
        });

        // Add direct dependencies
        newObject.directDependencies = newObject.components.map(component => component.id);

        // Rewrite ids of transitive dependencies 
        const remapIds = (componentId: String) => {
            const filteredId = idMapping.filter(id => id.originalId === componentId);
            return filteredId[0].mapId;
        };

        // Remove transitive dependencies from direct dependencies
        const transitiveDependencies = new Set();
        newObject.components.forEach(component => {
            let tmpId: number = 0;
            let tmpIdArray: Array<number> = [];
            for (let i=0; i < component.transitiveDependencies.length; i++) {
                tmpId = remapIds(component.transitiveDependencies[i].toString());
                tmpIdArray.push(tmpId);
            }   
            component.transitiveDependencies = tmpIdArray;       
            transitiveDependencies.add(Number(tmpId));       
        });

        // Genral - think over!
        // Remove all ids in directDependencies that can be found in transitiveDependencies
        newObject.directDependencies = newObject.directDependencies.filter(id => !transitiveDependencies.has(id));

        // Prepare output file
        const outputFileName: string = cliArgument.replace(".json", "") + "_aosd2.1" + ".json";
        outputFile = outputJsonPath + outputFileName;

        // Write data to aosd json format
        fs.writeFileSync(outputFile, JSON.stringify(newObject, null, '\t'));

        // Validate the aosd json result 
        const validationAosdResult = validateAosd(outputFileName);
        //console.log(validationAosdResult);
        
        // Check for errors
        if (errorMessages.length > 0) {
            console.error("Errors found during processing:");
            errorMessages.forEach(error => console.error(error));
        }

        console.log("We are done! - Thank's for using spdx to aosd converter!");
    } catch(error: any) {
        console.error(error);
    }    
}    
