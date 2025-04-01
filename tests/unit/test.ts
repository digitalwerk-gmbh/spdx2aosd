import * as fs from "fs";
import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { convertDown } from '../../src/downconverter';
import { convertUp } from '../../src/upconverter';
import { convertSpdx } from "../../src/spdxconverter";
import { accumulate } from "../../src/accumulate";
import { getUniqueValues, getMultibleUsedIds, getMissingComponentIds, generateDataValidationMessage, generateUniqueSubcomponentName, generateStringFromJsonObject, validateDependencies, validateSPDXIds, validateSelectedLicenseForDualLicenses, validateLicenseTextUrl, validateComponentsForModificationAndLinking } from '../../src/helper';

describe("Test for helper functions", () => {
    test('Test getUniqueValues exists', async () => {
        expect(getUniqueValues).toBeDefined();
    });

    test('Test - 01 getUniqueValues works as expected', async () => {
        const testArray1: Array<number> = [1,2,3,4,5,6,7,7,6,5,10];
        const response = getUniqueValues(testArray1);
        expect(response).toContain(1);
        expect(response).toContain(2);
        expect(response).toContain(3);
        expect(response).toContain(4);
        expect(response).toContain(5);
        expect(response).toContain(6);
        expect(response).toContain(7);
        expect(response).toContain(10);
        expect(response.length).toBe(8);
    });

    test('Test - 02 getUniqueValues works as expected', async () => {
        const testArray1: Array<number> = [1,2,1];
        const response = getUniqueValues(testArray1);
        expect(response).toContain(1);
        expect(response).toContain(2);
        expect(response.length).toBe(2);
    });

    test('Test getMultibleUsedIds exists', async () => {
        expect(getMultibleUsedIds).toBeDefined();
    });

    test('Test - 01 getMultibleUsedIds works as expected', async () => {
        const testArray1: Array<number> = [1,2,3,4,5,6,7];
        const testArray2: Array<number> = [1,5,8,9,10];
        const response = getMultibleUsedIds(testArray1, testArray2);
        expect(response).toContain(1);
        expect(response).toContain(5);
        expect(response.length).toBe(2);
    });

    test('Test - 02 getMultibleUsedIds works as expected', async () => {
        const testArray1: Array<number> = [1,2,3,4,5,6,7,7,6,5,10];
        const testArray2: Array<number> = [10];
        const response = getMultibleUsedIds(testArray1, testArray2);
        expect(response).toContain(10);
        expect(response.length).toBe(1);
    });

    test('Test getMissingComponentIds exists', async () => {
        expect(getMissingComponentIds).toBeDefined();
    });

    test('Test - 01 getMissingComponentIds works as expected', async () => {
        const testArray1: Array<number> = [1,2,3];
        const testArray2: Array<number> = [4,5,6];
        const testArray3: Array<number> = [1,2,3,4,5,6,7,8];
        const response = getMissingComponentIds(testArray1, testArray2, testArray3);
        expect(response).toContain(7);
        expect(response).toContain(8);
        expect(response.length).toBe(2);
    });

    test('Test - 02 getMissingComponentIds works as expected', async () => {
        const testArray1: Array<number> = [1,2,3];
        const testArray2: Array<number> = [4,5,6];
        const testArray3: Array<number> = [1,2,3,4,5,6];
        const response = getMissingComponentIds(testArray1, testArray2, testArray3);
        expect(response.length).toBe(0);
    });    

    test('Test - 01 generateDataValidationMessage works as expected', async () => {
        const testArray1: Array<string> = [
            'Warning: incompatibility with linking      - component name: test_component_4 - subcomponent: main', 
            'Warning: incompatibility with linking      - component name: test_component_4 - subcomponent: subcomponent_4_2',
            'Warning: incompatibility with linking      - component name: test_component_4 - subcomponent: main',
            'Warning: incompatibility with linking      - component name: test_component_4 - subcomponent: subcomponent_4_2',
            'Warning: incompatibility with modification - component name: test_component_6 - subcomponent: main',
            'Warning: incompatibility with linking      - component name: test_component_6 - subcomponent: main',
            'Warning: incompatibility with modification - component name: test_component_6 - subcomponent: subcomponent_6_2',
            'Warning: incompatibility with linking      - component name: test_component_6 - subcomponent: subcomponent_6_2',
            'Warning: incompatibility with modification - component name: test_component_7 - subcomponent: main',
            'Warning: incompatibility with modification - component name: test_component_7 - subcomponent: subcomponent_7_2'
        ];
        const response = generateDataValidationMessage(testArray1);
        expect(response).toContain('test_component_4 - subcomponent: main');
    });

    test('Test generateUniqueSubcomponentName exists', async () => {
        expect(generateUniqueSubcomponentName).toBeDefined();
    });

    test('Test - 01 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 1;
        const adlCount: number = 1;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 1;
        const partName: string = 'default';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('main');
    });

    test('Test - 02 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 1;
        const adlCount: number = 2;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 1;
        const partName: string = 'default';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('main');
    });

    test('Test - 03 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 2;
        const adlCount: number = 2;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 1;
        const partName: string = 'default';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('main');
    });

    test('Test - 04 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 1;
        const adlCount: number = 1;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 1;
        const partName: string = 'default';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('main');
    });

    test('Test - 05 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 1;
        const adlCount: number = 1;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 10;
        const partName: string = 'test_subcomponent';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('test_subcomponent_10');
    });

    test('Test - 06 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 1;
        const adlCount: number = 2;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 11;
        const partName: string = 'test_subcomponent';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('MIT_11');
    });

    test('Test - 07 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 2;
        const adlCount: number = 1;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 12;
        const partName: string = 'test_subcomponent';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('test_subcomponent_12');
    });

    test('Test - 08 generateUniqueSubcomponentName works as expected', async () => {
        const partsCount: number  = 2;
        const adlCount: number = 2;
        const mainCount: number = 0;
        const uniqueNameCounter: number = 3;
        const partName: string = 'test_subcomponent';
        const licenseName: string = 'MIT';
        const response = generateUniqueSubcomponentName(partsCount, adlCount, mainCount, uniqueNameCounter, partName, licenseName);
        expect(response).toBe('test_subcomponent_MIT_3');
    });

    test('Test - 09 generateStringFromJsonObject works as expected', async () => {
        const path = './tests/data/input/aosd2.1_jsonObject.json';
        const jsonObject = JSON.parse(fs.readFileSync(path, 'utf8')); 
        const response = await generateStringFromJsonObject(jsonObject);
        expect(response).toContain('"externalId": "myOwnId",');
    });

    test('Test validateDependencies exists', async () => {
        expect(validateDependencies).toBeDefined();
    });

    test('Test validateDependencies works as expected for direct dependencies', async () => {
        const directDependencies = [1, 2, 3];
        const components = [
            { id: 1, name: 'component_1' },
            { id: 3, name: 'component_3' },
            { id: 5, name: 'component_5' },
        ];
        const dependencyType = "direct dependency";
        const response = validateDependencies(directDependencies, components, dependencyType);
        expect(response).toContain("Warning: direct dependency with id 2 does not correspond to any component");
        expect(response).not.toContain("Warning: direct dependency with id 1 does not correspond to any component");
        expect(response).not.toContain("Warning: direct dependency with id 3 does not correspond to any component");
        expect(response.length).toBe(1); 
    });

    test('Test validateDependencies works as expected for transitive dependencies', async () => {
        const transitiveDependencies = ["6", "7"];
        const components = [
           { id: "1", name: 'component_1', transitiveDependencies: ["6", "8"] },
           { id: "2", name: 'component_2', transitiveDependencies: ["9"] },
        ];
        const dependencyType = "transitive dependency";
    
        const allTransitiveDependencies = components
        .flatMap(component => component.transitiveDependencies || [])
        .map(dep => ({ id: dep }));
    
        const response = validateDependencies(transitiveDependencies, allTransitiveDependencies, dependencyType);
        expect(response).toContain("Warning: transitive dependency with id 7 does not correspond to any component");
        expect(response).not.toContain("Warning: transitive dependency with id 6 does not correspond to any component");
        expect(response.length).toBe(1); 
    });

    describe('validateSPDXIds', () => {
       const validSPDXKeys = new Set(['MIT', 'Apache-2.0', 'GPL-3.0']);
  
       it('should return a warning for invalid SPDX keys in spdxIds', () => {
          const spdxIds = ['MIT', 'LicenseRef-1'];
          const messages = validateSPDXIds(spdxIds, validSPDXKeys, 'test_component', 'test_subcomponent');
  
          expect(messages).toContain("Warning: invalid SPDX key(s) - 'LicenseRef-1' - component name: test_component - subcomponent: test_subcomponent");
          expect(messages.length).toBe(1);
       });
  
       it('should not return a warning if all SPDX keys are valid', () => {
         const spdxIds = ['MIT', 'Apache-2.0'];
         const messages = validateSPDXIds(spdxIds, validSPDXKeys, 'test_component', 'test_subcomponent');
  
         expect(messages.length).toBe(0);
       });
  
       it('should return a warning for an invalid selectedLicense', () => {
         const spdxIds = ['MIT'];
         const selectedLicense = 'Mit';
         const messages = validateSPDXIds(spdxIds, validSPDXKeys, 'test_component', 'test_subcomponent', selectedLicense);
  
         expect(messages).toContain("Warning: invalid SPDX key in selectedLicense 'Mit' - component name: test_component - subcomponent: test_subcomponent");
         expect(messages.length).toBe(1);
       });
  
       it('should not return a warning if selectedLicense is valid', () => {
         const spdxIds = ['MIT'];
         const selectedLicense = 'Apache-2.0';
         const messages = validateSPDXIds(spdxIds, validSPDXKeys, 'test_component', 'test_subcomponent', selectedLicense);
  
         expect(messages.length).toBe(0);
       });
    });

    describe('validateSelectedLicenseForDualLicenses', () => {
      it('should be defined', () => {
        expect(validateSelectedLicenseForDualLicenses).toBeDefined();
      });
  
      it('should return a warning if spdxId contains "OR" and selectedLicense is empty', () => {
        const componentsArray = [
          {
           componentName: 'component1',
            subcomponents: [
              { spdxId: 'MIT OR GPL-3.0', subcomponentName: 'subcomponent1', selectedLicense: '' },
            ],
          },
        ];
        const validationResults: Array<string> = [];
        validateSelectedLicenseForDualLicenses(componentsArray, validationResults);
  
        expect(validationResults).toContain(
          "Warning: dual-license detected - component name: component1 - subcomponent: subcomponent1. Please specify a selectedLicense."
        );
        expect(validationResults.length).toBe(1);
      });
  
      it('should not return a warning if selectedLicense is populated', () => {
        const componentsArray = [
          {
            componentName: 'component2',
            subcomponents: [
              { spdxId: 'MIT OR GPL-3.0', subcomponentName: 'subcomponent2', selectedLicense: 'MIT' },
            ],
          },
        ];
        const validationResults: Array<string> = [];
        validateSelectedLicenseForDualLicenses(componentsArray, validationResults);
  
        expect(validationResults.length).toBe(0);
      });
    });

    describe('validateLicenseTextUrl based on scanned field', () => {
        const componentsArray = [
          {
            componentName: 'component1',
            scanned: false,
            subcomponents: [
              { subcomponentName: 'subcomponent1', licenseTextUrl: '' },
              { subcomponentName: 'subcomponent2', licenseTextUrl: 'http://example.com' }
            ]
          },
          {
            componentName: 'component2',
            scanned: true,
            subcomponents: [
              { subcomponentName: 'subcomponent3', licenseTextUrl: '' }, 
              { subcomponentName: 'subcomponent4', licenseTextUrl: 'http://example.com' } 
            ]
          }
        ];
      
        it('should return a warning if licenseTextUrl is missing and scanned is false', () => {
          const validationResults: any[] = [];
      
          componentsArray.forEach(component => {
            component.subcomponents.forEach(subcomponent => {
              if (!subcomponent.licenseTextUrl && component.scanned === false) {
                validationResults.push(
                  `Warning: licenseTextUrl in component ${component.componentName} - subcomponent ${subcomponent.subcomponentName} is a required field.`
                );
              }
            });
          });
      
          expect(validationResults).toContain(
            "Warning: licenseTextUrl in component component1 - subcomponent subcomponent1 is a required field."
          );
          expect(validationResults.length).toBe(1); 
        });
    });

    describe('validate components for modification and linking based on subcomponent spdx key', () => {
      const modification_linkingKeys = {
        modification: ['bzip2-1.0.6', 'Font-exception-2.0','LGPL-2.1-only'],
        linking: ['MPL-2.0-no-copyleft-exception','SSPL-1.0','Font-exception-2.0'],
      };
    
      beforeEach(() => {
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(modification_linkingKeys));
      });
    
      afterEach(() => {
        jest.restoreAllMocks();
      });
      it('should generate warnings for null modification and linking properties', () => {
        const componentsArray = [
          {
            componentName: 'component1',
            modified: null,
            linking: null,
            subcomponents: [
              { spdxId: 'bzip2-1.0.6', subcomponentName: 'subcomponent1' },
              { spdxId: 'Font-exception-2.0', subcomponentName: 'subcomponent2' },
              { spdxId: 'SSPL-1.0', subcomponentName: 'subcomponent3' },
            ],
          },
          {
            componentName: 'component2',
            modified: true,
            linking: null,
            subcomponents: [
              { spdxId: 'LGPL-2.1-only', subcomponentName: 'subcomponent3' },
            ],
          },
          {
            componentName: 'component3',
            modified: null,
            linking: 'dynamic',
            subcomponents: [
              { spdxId: 'MPL-2.0-no-copyleft-exception', subcomponentName: 'subcomponent4' },
            ],
          },
        ];
    
        const validationResults: Array<string> = [];
        validateComponentsForModificationAndLinking(componentsArray, validationResults);
    
        expect(validationResults).toContain(
          "Warning: due to the presence of SPDX key 'bzip2-1.0.6' in component 'component1' - subcomponent 'subcomponent1', the 'modification' property cannot be null."
        );
        expect(validationResults).toContain(
          "Warning: due to the presence of SPDX key 'Font-exception-2.0' in component 'component1' - subcomponent 'subcomponent2', the 'modification' property cannot be null."
        );
        expect(validationResults).toContain(
          "Warning: due to the presence of SPDX key 'Font-exception-2.0' in component 'component1' - subcomponent 'subcomponent2', the 'linking' property cannot be null."
        );
        expect(validationResults).toContain(
          "Warning: due to the presence of SPDX key 'SSPL-1.0' in component 'component1' - subcomponent 'subcomponent3', the 'linking' property cannot be null."
        );
        expect(validationResults).not.toContain(
          "Warning: due to the presence of SPDX key 'LGPL-2.1-only' in component 'component2' - subcomponent 'subcomponent3', the 'modification' property cannot be null."
        );
        expect(validationResults).not.toContain(
          "Warning: due to the presence of SPDX key 'MPL-2.0-no-copyleft-exception' in component 'component3' - subcomponent 'subcomponent4', the 'linking' property cannot be null."
        );
        expect(validationResults.length).toBe(6);
      });
    });
});

