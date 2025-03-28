require('dotenv').config();
const fs = require('fs');
import { convertDown } from './src/downconverter';
import { convertUp } from './src/upconverter';
import { convertSpdx } from './src/spdxconverter';
import { accumulate } from './src/accumulate';
let cliArgument: string = process.argv[2];

// Check if we got argument for the input file name
if(cliArgument ===  undefined) {
    console.log('You must run this script with the following parameters:\n');
    console.log('npm run ' + process.env.VERSION +' <filename>\n\n');
    console.log('Where filename is the name of the input file.');
    console.log('<filename> is mandatory!');      
} else {
    // Create empty error.log
    fs.writeFileSync(process.env.LOG_FILE_PATH, '');

    // Check if given file exist in the input folder
    if (!fs.existsSync(process.env.INPUT_JSON_PATH + cliArgument)) {
        console.log('Sorry for that - something went wrong! The file ' +cliArgument+ ' does not exits in the data input folder!')
    } else {
        // Write data to aosd json format
        try {
            if (process.env.SCRIPT === 'down') {
                const response = convertDown(cliArgument);
            }
            else if (process.env.SCRIPT === 'up') {
                const response = convertUp(cliArgument);      
            }
            else if (process.env.SCRIPT === 'spdx') {
                const response = convertSpdx(cliArgument);    
            }
            else if (process.env.SCRIPT === 'accumulate') {
                const response = accumulate(cliArgument);    
            }
        } catch(error) {
            // writeErrorLog({ message: checkErrorMessage(error) })
            console.log('Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.');
        }
    }
}
