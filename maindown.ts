require('dotenv').config();
import { convertDown } from "./src/downconverter";
let cliArgument: string = process.argv[2];

// Check if we got argument for the input file name
if(cliArgument ===  undefined) {
    console.log("You must run this script with the following parameters:\n");
    console.log("npm run convert <filename>\n\n");
    console.log("Where filename is the name of the input file.");
    console.log("<filename> is mandatory!");      
} else {
    // Run the converter script with cli argument (file name)
    const response = convertDown(cliArgument);
}
