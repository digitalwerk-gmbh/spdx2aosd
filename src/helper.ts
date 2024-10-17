import { AosdObject } from "../interfaces/interfaces";

export const getUniqueValues = (arrayData: Array<string> | any) => (
    arrayData.filter((currentValue: any, index: any, arr: string | any[]) => (
          arr.indexOf(currentValue) === index
    ))
)

export const getMultibleUsedIds = (dArray: Array<number> | any, tArray: Array<number> | any): Array<number> => {
  const intersect: Array<number> = dArray.filter((element: number) => tArray.includes(element));
  return intersect;
}

export const getMissingComponentIds = (dArray: Array<number> | any, tArray: Array<number> | any, cArray: Array<number> | any ): Array<number> => {
  const directAndTrans = dArray.concat(tArray);
  const missingComponents:  Array<number> = cArray.filter((element: number) => !directAndTrans.includes(element));
  return missingComponents;
}

export const generateDataValidationMessage = (messagesArray: Array<number> | any): string => {
  let uniqueValidationResults: Array<string> = [];
  let messageText: string = '';
  uniqueValidationResults = getUniqueValues(messagesArray);
  messageText = '';
  for (let i = 0; i < uniqueValidationResults.length; i++) {
    messageText = messageText + uniqueValidationResults[i] + '\n';
  }
  return messageText;
}

export const checkValue = async (value: any, arrayData: any[], objectkey: string) => {
    let Array = [];
    try {
      switch (objectkey) {
        case 'componentId':
          Array = arrayData.filter(function (ids) {
            return ids.componentId === value;
          });
          break;
      }
    } catch (error) {
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        return Array;
    }
    return Array;
};

export const generateUniqueSubcomponentName = (partsCount: number, adlCount: number, mainCount: number, uniqueNameCounter: number, partName: string, licenseName: string): string => {
  let newSubcomponentName: string = '';

  // variants only 1 part and 1 additionalLicense
  if (partsCount === 1 && adlCount === 1) {
    newSubcomponentName = partName === 'default' && mainCount === 0 ? 'main' : partName + '_' + uniqueNameCounter;
  }
  // variants only 1 part and more then 1  additionalLicense
  if (partsCount === 1 && adlCount > 1) {
    newSubcomponentName = partName === 'default' && mainCount === 0 ? 'main' : licenseName + '_' + uniqueNameCounter;
  }
  // variants more then 1 part and 1 additionalLicense
  if (partsCount > 1 && adlCount === 1) {
    newSubcomponentName = partName === 'default' && mainCount === 0 ? 'main' : partName + '_' + uniqueNameCounter;
  }
  // variants more then 1 part and more then 1 additionalLicense
  if (partsCount > 1 && adlCount > 1) {
    newSubcomponentName = partName === 'default' && mainCount === 0 ? 'main' : partName + '_' + licenseName + '_' + uniqueNameCounter;
  }
  return newSubcomponentName;
}

export const generateStringFromJsonObject = async (jsonObject: AosdObject): Promise<string> => {
  let fileString = "";
  try {
      fileString = fileString + "{\n";
      fileString = fileString + "\"schemaVersion\": " + "\"" + jsonObject.schemaVersion + "\",\n";
      fileString = fileString + "\"externalId\": " + "\"" + jsonObject.externalId + "\",\n";
      fileString = fileString + "\"scanned\": "  + jsonObject.scanned + ",\n";
      fileString = fileString + "\"directDependencies\": [\n" + jsonObject.directDependencies + "\n],\n";
      fileString = fileString + "\"components\": [\n";
      for (let i=0; i<jsonObject.components.length; i++) {
        fileString = fileString + JSON.stringify(jsonObject.components[i], null, '\t');
        if (i < jsonObject.components.length - 1) {
          fileString = fileString + ",\n";
        } else {
          fileString = fileString + "\n";
        }
      }
      fileString = fileString + "]\n";
      fileString = fileString + "}\n";
  } catch (error) {
      console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
      return fileString;
  }
  return fileString;
}
