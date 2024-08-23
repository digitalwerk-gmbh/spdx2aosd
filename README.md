# AOSDConverter

This is a converter for the aosd ecosystem.
It is an cli tool with different functionalities.
With this tool you will be able to generate an up to date json file with all spdx and scancode licenses.
With this cli tool you can convert proprietary aosd json input files from version 2.0 to 2.1 and vice versa from 2.1 to 2.0.
You can convert spdx2.3 json files that meet the requirements of the GroupSpecification of Audi and Volkswagen to proprietary aosd2.1 json files.
For detailed information of the GroupSpecification for Audi and Volkswagen see also the docs folder.

## Getting started

To setup and install this cli tool local on your device please follow the next 4 steps.

Open your CLI command line tool (Power Shell, Visual Code Terminal) and navigate into the folder where you want to install the tool.

Step 1:

Then run the following git command:


```sh
$ git clone https://gitlab.com/digitalwerk/checkoss/aosdtoaosdconverter.git

```

After the clone command was successful navigate into the new folder aosdtoaosdconverter.

Step 2:

In the next step run the following command to create a new .env file from the existing .env.example file in the repo.

```sh
$ cp .env.example .env

```

Step 3:

Next run the npm command to install the needed dependencies for the converter.

```sh
$ npm install

```

Step 4:

Finnaly run the test suites with the following command to check if no test is failing.

```sh
$ npm run test

```

After finsishing these 4 steps the cli tool converter should be ready for use.


## How to use the cli command tool

The command line tool (cli) offers a series of commands to run.
Also you can run the unit tests to check all the scripts work correct.
Here you find an overview of all possible commands.

```sh

# get up to date license json file with spdx identifiers

$ npm run licenses

# convert the json file from aosd2.0 to aosd2.1 format

$ npm run up <filename>

# convert the json file from aosd2.1 to aosd2.0 format

$ npm run down <filename>

# convert the spdx2.3 groupspec json to aosd2.1 json

$ npm run spdx <filename>

# run the unit test suites for all converters

$ npm run test

```

## AOSDConverter folder structure

This is the folder structure and the files you should see after succesful setup.

```
aosdtoaosdconverter
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
│  Mapping-AOSD-SPDX.xlsx
│	
└──interfaces
│  interfaces.ts
│	
└──node_modules 
│	
└──src
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

## Good to know

To note when converting data from version 2.1 to version 2.0 there are some particularities.

With the 2.1 and 2.0 there is a incompatibility with the data regarding the two paramaters usage (linking) and modification.

In AOSD2.1 these fields are conditionally mandatory and in the AOSD2.0 mandatory.

This means if the values null as ... is used in AOSD2.1 we have no chance to convert this value other than null to AOSD2.0. 
Means if someone trys to import this fileds with value null in AOSD2.0 it will throw an error.


## Detailed warning and error messages

The warning and error messages will not be displayed on the console. Only a hint will be shown like:

```sh

Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.

```

All the findings and errors will be written to a log file named error.log. This file can be found in the root of the tool
directory.

In this file you can find detailed descriptions for errors or warnings.


## Warning messages explained

Warnings are not always errors but will tell you to double check your json file for potential errors.

That means that a warning can also be fine in a special case or scenario and you can ingnore it.

With this warnings we only want to sensitize for possible pit falls.

```sh

Warning: incompatibility with null value for modification - component name: ... - subcomponent: ...

```

Meaning: 

For the AOSD2.0 JSON scheme this is a mamdatory field where true or false is expected.
In AOSD2.1 JSON scheme the value can also be null because it is optional. But null can not be convertet to true or false in this case. Means we need this information. For detailed field description please read the AOSD JSON schemes.
Ignoring this warning will lead to error on import in AOSD!
         

```sh

Warning: incompatibility with null value for linking - component name: ... - subcomponent: ...

```

Meaning: 

For the AOSD2.0 JSON scheme this is a mamdatory field where 4 enum values are expected.
In AOSD2.1 JSON scheme the value can also be null because it is optional. But null can not be convertet to one of the 4 enum values we expect. Means we need this information here. For detailed field description please read the AOSD JSON schemes. 
Ignoring this warning will lead to error on import in AOSD!

```sh

Warning: we have found a possible circle dependency for - component name: ... - with id: ...

```

This warning tells you that you are using a component as direct and transitive dependency at the same time. Maybe this is correct and not an error but we want to raise your awareness to double check this.
This will not lead to any import errors!


```sh

Warning: we have found component(s) that is neither in direct dependencies nor in transitive dependencies - component id: ...

```

This warning tells you that you have generated data for a software component. But the id of this software component is neither in directDependencies nor in transitiveDependencies.
This component will be ignored by the AOSD import!

## Error messages explained


## Requirments for the spdxconverter

This spdxconverter can only handle spdx2.3 json files that meet the requirements of the GroupSpecification of Audi and Volkswagen.
The converter was specific build for the GroupSpecification.
We will only validate data fields that are descibed in this Specifiaction. 
We assume the data in the spdx2.3 json file was allready curated and is correct. 
 
## General information for the spdxconverter

The reason why this converter was developed is to give you the ability to convert spdx2.3 json files to the proprietary aosd2.1 json format in order to import the data into the AOSD Tool.

To use the spdxconverter you should first run the licenses command to generate a valid licenses.json file with up to date spdx identifiers.
The license command generates this license list with valid spdx identifiers and license texts from two sources.
We are using the spdx license list and the scancode license DB.

After the licenses.json is generated you can run the spdxconverter.

## Description for the spdxconverter 

This cli command line tool works in two steps.


It is recommendet to allways run step 1 the license command first to generate an license file with up to date data from spdx and scancode.
You should only skip step 1 if you do not have an internet connection to run the update of the license list.
In this case the initially shipped license list will be the fall back.

After the license list is updated or you have skipped this step you should run the converter script.

## ToDos

1. Readable error messages from scheme valaidators
2. Better response messages
3. More tests and test cases also for function and validators
4. More plausi checks component id's in directDependency OR transitiveDependency if not warning



