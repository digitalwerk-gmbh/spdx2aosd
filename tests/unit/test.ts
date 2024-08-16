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
        expect(response).toContain('test_component_4 - subcomponent: main');
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
