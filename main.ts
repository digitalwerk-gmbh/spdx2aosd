require('dotenv').config();
const fs = require('fs');
import { convertDown } from './src/downconverter';
import { convertUp } from './src/upconverter';
import { convertSpdxSpec } from './src/spdxspecconverter';
import { convertSpdx } from './src/spdxconverter';
import { accumulate } from './src/accumulate';
import { linkinMapper, modificationMapper } from './src/helper';
const cliArguments = {
    pathArgument: process.argv[2] !== undefined ? process.argv[2] : undefined,
    linkingArgument: process.argv[3] !== undefined ? process.argv[3] : null,
    modificationArgument: process.argv[4] !== undefined ? process.argv[4] : null,
}

// Check if we got argument for the input file name
if(cliArguments.pathArgument ===  undefined ) {
    console.log('You must run this script with the following parameters:\n');
    console.log('npm run ' + process.env.VERSION +' <filename>\n\n');
    console.log('Where filename is the name of the input file.');
    console.log('<filename> is mandatory!');      
} else {
    // Create empty error.log
    if (process.env.LOG_FILE_PATH !== undefined) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, '');
    } else {
        console.log('Sorry for that - something went wrong! The envoirenment paramater LOG_FILE_PATH in your .env file is maybe undefined!');
    }

    // Check if given file exist in the input folder
    if (!fs.existsSync(process.env.INPUT_JSON_PATH + cliArguments.pathArgument)) {
        console.log('Sorry for that - something went wrong! The file ' +cliArguments.pathArgument+ ' does not exits in the data input folder!');
    } else {
        // Write data to aosd json format
        try {
            if (process.env.SCRIPT === 'down') {
                const response = convertDown(cliArguments.pathArgument);
            }
            else if (process.env.SCRIPT === 'up') {
                const response = convertUp(cliArguments.pathArgument);      
            }
            else if (process.env.SCRIPT === 'spdxspec') {
                const response = convertSpdxSpec(cliArguments.pathArgument);    
            }
            else if (process.env.SCRIPT === 'spdx') {
                let arg2: string | null = null;
                let arg3: boolean | null = null;
                if (cliArguments.linkingArgument !== null) {
                    arg2 = linkinMapper(cliArguments.linkingArgument);
                }
                if (cliArguments.modificationArgument !== null) {
                   arg3 = modificationMapper(cliArguments.modificationArgument);
                }

                console.log('File: ', cliArguments.pathArgument);
                console.log('Linking: ', arg2);
                console.log('Modification: ', arg3);
                const response = convertSpdx(cliArguments.pathArgument, arg2, arg3);    
            }
            else if (process.env.SCRIPT === 'accumulate') {
                const response = accumulate(cliArguments.pathArgument);    
            }
        } catch(error) {
            // writeErrorLog({ message: checkErrorMessage(error) })
            console.log('Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.');
        }
    }
}
