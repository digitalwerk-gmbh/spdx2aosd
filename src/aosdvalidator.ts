require('dotenv').config();
const fs = require('fs');
import Ajv from "ajv";

export const validateAosd = async (inputFile: string): Promise<void> => {
    try{
        // Read the aosd json scheme
        const aosd2_schema = JSON.parse(
          fs.readFileSync(process.env.AOSD_JSON_SCHEME, {
            encoding: "utf8",
          }),
        );        

        // Read the spdx json file for validation
        const inputJsonPath = process.env.OUTPUT_JSON_PATH + inputFile;
        const aosdJsonFile = fs.readFileSync(inputJsonPath);
        let data = JSON.parse(aosdJsonFile);

        // Run validation
        const validate = new Ajv().compile(aosd2_schema);
        const valid = validate(data);

        if (!valid) {
            console.log("ERROR", validate.errors);
        }
    } catch(error: any) {
      console.error(error);
    }
}
