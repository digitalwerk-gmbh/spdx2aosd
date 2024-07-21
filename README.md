# AOSDtoAOSDConverter

## Getting started

To setup and install this cli tool local on your device please follow the next 3 steps.

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

Finnaly run the npm command to install the needed dependencies for the converter.

```sh
$ npm install

```

After finsishing these 3 steps the cli tool converter should be ready for use.

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

## AOSDtoAOSDConverter folder Structure

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


