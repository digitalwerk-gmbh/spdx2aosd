# spdx2aosd: SPDX to AOSD converter with support for multiple AOSD formats

[Digitalwerk](https://www.digitalwerk.net) has developed the **spdx2aosd** converter for the AOSD ecosystem and made it available to the open-source community. This CLI tool enables easy and flexible conversion of various JSON data formats into the specified proprietary AOSD format. For additional support in reviewing and managing open-source licenses, please visit the [Digitalwerk EasyCheckOSS Service](https://easycheckoss.ai/).

## Features

- **License Data Generation:** Create a current JSON file with all SPDX and Scancode licenses.
- **Conversion Between AOSD Versions:** Convert proprietary AOSD JSON files between versions 2.0 and 2.1.
- **SPDX File Customization:** Convert SPDX 2.3 JSON files that meet the group requirements of Audi and Volkswagen into the proprietary AOSD 2.1 format.

## More Information

For detailed information on the group requirements of Audi and Volkswagen, see the `docs` folder.

## Getting Started

To set up and install this CLI tool locally on your device, please follow these four steps:

1. Open your CLI command-line tool (PowerShell, Visual Studio Code Terminal) and navigate to the folder where you want to install the tool.

2. Execute the following Git command:

   ```sh
   $ git clone https://gitlab.com/digitalwerk/tools/spdx2aosd.git
   ```

   After successfully cloning, navigate into the new **spdx2aosd** folder.

3. Create a new `.env` file from the existing `.env.example` file in the repository:

   ```sh
   $ cp .env.example .env
   ```

4. Finally, install the required dependencies for the converter using the npm command:

   ```sh
   $ npm install
   ```

5. Finally, run the test suites with the following command to ensure that no tests fail:

   ```sh
   $ npm run test
   ```

After completing these four steps, the CLI tool should be ready for use.

## Using the CLI Tool

The command-line interface (CLI) provides a series of commands. You can also run the unit tests to ensure that all scripts are functioning correctly. Below is an overview of all possible commands:

```sh
# Get the current license JSON file with SPDX identifiers.
# This script requires an internet connection.

$ npm run licenses

# Convert the JSON file from AOSD 2.0 to AOSD 2.1 format.

$ npm run up <filename>

# Convert the JSON file from AOSD 2.1 to AOSD 2.0 format.

$ npm run down <filename>

# Convert the SPDX 2.3 group-spec JSON to AOSD 2.1 JSON.

$ npm run spdx <filename>

# Accumulate data in a AOSD2.1 JSON file.

$ npm run accumulate <filename>

# Run unit tests for all converters.

$ npm run test
```

## Folder Structure of the spdx2aosd Converter

This is the folder structure and the files you should see after successful setup.

```
spdx2aosd
│	
└──data
│  │
│  └──input
│  │  .gitkeep
│  │
│  └──json
│  │  AOSD2.0_Importscheme_V2.0.0.json
│  │  AOSD2.1_Example_Json_Import_File_V2.1.0.json
│  │  AOSD2.1_Importscheme_V2.1.0.json
│  │  spdx-schema_original.json
│  │  spdx-schema.json
│  │  SPDXJSONExample-v2.3.spdx.json
│  │
│  └──licenses
│  │  licenses.json
│  │
│  └──output
│     .gitkeep
│	
└──docs
│  231102_GroupSpecification_1.1_DRAFT.pdf
│  KonzernFOSSPflichtfelder - SPDX Group Spec CycloneDX AOSD2.1.xlsx
│	
└──interfaces
│  interfaces.ts
│	
└──node_modules
│	
└──src
│  accumulate.ts
│  aosdvalidator.ts
│  downconverter.ts
│  helper.ts
│  licenses.ts
│  spdxconverter.ts
│  upconverter.ts
│	
└──tests
│  │
│  └──data
│  │   │
│  │   └──input
│  │   │  aosd2.0_import.json
│  │   │  aosd2.1_import.json
│  │   │  Example1-RELothMOD-RELcontainsFOSSreportSPDX2.3.spdx.json
│  │   │  Example2-RELfilemod-RELcontainsFOSSreportSPDX2.3.spdx.json
│  │   │  Example3-RELothMOD-hasFilesFOSSreportSPDX2.3.spdx.json
│  │   │  Example4-RELfilemod-hasFilesFOSSreportSPDX2.3.spdx.json
│  │   │  SPDXJSONExample-v2.3.spdx.json
│  │   │  test_group_spec_spdx.json
│  │   │  testFile.json
│  │   │
│  │   └──output
│  │      .gitkeep
│  │
│  └──unit
│     test.ts
│
.env 
.env.example
.gitignore
babel.config.cjs
error.log
jest.config.cjs
LICENSE.txt
main.ts
package-lock.json
package.json
README.md
tsconfig.json
```

## Important to Know

Note that when converting data from version 2.1 to version 2.0, there are some specific considerations to be aware of.

In AOSD 2.1, the fields `usage` and `linking` are conditionally mandatory, while they are mandatory in AOSD 2.0.

This means that if the values are `null` in AOSD 2.1, we cannot convert these values to anything other than `null` in AOSD 2.0. If someone attempts to import these fields with the value `null` in AOSD 2.0, an error will be triggered.

If you use the cumulative data feature, we recommend checking the results again thoroughly to ensure that you don't lose any data. This feature is currently provided as experimental.
If you use the experimental cumulative data feature the removed subcomponets will be listet in the error.log file. This might help if you double check the data.

## Detailed Warning and Error Messages

Warning and error messages will not be displayed in the console. Only a hint will be shown:

```sh
Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.
```

All findings and errors are recorded in a log file named `error.log`. This file is located in the root directory of the tool. There you will find detailed descriptions of errors or warnings.

### Warnings Explained

Warnings are not always errors but may indicate that you should review your JSON file for potential errors. A warning can also be acceptable in a specific case and ignored.

```sh
Warning: incompatibility with null value for modification - component name: ... - subcomponent: ...
```

Meaning:

For the AOSD 2.0 JSON schema, this is a mandatory field where `true` or `false` is expected. In the AOSD 2.1 JSON schema, the value can also be `null`, as it is optional. However, `null` cannot be converted to `true` or `false`. This information is needed. For detailed field descriptions, read the AOSD JSON schemas. Ignoring this warning will lead to an import error in AOSD!

```sh
Warning: incompatibility with null value for linking - component name: ... - subcomponent: ...
```

Meaning:

For the AOSD 2.0 JSON schema, this is a mandatory field where four enum values are expected. In the AOSD 2.1 JSON schema, the value can also be `null`, as it is optional. However, `null` cannot be converted to one of the four enum values that we expect. This information is needed. For detailed field descriptions, read the AOSD JSON schemas. Ignoring this warning will lead to an import error in AOSD!

```sh
Warning: we have found a possible circular dependency for - component name: ... - with id: ...
```

This warning indicates that you are using a component as both a direct and a transitive dependency. This can be correct and is not an error, but we want to draw your attention to check it. This will not lead to import errors!

```sh
Warning: we have found component(s) that is neither in direct dependencies nor in transitive dependencies - component id: ...
```

This warning indicates that you have generated data for a software component. However, the ID of this software component is neither in `directDependencies` nor in `transitiveDependencies`. This component will be ignored during AOSD import!

## Error Messages Explained

### Requirements for the spdx2aosd Converter

This spdx2aosd converter can only process SPDX 2.3 JSON files that meet the requirements of the group specifications from Audi and Volkswagen. The converter has been specifically developed for the group requirements. We only validate data fields described in this specification. We assume that the data in the SPDX 2.3 JSON file is already curated and correct.

### General Information about the spdx2aosd Converter

The reason for developing this converter is to allow you to convert SPDX 2.3 JSON files into the proprietary AOSD 2.1 JSON format to import the data into the AOSD tool.

To use the spdx2a

osd converter, you should first run the `licenses` command to generate a valid `licenses.json` file with current SPDX identifiers. The license command generates this license list with valid SPDX identifiers and license texts from two sources: the SPDX license list and the Scancode license database.

Once the `licenses.json` is generated, you can run the spdx2aosd converter.

### Description of the spdx2aosd Converter

This CLI command-line tool works in two steps.

It is recommended to always run step 1, the license command, first to generate a license file with current data from SPDX and Scancode. You should only skip step 1 if you have no internet connection to update the license list. In this case, the originally delivered license list will be used as a fallback.

After the license list has been updated or you have skipped this step, you should execute the conversion script.

## Roadmap

1. Fix the warning in strict mode in the unit tests
2. Improve error messages for validating the JSON schema
3. Improve error messages in general
4. Expand unit tests
5. Extend plausibility checks