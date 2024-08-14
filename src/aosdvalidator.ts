require('dotenv').config();
const fs = require('fs');
import Ajv from "ajv";

export const validateAosd = (inputFile: string): Array<string> => {
    let messageArray: Array<string> = [];
    try {
        let validationErrors: string | any[] = [];
        // Read the aosd json scheme
        const aosd2_schema = JSON.parse(
          fs.readFileSync(process.env.AOSD2_1_JSON_SCHEME, {
            encoding: "utf8",
          }),
        );        

        // Read the spdx json file for validation
        const inputJsonPath = process.env.INPUT_JSON_PATH + inputFile;
        const aosdJsonFile = fs.readFileSync(inputJsonPath);
        let data = JSON.parse(aosdJsonFile);

        // Run validation
        const validate = new Ajv().compile(aosd2_schema);
        const valid = validate(data);

        if (!valid) {
          // write data to error.log
          if (validate.hasOwnProperty('errors') && validate.errors ) {
            validationErrors = validate.errors
          }

          for (let k=0; k<validationErrors.length; k++) {
            // console.log("ERROR-1", validationErrors[k].instancePath);
            // console.log("ERROR-2", validationErrors[k].schemaPath);
            // console.log("ERROR-3", validationErrors[k].keyword);
            // console.log("ERROR-4", validationErrors[k].params);
            // console.log("ERROR-5", validationErrors[k].message);
            messageArray.push('SchemeValidationError: ' + validationErrors[k].instancePath + '/' + validationErrors[k].schemaPath + '/' + validationErrors[k].keyword + '/' + validationErrors[k].params + '/' + validationErrors[k].message);
          }
        }
        return messageArray;
    } catch(error: any) {
      console.error(error);
      return messageArray;
    }
}
