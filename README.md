# AOSDtoAOSDConverter


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

With this cli tool you can convert aosd json input files from version 2.0 to 2.1 and vice versa from 2.1 to 2.0.

Also you can run the unit tests to check the script works correct.

```sh
# convert the json file from 2.0 to 2.1

$ npm run up <filename>

# convert the json file from 2.1 to 2.0

$ npm run down <filename>

# run the unit tests

$ npm run test

```


## aosdtoaosdconverter folder Structure

This is the folder structure and the files you should see after succesful setup.

```
aosdtoaosdconverter
│	
│	
└──data
│  │
│  └──input
│  │
│  └──json
│  │  AOSD2.0_Importscheme_V2.0.0.json
│  │  AOSD2.1_Importscheme_V2.1.0.json
│  │
│  └──output
│	
└──docs 
│	
└──interfaces
│  interfaces.ts
│	
└──node_modules 
│	
└──src
│  aosdvalidator.ts
│  downconverter.ts
│  errorhandler.ts
│  helper.ts
│  upconverter.ts
│	
└──tests
│  │
│  └──data
│  │   │
│  │   └──input
│  │   │  aosd2.0_import.json
│  │   │  aosd2.1_import.json
│  │   │
│  │   └──output
│  │
│  └──unit
│     test.ts
│
└──.env
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


#### TODO

# SPDXToAOSDConverter

This is a converter for the SPDX2.3 JSON format that meets the requirements of the GroupSpecification of Audi and Volkswagen.
With this cli command line tool you can convert such an SPDX2.3 JSON file to the proprietary AOSD2.1 JSON format.

## Requirments

This converter can only handle SPDX2.3 JSON files that meet the requirements of the GroupSpecification of Audi and Volkswagen.
The converter was specific build for the GroupSpecification.
We will only validate data fields that are descibed in this Specifiaction. 
We assume the data in the SPDX2.3 JSON file was allready kurtated and is correct. 
 
## General

The reason why this converter was developed is to give you the ability to convert SPDX2.3 JSON files to the proprietary AOSD2.1 JSON format in order to import the data into the AOSD.
The converter has a modular structure and 2 main funktionalities.

Functionalty 1:

The tool generates a license list ith valid spdx identifiers and license texts from two sources.
We are using the spdx license list and the scancode license DB.

Functionalty 2:



## Getting started

How to start. Setup and installation.

## Description 

This cli command line tool works in two steps.


It is recommendet to allways run step 1 the license command first to generate an license file with up to date data from spdx and scancode.
You should only skip step 1 if you do not have an internet connection to run the update of the license list.
In this case the initially shipped license list will be the fall back.

After the license list is updated or you have skipped this step you should run the converter script.

## How to use this tool



## Open Questions

- How to generate scanned information 
- 


## ToDos

1. Readable error messages from scheme valaidators
2. Better response messages
3. More tests and test cases also for function and validators
4. README
5. More plausi checks component id's in directDependency OR transitiveDependency if not warning



