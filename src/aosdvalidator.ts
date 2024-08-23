require('dotenv').config();
const fs = require('fs');
const Ajv = require('ajv').default;
const ajv = new Ajv({allErrors: true, keepErrors: false});
const AjvErrors = require('ajv-errors');
AjvErrors(ajv, { singleError: false, keepErrors: false });

export const validateAosd = (inputFile: string, inputScheme: string | undefined): Array<string> => {
    let messageArray: Array<string> = [];
    try {
        let validationErrors: string | any[] = [];
        // Read the aosd json scheme
        const jsonScheme = JSON.parse(
          fs.readFileSync(inputScheme, {encoding: "utf8",})
        );        

        // Read the spdx json file for validation
        const aosdJsonFile = fs.readFileSync(inputFile);
        let data = JSON.parse(aosdJsonFile);

        // Run validation
        const validate = ajv.compile(jsonScheme);
        const valid = validate(data);

        if (!valid) {
          // prepare error.log messages for return value 
          messageArray.push('\n-----------------------------------------------------\n' + inputFile + ' scheme validation errors:\n-----------------------------------------------------\n');
          if (validate.hasOwnProperty('errors') && validate.errors ) {
            validationErrors = validate.errors
          }

          for (let k=0; k<validationErrors.length; k++) {
            messageArray.push('SchemeValidationError: ' + validationErrors[k].message);
          }
        }
        return messageArray;
    } catch(error: any) {
      //console.error(error);
      return messageArray;
    }
}
