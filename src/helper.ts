import { AosdObject } from '../interfaces/interfaces';
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
        console.log('Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.');
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
  let fileString = '';
  try {
      fileString = fileString + '{\n';
      fileString = fileString + '"schemaVersion": ' + '"' + jsonObject.schemaVersion + '",\n';
      fileString = fileString + '"externalId": ' + '"' + jsonObject.externalId + '",\n';
      fileString = fileString + '"scanned": '  + jsonObject.scanned + ',\n';
      fileString = fileString + '"directDependencies": [\n' + jsonObject.directDependencies + '\n],\n';
      fileString = fileString + '"components\": [\n';
      for (let i=0; i<jsonObject.components.length; i++) {
        fileString = fileString + JSON.stringify(jsonObject.components[i], null, '\t');
        if (i < jsonObject.components.length - 1) {
          fileString = fileString + ',\n';
        } else {
          fileString = fileString + '\n';
        }
      }
      fileString = fileString + ']\n';
      fileString = fileString + '}\n';
  } catch (error) {
      console.log('Sorry for that - something went wrong! Please check the error.log file in the root folder for detailed information.');
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

// Load all spdx keys
export const loadSPDXKeys = (): Set<string> => {
  try {
    const data = JSON.parse(fs.readFileSync(process.env.LICENSE_FILE_PATH!, 'utf8')).data;
    return new Set(data?.map(({ spdx_license_key } : { spdx_license_key: string }) => spdx_license_key) || []);
  } catch {
    throw new Error('The licenses.json file is missing or has an invalid format.');
  }
};

// Load all deprecated spdx keys
export const loadDeprecatedSPDXKeys = (): Set<string> => {
  try {
    const data = JSON.parse(fs.readFileSync(process.env.LICENSE_FILE_PATH!, 'utf8')).data;
    const deprecatedLicenses = data.filter((l:any) => l.is_depricated == true);
    return new Set(deprecatedLicenses?.map(({ spdx_license_key } : { spdx_license_key: string }) => spdx_license_key) || []);
  } catch {
    throw new Error('The licenses.json file is missing or has an invalid format.');
  }
};

export const validateSPDXIds = (
  spdxIds: Array<string>,
  validSPDXKeys: Set<string>,
  deprecatedSPDXKeys: Set<string>,
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

      // Check for depricated licenses
      const depLicenses = licenses.filter(part => deprecatedSPDXKeys.has(part.trim()));
      if (depLicenses.length > 0) {
        validationMessages.push(
          `Warning: depricated SPDX key(s) - '${depLicenses.join(", ")}' - component name: ${componentName} - subcomponent: ${subcomponentName}`
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

  // Parse SPDX keys
  const parseSpdxIds = (spdxId: string): string[] => {
    // Remove parentheses and split by OR/AND
    return spdxId
      .replace(/[\(\)]/g, '') 
      .split(/\s+(OR|AND)\s+/)
      .filter((key) => key !== 'OR' && key !== 'AND') 
      .map((key) => key.trim());
  };

  // Validate components
  componentsArray?.forEach(({ componentName, subcomponents, modified, linking }) => {
    subcomponents?.forEach(({ spdxId, subcomponentName }) => {
      const spdxIds = parseSpdxIds(spdxId);
      spdxIds.forEach((id) => {
        if (modificationSet.has(id) && modified === null) {
          validationResults.push(
            `Warning: due to the presence of SPDX key '${id}' in component '${componentName}' - subcomponent '${subcomponentName}', the 'modification' property cannot be null.`
          );
        }
        if (linkingSet.has(id) && linking === null) {
          validationResults.push(
            `Warning: due to the presence of SPDX key '${id}' in component '${componentName}' - subcomponent '${subcomponentName}', the 'linking' property cannot be null.`
          );
        }
      });
    });
  });
};

/*
* Linking Mapper for AOSD1.0 xls format
**/
export const linkingMapper = (linkingInformation: string = ''): string | null => {
    try {
        switch(linkingInformation) {
            case 'no': return 'process_call';
            case 'nein': return 'process_call';
            case 'yes, statically': return 'static_linking';
            case 'yes, dynamically': return 'dynamic_linking';
            case 'statisch': return 'static_linking';
            case 'dynamisch': return 'dynamic_linking';
            default: null;
        }
        return null;
    } catch(error: any) {
        return null;
    }
}

/*
* Modification Mapper for AOSD1.0 xls format
**/
export const modificationMapper = (modificationInformation: string = ''): boolean| null => {
    try {
        switch(modificationInformation) {
            case 'no': return false;
            case 'yes': return true;
            case 'No': return false;
            case 'Yes': return true;
            case 'nein': return false;
            case 'ja': return true;
            case 'Nein': return false;
            case 'Ja': return true;
            default: null;
        }
        return null;
    } catch(error: any) {
        return null;
    }
}

/*
* SPDX Key Mapper for AOSD1.0 xls format
**/
export const spdxKeyMapper = (spdxKeyInformation: string = ''): string => {
    try {
        switch(spdxKeyInformation) {
            // AOSD1.0 specific
            case '_different licenses including such with strict copyleft [no official SPDX]': return 'LicenseRef-scancode-other-copyleft';
            case '_different licenses including such with limited but no strict copyleft [no official SPDX]': return 'LicenseRef-scancode-other-copyleft';
            case '_different licenses all without copyleft [no official SPDX]': return 'LicenseRef-scancode-other-permissive';
            case '_Public Domain [no official SPDX]': return 'LicenseRef-scancode-public-domain';
            // Generell SPDX Keys
            case 'AGPL-1.0': return 'AGPL-1.0-or-later'
            case 'AGPL-3.0': return 'LicenseRef-scancode-unknown'
            case 'BSD-2-Clause-FreeBSD': return 'LicenseRef-scancode-unknown'
            case 'BSD-2-Clause-NetBSD': return 'LicenseRef-scancode-unknown'
            case 'bzip2-1.0.5': return 'LicenseRef-scancode-unknown'
            case 'eCos-2.0': return 'eCos-exception-2.0'
            case 'GFDL-1.1': return 'LicenseRef-scancode-unknown'
            case 'GFDL-1.2': return 'LicenseRef-scancode-unknown'
            case 'GFDL-1.3': return 'LicenseRef-scancode-unknown'
            case 'GPL-1.0': return 'GPL-1.0-only'
            case 'GPL-1.0+': return 'GPL-1.0-or-later'
            case 'GPL-2.0': return 'GPL-2.0-only'
            case 'GPL-2.0+': return 'GPL-2.0-or-later'
            case 'GPL-2.0-with-autoconf-exception': return 'GPL-2.0-only WITH Autoconf-exception-2.0'
            case 'GPL-2.0-with-bison-exception': return 'GPL-2.0-only WITH Bison-exception-2.2'
            case 'GPL-2.0-with-classpath-exception': return 'GPL-2.0-only WITH Classpath-exception-2.0'
            case 'GPL-2.0-with-font-exception': return 'GPL-2.0-only WITH Font-exception-2.0'
            case 'GPL-2.0-with-GCC-exception': return 'GPL-2.0-only WITH GCC-exception-2.0'
            case 'GPL-3.0': return 'GPL-3.0-only'
            case 'GPL-3.0+': return 'GPL-3.0-or-later'
            case 'GPL-3.0-with-autoconf-exception': return 'GPL-3.0-only WITH Autoconf-exception-3.0'
            case 'GPL-3.0-with-GCC-exception': return 'GPL-3.0-only WITH GCC-exception-3.1'
            case 'LGPL-2.0': return 'LGPL-2.0-only'
            case 'LGPL-2.0+': return 'LGPL-2.0-or-later'
            case 'LGPL-2.1': return 'LGPL-2.1-only'
            case 'LGPL-2.1+': return 'LGPL-2.1-or-later'
            case 'LGPL-3.0': return 'LGPL-3.0-only'
            case 'LGPL-3.0+': return 'LGPL-3.0-or-later'
            case 'Net-SNMP': return 'LicenseRef-scancode-unknown'
            case 'Nunit': return 'LicenseRef-scancode-unknown'
            case 'StandardML-NJ': return 'SMLNJ'
            case 'wxWindows': return 'WxWindows-exception-3.1'
            // SPDX Exceptions
            case 'Nokia-Qt-exception-1.1': return 'LicenseRef-scancode-unknown'
            default: spdxKeyInformation;
        }
        return spdxKeyInformation;
    } catch(error: any) {
        return spdxKeyInformation;
    }
}