describe("AOSD2.1 to AOSD2.0 converter test", () => {
    test('Test convertDown exists', async () => {
        expect(convertDown).toBeDefined();
    });

    test('Test convertDown works as expected', async () => {

        const response = convertDown('aosd2.1_import.json');
        const path = './tests/data/input/aosd2.1_import.json';
        const resultFile = './tests/data/output/aosd2.1_import_aosd2.0.json';
        const testDataArray = JSON.parse(fs.readFileSync(resultFile, 'utf8')); 
        expect(fs.existsSync(path)).toBe(true);
        expect(fs.existsSync(resultFile)).toBe(true);
        expect(testDataArray["$schema"]).toBeDefined();
        expect(testDataArray["$schema"]).toBe("./aosd.schema.json");
        expect(testDataArray["directDependencies"]).toBeDefined();
        expect(testDataArray["directDependencies"]).not.toContain("5");
        expect(testDataArray["directDependencies"]).toContain("1");
        expect(testDataArray["directDependencies"]).toContain("3");
        expect(testDataArray.dependencies[0]["id"]).toBeDefined();
        expect(testDataArray.dependencies[0]["id"]).toBe("1");
        expect(testDataArray.dependencies[0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[0]["name"]).toBe("test_component_1");
        expect(testDataArray.dependencies[0]["version"]).toBeDefined();
        expect(testDataArray.dependencies[0]["version"]).toBe("7.0.3");
        expect(testDataArray.dependencies[0]["versionRange"]).toBeDefined();
        expect(testDataArray.dependencies[0]["versionRange"]).toBe("7.0.3");
        expect(testDataArray.dependencies[0]["scmUrl"]).toBeDefined();
        expect(testDataArray.dependencies[0]["scmUrl"]).toBe("https://registry.npmjs.org/test_comonent_1/test_comonent_1.tgz");
        expect(testDataArray.dependencies[0].licenses).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["name"]).toBe("main");
        expect(testDataArray.dependencies[0].licenses[0]["spdxId"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["spdxId"]).toBe("GFDL-1.2-or-later");
        expect(testDataArray.dependencies[0].licenses[0]["text"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["text"]).toContain(" Permission is granted to copy, distribute and/or modify this document\n    under the terms of the GNU Free Documentation License, Version 1.2\n    or any later version published by the Free Software Foundation;\n\n                GNU Free Documentation License\n                  Version 1.2, November 2002\n\n\n Copyright (C) 2000,2001,2002  Free Software Foundation, Inc.\n     51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA\n");
        expect(testDataArray.dependencies[0].licenses[0]["url"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["url"]).toBe("https://testpackages/texturl/generated");
        expect(testDataArray.dependencies[0].licenses[0]["copyrights"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["copyrights"]["holders"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["copyrights"]["holders"][0]).toBe("Copyright (c) 2017 Adam Generic");
        expect(testDataArray.dependencies[0].licenses[0]["copyrights"]["notice"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["copyrights"]["notice"]).toBe("");
        expect(testDataArray.dependencies[0].licenses[0]["origin"]).toBeDefined();
        expect(testDataArray.dependencies[0].licenses[0]["origin"]).toBe("packagemanagement");
        expect(testDataArray.dependencies[0].parts).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["name"]).toBe("default");
        expect(testDataArray.dependencies[0].parts[0]["description"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["description"]).toBe("");
        expect(testDataArray.dependencies[0].parts[0]["providers"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["name"]).toBe("GFDL-1.2-or-later");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["spdxId"]).toBe("GFDL-1.2-or-later");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["text"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["text"]).toContain("The purpose of this License is to make a manual, textbook, or other\nfunctional and useful document \"free\" in the sense of freedom: to\nassure everyone the effective freedom to copy and redistribute it,\nwith or without modifying it, either commercially or noncommercially.");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["url"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["url"]).toBe("https://testpackages/texturl/generated");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["holders"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["holders"][0]).toBe("Copyright (c) 2017 Adam Generic");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["notice"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["notice"]).toBe("");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["origin"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["additionalLicenses"][0]["origin"]).toBe("packagemanagement");
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["modified"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["modified"]).toBeTruthy();
        expect(testDataArray.dependencies[0].parts[0]["providers"][0]["usage"]).toBeDefined();
        //expect(testDataArray.dependencies[0].parts[0]["providers"][0]["usage"]).toBe("dynamic_linking");
        expect(testDataArray.dependencies[0].parts[0]["external"]).toBeDefined();
        expect(testDataArray.dependencies[0].parts[0]["external"]).toBeTruthy();
        expect(testDataArray.dependencies[0].deployPackage).toBeDefined();
        expect(testDataArray.dependencies[0].deployPackage["name"]).toBeDefined();
        expect(testDataArray.dependencies[0].deployPackage["name"]).toBe("default");
        expect(testDataArray.dependencies[0].deployPackage["downloadUrl"]).toBeDefined();
        expect(testDataArray.dependencies[0].deployPackage["downloadUrl"]).toBe("");
        expect(testDataArray.dependencies[0].deployPackage["checksums"]).toBeDefined();
        expect(testDataArray.dependencies[0].deployPackage["checksums"]["integrity"]).toBeDefined();
        expect(testDataArray.dependencies[0].deployPackage["checksums"]["integrity"]).toBe("");
        expect(testDataArray.dependencies[0].externalDependencies).toBeDefined();
        expect(testDataArray.dependencies[0].externalDependencies[0]).toContain("6");
        expect(testDataArray.dependencies[9]["id"]).toBe("10");
        expect(testDataArray.dependencies[9]["name"]).toBeDefined();
        expect(testDataArray.dependencies[9]["name"]).toBe("test_component_10");
        expect(testDataArray.dependencies[9]["version"]).toBeDefined();
        expect(testDataArray.dependencies[9]["version"]).toBe("7.0.3");
        expect(testDataArray.dependencies[9]["versionRange"]).toBeDefined();
        expect(testDataArray.dependencies[9]["versionRange"]).toBe("7.0.3");
        expect(testDataArray.dependencies[9]["scmUrl"]).toBeDefined();
        expect(testDataArray.dependencies[9]["scmUrl"]).toBe("https://registry.npmjs.org/test_comonent_10/test_comonent_10.tgz");
        expect(testDataArray.dependencies[9].licenses).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["name"]).toBe("main");
        expect(testDataArray.dependencies[9].licenses[0]["spdxId"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["spdxId"]).toBe("LicenseRef-scancode-yensdesign");
        expect(testDataArray.dependencies[9].licenses[0]["text"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["text"]).toBe("license: Feel free to use it, but keep this credits please!\n");
        expect(testDataArray.dependencies[9].licenses[0]["url"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["url"]).toBe("https://testpackages/texturl/generated");
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]["holders"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]["holders"][0]).toContain("Copyright (c) 2022-2023 Another Array Generic One");
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]["holders"][1]).toContain("Copyright (c) 2017-2018,2021,2022,2023 Another Array Generic Two");
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]["notice"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["copyrights"]["notice"]).toBe("");
        expect(testDataArray.dependencies[9].licenses[0]["origin"]).toBeDefined();
        expect(testDataArray.dependencies[9].licenses[0]["origin"]).toBe("packagemanagement");
        expect(testDataArray.dependencies[9].parts).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["name"]).toBe("default");
        expect(testDataArray.dependencies[9].parts[0]["description"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["description"]).toBe("");
        expect(testDataArray.dependencies[9].parts[0]["providers"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["name"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["name"]).toBe("LicenseRef-scancode-yensdesign");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["spdxId"]).toBe("LicenseRef-scancode-yensdesign");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["text"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["text"]).toBe("license: Feel free to use it, but keep this credits please!\n");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["url"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["url"]).toBe("https://testpackages/texturl/generated");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["holders"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["holders"][0]).toContain("Copyright (c) 2022-2023 Another Array Generic One");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["holders"][1]).toContain("Copyright (c) 2017-2018,2021,2022,2023 Another Array Generic Two");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["notice"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["copyrights"]["notice"]).toBe("");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["origin"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["additionalLicenses"][0]["origin"]).toBe("packagemanagement");
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["modified"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["modified"]).toBeFalsy();
        expect(testDataArray.dependencies[9].parts[0]["providers"][0]["usage"]).toBeDefined();
        //expect(testDataArray.dependencies[9].parts[0]["providers"][0]["usage"]).toBe("dynamic_linking");
        expect(testDataArray.dependencies[9].parts[0]["external"]).toBeDefined();
        expect(testDataArray.dependencies[9].parts[0]["external"]).toBeTruthy();
        expect(testDataArray.dependencies[9].deployPackage).toBeDefined();
        expect(testDataArray.dependencies[9].deployPackage["name"]).toBeDefined();
        expect(testDataArray.dependencies[9].deployPackage["name"]).toBe("default");
        expect(testDataArray.dependencies[9].deployPackage["downloadUrl"]).toBeDefined();
        expect(testDataArray.dependencies[9].deployPackage["downloadUrl"]).toBe("");
        expect(testDataArray.dependencies[9].deployPackage["checksums"]).toBeDefined();
        expect(testDataArray.dependencies[9].deployPackage["checksums"]["integrity"]).toBeDefined();
        expect(testDataArray.dependencies[9].deployPackage["checksums"]["integrity"]).toBe("");
        expect(testDataArray.dependencies[9].externalDependencies).toBeDefined();
        expect(testDataArray.dependencies[9].externalDependencies.length).toBe(0);
    });
});

describe("AOSD2.0 to AOSD2.1 converter test", () => {
    test('Test convertUp exists', async () => {
        expect(convertUp).toBeDefined();
    });

    test('Test convertUp works as expected', async () => {

        const response = convertUp('aosd2.0_import.json');
        const path = './tests/data/input/aosd2.0_import.json';
        const resultFile = './tests/data/output/aosd2.0_import_aosd2.1.json';
        const testDataArray = JSON.parse(fs.readFileSync(resultFile, 'utf8')); 
        expect(fs.existsSync(path)).toBe(true);
        expect(fs.existsSync(resultFile)).toBe(true);
        expect(testDataArray["schemaVersion"]).toBeDefined();
        expect(testDataArray["schemaVersion"]).toBe("2.1.0");
        expect(testDataArray["externalId"]).toBeDefined();
        expect(testDataArray["externalId"]).toBe("");
        expect(testDataArray["scanned"]).toBeDefined();
        expect(testDataArray["scanned"]).toBeTruthy();
        expect(testDataArray["directDependencies"]).toBeDefined();
        expect(testDataArray["directDependencies"]).not.toContain(2);
        expect(testDataArray["directDependencies"]).toContain(1);
        expect(testDataArray["directDependencies"]).toContain(8);
        expect(testDataArray.components[0]["id"]).toBeDefined();
        expect(testDataArray.components[0]["id"]).toBe(1);
        expect(testDataArray.components[0]["componentName"]).toBeDefined();
        expect(testDataArray.components[0]["componentName"]).toBe("cross-env");
        expect(testDataArray.components[0]["componentVersion"]).toBeDefined();
        expect(testDataArray.components[0]["componentVersion"]).toBe("7.0.3");
        expect(testDataArray.components[0]["scmUrl"]).toBeDefined();
        expect(testDataArray.components[0]["scmUrl"]).toBe("https://registry.npmjs.org/cross-env/-/cross-env-7.0.3.tgz");
        expect(testDataArray.components[0]["modified"]).toBeDefined();
        expect(testDataArray.components[0]["modified"]).toBeFalsy();
        expect(testDataArray.components[0]["linking"]).toBeDefined();
        expect(testDataArray.components[0]["linking"]).toBe("dynamic_linking");
        expect(testDataArray.components[0]["transitiveDependencies"]).toBeDefined();
        expect(testDataArray.components[0]["transitiveDependencies"]).toContain(2);
        expect(testDataArray.components[0]["subcomponents"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBe("main");
        expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBe("MIT");
        expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["copyrights"][0]).toBe("Copyright (c) 2017 Kent C. Dodds");
        expect(testDataArray.components[0]["subcomponents"][0]["authors"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["authors"].length).toBe(0);
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBe("The MIT License (MIT)");
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBe("http://opensource.org/licenses/mit-license.php");
        expect(testDataArray.components[13]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][4]["licenseTextUrl"]).toBe("http://fedoraproject.org/wiki/Licensing:MIT#Old_Style_with_legal_disclaimer_2");
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
        expect(testDataArray.components[13]["id"]).toBeDefined();
        expect(testDataArray.components[13]["id"]).toBe(14);
        expect(testDataArray.components[13]["componentName"]).toBeDefined();
        expect(testDataArray.components[13]["componentName"]).toBe("which");
        expect(testDataArray.components[13]["componentVersion"]).toBeDefined();
        expect(testDataArray.components[13]["componentVersion"]).toBe("2.0.2");
        expect(testDataArray.components[13]["scmUrl"]).toBeDefined();
        expect(testDataArray.components[13]["scmUrl"]).toBe("https://registry.npmjs.org/which/-/which-2.0.2.tgz");
        expect(testDataArray.components[13]["modified"]).toBeDefined();
        expect(testDataArray.components[13]["modified"]).toBeFalsy();
        expect(testDataArray.components[13]["linking"]).toBeDefined();
        expect(testDataArray.components[13]["linking"]).toBe("dynamic_linking");
        expect(testDataArray.components[13]["transitiveDependencies"]).toBeDefined();
        expect(testDataArray.components[13]["transitiveDependencies"]).toContain(5);
        expect(testDataArray.components[13]["subcomponents"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["subcomponentName"]).toBe("main");
        expect(testDataArray.components[13]["subcomponents"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["spdxId"]).toBe("ISC");
        expect(testDataArray.components[13]["subcomponents"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["copyrights"].length).toBe(0);
        expect(testDataArray.components[13]["subcomponents"][0]["authors"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["authors"].length).toBe(0);
        expect(testDataArray.components[13]["subcomponents"][0]["licenseText"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["licenseText"]).toBe("* isc license");
        expect(testDataArray.components[13]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["licenseTextUrl"]).toBe("http://fedoraproject.org/wiki/Licensing:MIT#Old_Style_with_legal_disclaimer_2");
        expect(testDataArray.components[13]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[13]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[13]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
    });
});

describe("Converter Tests", () => {
    test('Test convertSpdx to be defined', async () => {
        expect(convertSpdx).toBeDefined();
    });
    test('Test convertSpdx function works as expected', async () => {
        const response = await convertSpdx('test_group_spec_spdx.json');
        const path = './tests/data/input/test_group_spec_spdx.json';
        const resultFile = './tests/data/output/test_group_spec_spdx_aosd2.1.json';
        const testDataArray = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
        expect(fs.existsSync(path)).toBe(true);
        expect(fs.existsSync(resultFile)).toBe(true);
        expect(testDataArray["schemaVersion"]).toBeDefined();
        expect(testDataArray["schemaVersion"]).toBe("2.1.0");
        expect(testDataArray["externalId"]).toBeDefined();
        expect(testDataArray["externalId"]).toBe("");
        expect(testDataArray["scanned"]).toBeDefined();
        expect(testDataArray["scanned"]).toBeTruthy();
        expect(testDataArray["directDependencies"]).toBeDefined();
        expect(testDataArray["directDependencies"]).not.toContain(5);
        expect(testDataArray["directDependencies"]).toContain(1);
        expect(testDataArray.components[0]["id"]).toBeDefined();
        expect(testDataArray.components[0]["id"]).toBe(1);
        expect(testDataArray.components[0]["componentName"]).toBeDefined();
        expect(testDataArray.components[0]["componentName"]).toBe("alpha-orange");
        expect(testDataArray.components[0]["componentVersion"]).toBeDefined();
        expect(testDataArray.components[0]["componentVersion"]).toBe("4.2.0");
        expect(testDataArray.components[0]["scmUrl"]).toBeDefined();
        expect(testDataArray.components[0]["scmUrl"]).toBe("https://localhost/package-1");
        expect(testDataArray.components[0]["modified"]).toBeDefined();
        expect(testDataArray.components[0]["modified"]).toBeFalsy();
        expect(testDataArray.components[0]["linking"]).toBeDefined();
        expect(testDataArray.components[0]["linking"]).toBe("dynamic_linking");
        expect(testDataArray.components[0]["transitiveDependencies"]).toBeDefined();
        expect(testDataArray.components[0]["transitiveDependencies"]).toContain(2);
        expect(testDataArray.components[0]["subcomponents"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBe("main");
        expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBe("BSD-3-Clause");
        expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["copyrights"].length).toBe(0);
        expect(testDataArray.components[0]["subcomponents"][0]["authors"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["authors"].length).toBe(0);
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBe("Redistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list\nof conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this\nlist of conditions and the following disclaimer in the documentation and/or\nother materials provided with the distribution.\n\nNeither the name of the ORGANIZATION nor the names of its contributors may be\nused to endorse or promote products derived from this software without specific\nprior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS\nBE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE\nGOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)\nHOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT\nLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF\nTHE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.Redistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list\nof conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this\nlist of conditions and the following disclaimer in the documentation and/or\nother materials provided with the distribution.\n\nNeither the name of the ORGANIZATION nor the names of its contributors may be\nused to endorse or promote products derived from this software without specific\nprior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS\nBE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE\nGOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)\nHOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT\nLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF\nTHE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.");
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toContain("AFFERO GENERAL PUBLIC LICENSE\n\nVersion 1, March 2002\n\nCopyright");
        expect(testDataArray.components[0]["subcomponents"][2]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][2]["additionalLicenseInfos"]).toBe("Apache Commons Lang\\nCopyright 2001-2011\nThe Apache SoKware Founda\"on\\n\\nThis\nproduct includes soKware developed by\\nThe\nApache SoKware Founda\"on\n(h<p://www.apache.org/).\\n\\nThis product\nincludes soKware from the Spring\nFramework,\\nunder the Apache License 2.0 (see:\nStringU\"ls.containsWhitespace())");
        expect(testDataArray.components[0]["subcomponents"][3]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][3]["selectedLicense"]).toBe("BSD-3-Clause");
        expect(testDataArray.components[0]["subcomponents"][4]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][4]["selectedLicense"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][5]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][5]["selectedLicense"]).toBe("");
        expect(testDataArray.components[2]["subcomponents"][0]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["subcomponentName"]).toBe("main");
        expect(testDataArray.components[2]["subcomponents"][0]["spdxId"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["spdxId"]).toBe("BSD-3-Clause");
        expect(testDataArray.components[2]["subcomponents"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["copyrights"]).toHaveLength(0);
        expect(testDataArray.components[2]["subcomponents"][0]["authors"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["authors"].length).toBe(0);
        expect(testDataArray.components[2]["subcomponents"][0]["licenseText"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["licenseText"]).toBe("Redistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list\nof conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this\nlist of conditions and the following disclaimer in the documentation and/or\nother materials provided with the distribution.\n\nNeither the name of the ORGANIZATION nor the names of its contributors may be\nused to endorse or promote products derived from this software without specific\nprior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS\nBE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE\nGOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)\nHOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT\nLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF\nTHE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.");
        expect(testDataArray.components[2]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["licenseTextUrl"]).toBe("");
        expect(testDataArray.components[2]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[2]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[2]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
        expect(testDataArray.components[3]["subcomponents"][0]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[3]["subcomponents"][0]["subcomponentName"]).toBe("main");
        expect(testDataArray.components[3]["subcomponents"][0]["copyrights"]).toBeDefined();
        expect(testDataArray.components[3]["subcomponents"][0]["copyrights"][0]).toBe("2014 - 2016 Real Logic Ltd.");
        expect(testDataArray.components[3]["subcomponents"][1]["subcomponentName"]).toBeDefined();
        expect(testDataArray.components[3]["subcomponents"][1]["subcomponentName"]).toBe("pom.xml");
        expect(testDataArray.components[3]["subcomponents"][1]["copyrights"]).toBeDefined();
        expect(testDataArray.components[3]["subcomponents"][1]["copyrights"]).toHaveLength(0);
    });
});

describe("Accumulate Tests", () => {
  test('Test accumulate function to be defined', async () => {
      expect(accumulate).toBeDefined();
  });
  test('Test accumulate function works as expected', async () => {
    const response = await accumulate('aosd2.1_json_accumulate.json');
    const path = './tests/data/input/aosd2.1_json_accumulate.json';
    const resultFile = './tests/data/output/aosd2.1_json_accumulate_accumulated.json';
    const testDataArray = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
    expect(fs.existsSync(path)).toBe(true);
    expect(fs.existsSync(resultFile)).toBe(true);
    expect(fs.existsSync(path)).toBe(true);
    expect(fs.existsSync(resultFile)).toBe(true);
    expect(testDataArray["schemaVersion"]).toBeDefined();
    expect(testDataArray["schemaVersion"]).toBe("2.1.0");
    expect(testDataArray["externalId"]).toBeDefined();
    expect(testDataArray["externalId"]).toBe("myOwnId");
    expect(testDataArray["scanned"]).toBeDefined();
    expect(testDataArray["scanned"]).toBeTruthy();
    expect(testDataArray["directDependencies"]).toBeDefined();
    expect(testDataArray["directDependencies"]).toContain(1);
    expect(testDataArray["directDependencies"]).toContain(2);
    expect(testDataArray["directDependencies"]).toContain(3);
    expect(testDataArray.components[0]["id"]).toBeDefined();
    expect(testDataArray.components[0]["id"]).toBe(1);
    expect(testDataArray.components[0]["componentName"]).toBeDefined();
    expect(testDataArray.components[0]["componentName"]).toBe("test_component_1");
    expect(testDataArray.components[0]["componentVersion"]).toBeDefined();
    expect(testDataArray.components[0]["componentVersion"]).toBe("1.0.0");
    expect(testDataArray.components[0]["scmUrl"]).toBeDefined();
    expect(testDataArray.components[0]["scmUrl"]).toBe("https://registry.npmjs.org/test_component_1/test_component_1.tgz");
    expect(testDataArray.components[0]["modified"]).toBeDefined();
    expect(testDataArray.components[0]["modified"]).toBeTruthy();
    expect(testDataArray.components[0]["linking"]).toBeDefined();
    expect(testDataArray.components[0]["linking"]).toBe("dynamic_linking");
    expect(testDataArray.components[0]["transitiveDependencies"]).toBeDefined();
    expect(testDataArray.components[0]["transitiveDependencies"]).toContain(4);
    expect(testDataArray.components[0]["subcomponents"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["subcomponentName"]).toBe("main");
    expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["copyrights"].length).toBe(3);
    expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2017 Adam Generic");
    expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2018 Adam Generic");
    expect(testDataArray.components[0]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2019 Adam Generic");
    expect(testDataArray.components[0]["subcomponents"][0]["authors"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["authors"].length).toBe(0);
    expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBe("GFDL-1.2 text for testing");
    expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][1]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["subcomponentName"]).toBe("test_component_1/subcomponent_4_4");
    expect(testDataArray.components[0]["subcomponents"][1]["spdxId"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[0]["subcomponents"][1]["copyrights"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["copyrights"].length).toBe(1);
    expect(testDataArray.components[0]["subcomponents"][1]["copyrights"]).toContain("Copyright (c) 2020 Adam Generic");
    expect(testDataArray.components[0]["subcomponents"][1]["authors"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["authors"].length).toBe(0);
    expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toBe("GFDL-1.2 text for testing but different");
    expect(testDataArray.components[0]["subcomponents"][1]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[0]["subcomponents"][1]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["selectedLicense"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][1]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][1]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][2]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["subcomponentName"]).toBe("test_component_1/subcomponent_5_5");
    expect(testDataArray.components[0]["subcomponents"][2]["spdxId"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["spdxId"]).toBe("MIT");
    expect(testDataArray.components[0]["subcomponents"][2]["copyrights"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["copyrights"].length).toBe(2);
    expect(testDataArray.components[0]["subcomponents"][2]["copyrights"]).toContain("Copyright (c) 2020 Adam Green");
    expect(testDataArray.components[0]["subcomponents"][2]["copyrights"]).toContain("Copyright (c) 2021 Adam Green");
    expect(testDataArray.components[0]["subcomponents"][2]["authors"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["authors"].length).toBe(0);
    expect(testDataArray.components[0]["subcomponents"][2]["licenseText"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["licenseText"]).toBe("MIT text for testing");
    expect(testDataArray.components[0]["subcomponents"][2]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[0]["subcomponents"][2]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["selectedLicense"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][2]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][2]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][3]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["subcomponentName"]).toBe("test_component_1/subcomponent_7_7");
    expect(testDataArray.components[0]["subcomponents"][3]["spdxId"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["spdxId"]).toBe("Apache-2.0");
    expect(testDataArray.components[0]["subcomponents"][3]["copyrights"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["copyrights"].length).toBe(1);
    expect(testDataArray.components[0]["subcomponents"][3]["copyrights"]).toContain("Copyright (c) 2025 Mark Twain");
    expect(testDataArray.components[0]["subcomponents"][3]["authors"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["authors"].length).toBe(0);
    expect(testDataArray.components[0]["subcomponents"][3]["licenseText"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["licenseText"]).toBe("Apache-2.0 text for testing");
    expect(testDataArray.components[0]["subcomponents"][3]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[0]["subcomponents"][3]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["selectedLicense"]).toBe("");
    expect(testDataArray.components[0]["subcomponents"][3]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[0]["subcomponents"][3]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[1]["id"]).toBeDefined();
    expect(testDataArray.components[1]["id"]).toBe(2);
    expect(testDataArray.components[1]["componentName"]).toBeDefined();
    expect(testDataArray.components[1]["componentName"]).toBe("test_component_2");
    expect(testDataArray.components[1]["componentVersion"]).toBeDefined();
    expect(testDataArray.components[1]["componentVersion"]).toBe("2.0.0");
    expect(testDataArray.components[1]["scmUrl"]).toBeDefined();
    expect(testDataArray.components[1]["scmUrl"]).toBe("https://registry.npmjs.org/test_component_2/test_component_2.tgz");
    expect(testDataArray.components[1]["modified"]).toBeDefined();
    expect(testDataArray.components[1]["modified"]).toBeTruthy();
    expect(testDataArray.components[1]["linking"]).toBeDefined();
    expect(testDataArray.components[1]["linking"]).toBe("dynamic_linking");
    expect(testDataArray.components[1]["transitiveDependencies"]).toBeDefined();
    expect(testDataArray.components[1]["transitiveDependencies"].length).toBe(0);
    expect(testDataArray.components[1]["subcomponents"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["subcomponentName"]).toBe("main");
    expect(testDataArray.components[1]["subcomponents"][0]["spdxId"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[1]["subcomponents"][0]["copyrights"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["copyrights"].length).toBe(3);
    expect(testDataArray.components[1]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2017 Adam Generic");
    expect(testDataArray.components[1]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2018 Adam Generic");
    expect(testDataArray.components[1]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2019 Adam Generic");
    expect(testDataArray.components[1]["subcomponents"][0]["authors"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["authors"].length).toBe(0);
    expect(testDataArray.components[1]["subcomponents"][0]["licenseText"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["licenseText"]).toBe("GFDL-1.2 text for testing");
    expect(testDataArray.components[1]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[1]["subcomponents"][0]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["selectedLicense"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][1]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["subcomponentName"]).toBe("test_component_2/subcomponent_4_4");
    expect(testDataArray.components[1]["subcomponents"][1]["spdxId"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[1]["subcomponents"][1]["copyrights"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["copyrights"].length).toBe(1);
    expect(testDataArray.components[1]["subcomponents"][1]["copyrights"]).toContain("Copyright (c) 2020 Adam Generic");
    expect(testDataArray.components[1]["subcomponents"][1]["authors"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["authors"].length).toBe(0);
    expect(testDataArray.components[1]["subcomponents"][1]["licenseText"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["licenseText"]).toBe("GFDL-1.2 text for testing but different");
    expect(testDataArray.components[1]["subcomponents"][1]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[1]["subcomponents"][1]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["selectedLicense"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][1]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][1]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][2]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["subcomponentName"]).toBe("test_component_2/subcomponent_5_5");
    expect(testDataArray.components[1]["subcomponents"][2]["spdxId"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["spdxId"]).toBe("MIT");
    expect(testDataArray.components[1]["subcomponents"][2]["copyrights"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["copyrights"].length).toBe(2);
    expect(testDataArray.components[1]["subcomponents"][2]["copyrights"]).toContain("Copyright (c) 2020 Adam Green");
    expect(testDataArray.components[1]["subcomponents"][2]["copyrights"]).toContain("Copyright (c) 2021 Adam Green");
    expect(testDataArray.components[1]["subcomponents"][2]["authors"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["authors"].length).toBe(0);
    expect(testDataArray.components[1]["subcomponents"][2]["licenseText"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["licenseText"]).toBe("MIT text for testing");
    expect(testDataArray.components[1]["subcomponents"][2]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[1]["subcomponents"][2]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["selectedLicense"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][2]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][2]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][3]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["subcomponentName"]).toBe("test_component_2/subcomponent_7_7");
    expect(testDataArray.components[1]["subcomponents"][3]["spdxId"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["spdxId"]).toBe("Apache-2.0");
    expect(testDataArray.components[1]["subcomponents"][3]["copyrights"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["copyrights"].length).toBe(1);
    expect(testDataArray.components[1]["subcomponents"][3]["copyrights"]).toContain("Copyright (c) 2025 Mark Twain");
    expect(testDataArray.components[1]["subcomponents"][3]["authors"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["authors"].length).toBe(0);
    expect(testDataArray.components[1]["subcomponents"][3]["licenseText"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["licenseText"]).toBe("Apache-2.0 text for testing");
    expect(testDataArray.components[1]["subcomponents"][3]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[1]["subcomponents"][3]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["selectedLicense"]).toBe("");
    expect(testDataArray.components[1]["subcomponents"][3]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[1]["subcomponents"][3]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[2]["id"]).toBeDefined();
    expect(testDataArray.components[2]["id"]).toBe(3);
    expect(testDataArray.components[2]["componentName"]).toBeDefined();
    expect(testDataArray.components[2]["componentName"]).toBe("test_component_3");
    expect(testDataArray.components[2]["componentVersion"]).toBeDefined();
    expect(testDataArray.components[2]["componentVersion"]).toBe("3.0.0");
    expect(testDataArray.components[2]["scmUrl"]).toBeDefined();
    expect(testDataArray.components[2]["scmUrl"]).toBe("https://registry.npmjs.org/test_component_3/test_component_3.tgz");
    expect(testDataArray.components[2]["modified"]).toBeDefined();
    expect(testDataArray.components[2]["modified"]).toBeTruthy();
    expect(testDataArray.components[2]["linking"]).toBeDefined();
    expect(testDataArray.components[2]["linking"]).toBe("dynamic_linking");
    expect(testDataArray.components[2]["transitiveDependencies"]).toBeDefined();
    expect(testDataArray.components[2]["transitiveDependencies"].length).toBe(0);
    expect(testDataArray.components[2]["subcomponents"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["subcomponentName"]).toBe("main");
    expect(testDataArray.components[2]["subcomponents"][0]["spdxId"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[2]["subcomponents"][0]["copyrights"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["copyrights"].length).toBe(1);
    expect(testDataArray.components[2]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2021 Adam Generic");
    expect(testDataArray.components[2]["subcomponents"][0]["authors"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["authors"].length).toBe(1);
    expect(testDataArray.components[2]["subcomponents"][0]["authors"]).toContain("Adam Generic");
    expect(testDataArray.components[2]["subcomponents"][0]["licenseText"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["licenseText"]).toBe("GFDL-1.2 text for testing");
    expect(testDataArray.components[2]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[2]["subcomponents"][0]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["selectedLicense"]).toBe("");
    expect(testDataArray.components[2]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[2]["subcomponents"][1]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["subcomponentName"]).toBe("test_component_3/subcomponent_4_4");
    expect(testDataArray.components[2]["subcomponents"][1]["spdxId"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["spdxId"]).toBe("GFDL-1.2-or-later");
    expect(testDataArray.components[2]["subcomponents"][1]["copyrights"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["copyrights"].length).toBe(1);
    expect(testDataArray.components[2]["subcomponents"][1]["copyrights"]).toContain("Copyright (c) 2020 Adam Generic");
    expect(testDataArray.components[2]["subcomponents"][1]["authors"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["authors"].length).toBe(0);
    expect(testDataArray.components[2]["subcomponents"][1]["licenseText"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["licenseText"]).toBe("GFDL-1.2 text for testing but different");
    expect(testDataArray.components[2]["subcomponents"][1]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[2]["subcomponents"][1]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["selectedLicense"]).toBe("");
    expect(testDataArray.components[2]["subcomponents"][1]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[2]["subcomponents"][1]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[3]["id"]).toBeDefined();
    expect(testDataArray.components[3]["id"]).toBe(4);
    expect(testDataArray.components[3]["componentName"]).toBeDefined();
    expect(testDataArray.components[3]["componentName"]).toBe("test_component_4");
    expect(testDataArray.components[3]["componentVersion"]).toBeDefined();
    expect(testDataArray.components[3]["componentVersion"]).toBe("4.0.0");
    expect(testDataArray.components[3]["scmUrl"]).toBeDefined();
    expect(testDataArray.components[3]["scmUrl"]).toBe("https://registry.npmjs.org/test_component_4/test_component_4.tgz");
    expect(testDataArray.components[3]["modified"]).toBeDefined();
    expect(testDataArray.components[3]["modified"]).toBeFalsy();
    expect(testDataArray.components[3]["linking"]).toBeDefined();
    expect(testDataArray.components[3]["linking"]).toBe("static_linking");
    expect(testDataArray.components[3]["transitiveDependencies"]).toBeDefined();
    expect(testDataArray.components[3]["transitiveDependencies"].length).toBe(0);
    expect(testDataArray.components[3]["subcomponents"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["subcomponentName"]).toBe("main");
    expect(testDataArray.components[3]["subcomponents"][0]["spdxId"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["spdxId"]).toBe("LicenseRef-scancode-unknown");
    expect(testDataArray.components[3]["subcomponents"][0]["copyrights"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["copyrights"].length).toBe(3);
    expect(testDataArray.components[3]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2017 Max Winter");
    expect(testDataArray.components[3]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2018 Roland Herbst");
    expect(testDataArray.components[3]["subcomponents"][0]["copyrights"]).toContain("Copyright (c) 2017 Helene Sommer");
    expect(testDataArray.components[3]["subcomponents"][0]["authors"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["authors"].length).toBe(2);
    expect(testDataArray.components[3]["subcomponents"][0]["authors"]).toContain("Max Winter");
    expect(testDataArray.components[3]["subcomponents"][0]["authors"]).toContain("Helene Sommer");
    expect(testDataArray.components[3]["subcomponents"][0]["licenseText"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["licenseText"]).toBe("LicenseRef-scancode-unknown text for test");
    expect(testDataArray.components[3]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[3]["subcomponents"][0]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["selectedLicense"]).toBe("");
    expect(testDataArray.components[3]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
    expect(testDataArray.components[3]["subcomponents"][1]["subcomponentName"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["subcomponentName"]).toBe("main_3");
    expect(testDataArray.components[3]["subcomponents"][1]["spdxId"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["spdxId"]).toBe("LicenseRef-scancode-unknown");
    expect(testDataArray.components[3]["subcomponents"][1]["copyrights"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["copyrights"].length).toBe(1);
    expect(testDataArray.components[3]["subcomponents"][1]["copyrights"]).toContain("Copyright (c) 2019 Helene Sommer");
    expect(testDataArray.components[3]["subcomponents"][1]["authors"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["authors"].length).toBe(1);
    expect(testDataArray.components[3]["subcomponents"][1]["authors"]).toContain("Helene Sommer");
    expect(testDataArray.components[3]["subcomponents"][1]["licenseText"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["licenseText"]).toBe("LicenseRef-scancode-unknown text for test but different");
    expect(testDataArray.components[3]["subcomponents"][1]["licenseTextUrl"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["licenseTextUrl"]).toBe("https://testpackages/texturl/generated");
    expect(testDataArray.components[3]["subcomponents"][1]["selectedLicense"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["selectedLicense"]).toBe("");
    expect(testDataArray.components[3]["subcomponents"][1]["additionalLicenseInfos"]).toBeDefined();
    expect(testDataArray.components[3]["subcomponents"][1]["additionalLicenseInfos"]).toBe("");
  });
});