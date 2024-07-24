import * as fs from "fs";
import { describe, expect, test } from '@jest/globals';
import { convertDown } from '../../src/downconverter';
import { convertUp } from '../../src/upconverter';
import { getUniqueValues, getMultibleUsedIds, getMissingComponentIds, generateDataValidationMessage } from '../../src/helper';

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

    test('Test generateDataValidationMessage exists', async () => {
        expect(generateDataValidationMessage).toBeDefined();
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
        expect(response).toContain('Data-Validation errors:');
    });

    test('Test - 02 generateDataValidationMessage works as expected', async () => {
        const testArray1: Array<string> = [''];
        const response = generateDataValidationMessage(testArray1);
        expect(response).toContain('Data-Validation errors:');
    });
});


describe("AOSD2.1 to AOSD2.0 converter test", () => {
    test('Test convertDown exists', async () => {
        expect(convertDown).toBeDefined();
    });

    test('Test convertDown works as expected', async () => {

        const response = convertDown('aosd2.1_import.json');
        console.log(response);
        const path = './tests/data/input/aosd2.1_import.json';
        const resultFile = './tests/data/output/aosd2.1_import_aosd2.0.json';
        const testDataArray = JSON.parse(fs.readFileSync(resultFile, 'utf8')); 
        expect(fs.existsSync(path)).toBe(true);
        expect(fs.existsSync(resultFile)).toBe(true);
        expect(testDataArray["schemaVersion"]).toBeDefined();
        expect(testDataArray["schemaVersion"]).toBe("2.1.0");
        expect(testDataArray["externalId"]).toBeDefined();
        expect(testDataArray["externalId"]).toBe("");
        expect(testDataArray["scanned"]).toBeDefined();
        expect(testDataArray["scanned"]).toBeFalsy();
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
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBe("Redistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list\nof conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this\nlist of conditions and the following disclaimer in the documentation and/or\nother materials provided with the distribution.\n\nNeither the name of the ORGANIZATION nor the names of its contributors may be\nused to endorse or promote products derived from this software without specific\nprior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS\nBE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE\nGOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)\nHOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT\nLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF\nTHE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.");
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toContain("AFFERO GENERAL PUBLIC LICENSE\n\nVersion 1, March 2002\n\nCopyright");
    });
});

describe("AOSD2.0 to AOSD2.1 converter test", () => {
    test('Test convertUp exists', async () => {
        expect(convertUp).toBeDefined();
    });

    test('Test convertUp works as expected', async () => {

        const response = convertUp('aosd2.0_import.json');
        console.log(response);
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
        expect(testDataArray["scanned"]).toBeFalsy();
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
        expect(testDataArray.components[0]["subcomponents"][0]["licenseText"]).toBe("Redistribution and use in source and binary forms, with or without modification,\nare permitted provided that the following conditions are met:\n\nRedistributions of source code must retain the above copyright notice, this list\nof conditions and the following disclaimer.\n\nRedistributions in binary form must reproduce the above copyright notice, this\nlist of conditions and the following disclaimer in the documentation and/or\nother materials provided with the distribution.\n\nNeither the name of the ORGANIZATION nor the names of its contributors may be\nused to endorse or promote products derived from this software without specific\nprior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,\nTHE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE\nARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS\nBE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\nCONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE\nGOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)\nHOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT\nLIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF\nTHE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.");
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["licenseTextUrl"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["selectedLicense"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][0]["additionalLicenseInfos"]).toBe("");
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toBeDefined();
        expect(testDataArray.components[0]["subcomponents"][1]["licenseText"]).toContain("AFFERO GENERAL PUBLIC LICENSE\n\nVersion 1, March 2002\n\nCopyright");
    });
});