# This Changelog file documents all changes and updates on the spdx2aosd converter
#
# Types of changes
# [Added] for new features.
# [Changed] for changes to existing functionality.
# [Deprecated] for features that will be removed in future releases.
# [Removed] for deprecated features removed in this release.
# [Fixed] for all bug fixes.
# [Security] to prompt users to update if security vulnerabilities are closed.

# Update from version 1.0.0-beta to 1.0.1-beta

# [Added] added new data validation for checking if component if mentionend in directDependencies

# [Fixed] fixed error in script if array is empty on filtered variable
# [Fixed] fixed use of the correct scheme validation on upconverter for final file 

# Update from version 1.0.1-beta to 1.1.1-beta

# [Added] added new data validation for checking if component is mentionend in transitiveDependencies
# [Added] added new validation to ensure `licenseTextUrl` is populated when `scanned` is set to "false"
# [Added] added new validation to ensure `selectedLicense` is populated when `spdxId` contains a dual license

# [Fixed] fixed a bug in `aosd2.0` import schema, ensuring accurate schema validation

# Update from version 1.1.1-beta to 1.2.0-beta

# [Added] added function to validate modified and linking properties when their subcomponents contain specific SPDX keys
# [Added] improved import schema for aosd2.10
# [Added] improved import schema for aosd2.1 
# [Added] improved import schema for spdx2.3 
# [Fixed] fixed a bug in aosd2.0 import schema that caused no validation errors

# Update from version 1.2.0-beta to 1.3.0-beta

# [Added] added function to accumulate aosd2.1 json files (accumulate equal subcomponents inside a component)
# [Fixed] fixed Vulnerabilities
# [Changed] environment variable changed from VERSION to SCRIPT
# [Changed] refactoring formating only
