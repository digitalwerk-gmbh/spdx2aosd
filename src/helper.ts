import { AosdObject } from "../interfaces/interfaces";
const fs = require('fs');

export const getUniqueValues = (arrayData: Array<string> | any) => (
    arrayData.filter((currentValue: any, index: any, arr: string | any[]) => (
          arr.indexOf(currentValue) === index
    ))
)

export const getMultibleUsedIds = (dArray: Array<number> | any, tArray: Array<number> | any): Array<number> => {
  const intersect: Array<number> = dArray?.filter((element: number) => tArray.includes(element));
  return intersect;
}

export const getMissingComponentIds = (dArray: Array<number> | any, tArray: Array<number> | any, cArray: Array<number> | any ): Array<number> => {
  const directAndTrans = dArray?.concat(tArray);
  const missingComponents:  Array<number> = cArray.filter((element: number) => !directAndTrans?.includes(element));
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

// Validate direkt and transitive dependencies
export const validateDependencies = (
  dependencies: Array<number | string>,
  componentsArray: Array<{ id: string | number }>,
  dependencyType: string
): Array<string> => {
  const validationMessages: Array<string> = [];

  const componentIds = new Set(componentsArray?.map((component) => (component?.id != null ? component.id.toString() : "")));
  dependencies?.forEach((dependencyId) => {
    const depIdStr = dependencyId.toString();
    if (!componentIds.has(depIdStr)) {
        validationMessages.push(`Warning: ${dependencyType} with id ${depIdStr} does not correspond to any component`);
    }
});
  return validationMessages;
};

// Validate spdx keys
export const loadSPDXKeys = (): Set<string> => {
  try {
    const data = JSON.parse(fs.readFileSync(process.env.LICENSE_FILE_PATH!, 'utf8')).data;
    return new Set(data?.map(({ spdx_license_key } : { spdx_license_key: string }) => spdx_license_key) || []);
  } catch {
    throw new Error("The licenses.json file is missing or has an invalid format.");
  }
};

export const validateSPDXIds = (
  spdxIds: Array<string>,
  validSPDXKeys: Set<string>,
  componentName: string,
  subcomponentName?: string,
  selectedLicense?: string
): Array<string> => {
  const validationMessages: Array<string> = [];

  spdxIds.forEach(id => {
    const cleanedId = id.replace(/[()]/g, "").trim();
    const licenses = cleanedId.split(/\s+(AND|OR)\s+/).filter(part => part !== "AND" && part !== "OR");
   
      // Check each license part
      const invalidLicenses = licenses.filter(part => !validSPDXKeys.has(part.trim()));

      if (invalidLicenses.length > 0) {
        validationMessages.push(
          `Warning: invalid SPDX key(s) - '${invalidLicenses.join(", ")}' - component name: ${componentName} - subcomponent: ${subcomponentName}`
        );
      }
 });
  // Validate selected license
  if (selectedLicense && !validSPDXKeys.has(selectedLicense)) {
    validationMessages.push(
      `Warning: invalid SPDX key in selectedLicense '${selectedLicense}' - component name: ${componentName} - subcomponent: ${subcomponentName}`
    );
  }
  return validationMessages;
};

// Check if 'scanned' is false and validate if 'licenseTextUrl' exists
export const validateLicenseTextUrl = (
  componentsArray: Array<{ subcomponents: any[]; componentName: string }>,
  validationResults: Array<string>
): void => {
  componentsArray.forEach((component) => {
      component.subcomponents.forEach((subcomponent) => {
          if (!subcomponent.licenseTextUrl) {
              validationResults.push(`Warning: licenseTextUrl in component name: ${component.componentName} - subcomponent: ${subcomponent.subcomponentName} is a required field.`);
          }
      });
  });
};

// Check if 'selectedLicense' is populated when 'spdxId' contains a dual license 
export const validateSelectedLicenseForDualLicenses = (
  componentsArray: Array<{ componentName: string; subcomponents: { spdxId: string; selectedLicense?: string; subcomponentName: string }[] }>,
  validationResults: Array<string>
): void => {
  componentsArray?.forEach((component) => {
      component.subcomponents?.forEach((subcomponent) => {
          if (subcomponent.spdxId.includes("OR") && (!subcomponent.selectedLicense || subcomponent.selectedLicense.trim() === "")) {
              validationResults.push(
                  `Warning: dual-license detected - component name: ${component.componentName} - subcomponent: ${subcomponent.subcomponentName}. Please specify a selectedLicense.`
              );
          }
      });
  });
};

// Validate modification and linking
export const validateComponentsForModificationAndLinking = (
  componentsArray: Array<{
    componentName: string;
    subcomponents: Array<{ spdxId: string; subcomponentName: string }>;
    modified: boolean | null;
    linking: string | null;
  }>,
  validationResults: Array<string>
) => {
   // Load SPDX keys for modification and linking
   const { modification, linking } = JSON.parse(fs.readFileSync(process.env.MODIFICATION_LINKING_FILE_PATH, 'utf8'));
   const modificationSet = new Set(modification);
   const linkingSet = new Set(linking);

    // Validate components
    componentsArray?.forEach(({ componentName, subcomponents, modified, linking }) => {
      subcomponents?.forEach(({ spdxId, subcomponentName }) => {
        if (modificationSet.has(spdxId) && modified === null) {
          validationResults.push(
            `Warning: due to the presence of SPDX key '${spdxId}' in component '${componentName}' - subcomponent '${subcomponentName}', the 'modification' property cannot be null.`
          );
        }
        if (linkingSet.has(spdxId) && linking === null) {
          validationResults.push(
            `Warning: due to the presence of SPDX key '${spdxId}' in component '${componentName}' - subcomponent '${subcomponentName}', the 'linking' property cannot be null.`
          );
        }
      });
    });
};