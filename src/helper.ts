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
        // writeErrorLog({ message: checkErrorMessage(error) })
        console.log("Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.");
        return Array;
    }
    return Array;
};
