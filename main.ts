require('dotenv').config();
const fs = require('fs');
import { writeErrorLog, checkErrorMessage } from './src/errorhandler'
import { convertDown } from './src/downconverter';
import { convertUp } from './src/upconverter';
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

    // Write data to aosd json format
    try {
        if (process.env.VERSION === 'down') {
            const response = convertDown(cliArgument);
        }
        else if (process.env.VERSION === 'up') {
            const response = convertUp(cliArgument);      
        }
    } catch(error) {
        //writeErrorLog({ message: checkErrorMessage(error) })
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.")
    }
}
