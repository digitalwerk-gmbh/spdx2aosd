const fs = require('fs');
const ExcelJS = require('exceljs');
require('dotenv').config();
let inputJsonPath: string | undefined = '';
let outputJsonPath: string | undefined = '';
let outputFile: string = '';

export const convertUpXls = async (cliArgument: string): Promise<void> => {
    try {
        inputJsonPath = process.env.INPUT_JSON_PATH + cliArgument;
        outputJsonPath = process.env.OUTPUT_JSON_PATH;
        const myWorkBook = new ExcelJS.Workbook();
        let json: any = [];
        let tmpArray: Array<object> = [];
        const rowObject = {};
        myWorkBook.xlsx.readFile(inputJsonPath)
        .then(() => {
            const worksheet = myWorkBook.getWorksheet('records');
            let counter = 0;
            worksheet.eachRow({ includeEmpty: false }, function(row: any) {
                let rowObject = {
                    id: 0,
		            software_name: '',
		            software_version: '',
		            software_download_link: '',
		            license_spdx: '',
		            license_text: '',
		            use_linkage: '',
		            use_modification: '',
		            use_distribution: '',
		            use_start: '',
		            use_end: '',
		            use_comment: ''
                };
                tmpArray = [];
                row.eachCell({ includeEmpty: true }, function(cell: any, colNumber: any) {
                    if (cell.value === null) {
                        cell.value = '';
                        // Replace line breaks - problem error message
                        // myString.replace(/\n/g, ' ') 
                    }
                    if (colNumber === 5 && cell.value !== '' && cell.value !== null) {
                        cell.value = cell.value.text;
                    }
                    switch(colNumber) {
                        case 1: rowObject.id = counter; 
		                case 3: rowObject.software_name = cell.value;
		                case 4: rowObject.software_version = cell.value;
		                case 5: rowObject.software_download_link = cell.value;
		                case 6: rowObject.license_spdx = cell.value; 
		                case 7: rowObject.license_text = cell.value; 
		                case 8: rowObject.use_linkage = cell.value; 
		                case 9: rowObject.use_modification = cell.value; 
		                case 10: rowObject.use_distribution = cell.value; 
		                case 11: rowObject.use_start = cell.value;  
		                case 12: rowObject.use_end = cell.value; 
		                case 13: rowObject.use_comment = cell.value; 
                    }    
                })
                if (counter !== 0) {
                    json.push(rowObject);
                }
                counter++;
            });
            // Prepare output file
            const outputFileName: string = cliArgument.replace(".xlsx", "") + "_aosd2.1" + ".json";
            outputFile = outputJsonPath + outputFileName;

            // Write data to aosd json format
            fs.writeFileSync(outputFile, JSON.stringify(json, null, '\t'));
        })    
        .catch((error:any) => {
            fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
            console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        });
    } catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}

export const convertUpCsv = async (cliArgument: string): Promise<void> => {
    try {} catch(error: any) {
        fs.writeFileSync(process.env.LOG_FILE_PATH, error.toString(), { encoding: 'utf8' });
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
    }
}
