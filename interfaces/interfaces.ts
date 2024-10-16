export interface AosdObject {
    schemaVersion: string;
    externalId: string;
    scanned: boolean;
    directDependencies: Array<number>;
    components: Array<AosdComponent>;
}

export interface AosdComponent {
    id: number;
    componentName: string;
    componentVersion: string;
    scmUrl: string;
    modified: boolean | null;
    linking: string | null;
    transitiveDependencies: Array<number | string>;
    subcomponents: Array<AosdSubComponent>;
}

export interface AosdSubComponent {
    subcomponentName: string;
    spdxId: string;
    copyrights: Array<string>;
    authors: Array<string>;
    licenseText: string;
    licenseTextUrl:  string;
    selectedLicense:  string;
    additionalLicenseInfos:  string;
}

export interface LicenseAosd {
    name: string,
    spdxId: string,
    text: string,
    url: string,
    copyrights: Copyright,
    origin: string,
}

export interface Copyright {
    holders: Array<string>,
    notice: string,
}

export interface DependencyObject {
    id: string,
    name: string,
    version: string,
    versionRange: string,
    scmUrl: string,
    licenses: Array<LicenseAosd>,
    parts: Array<Part>,
    deployPackage: DeployPackage,
    externalDependencies: Array<string>,
}

export interface Part {
    name: string,
    description: string,
    providers: Array<Provider>,
    external: boolean,
}

export interface DeployPackage {
    name: string,
    downloadUrl: string,
    checksums: Checksums,
}

interface Checksums {
    md5?: string,
    sha1?: string,
    integrity?: string,
    sha512?: string,
}

export interface Provider {
    additionalLicenses: Array<LicenseAosd>,
    modified: boolean,
    usage: string,
    //modified: boolean,
    //usage: string,
    //external: boolean,
}

export interface LicenseBlock {
    name: string;
    spdxId: string;
    type: string;
    reference: string;
    isDeprecatedLicenseId: boolean;
    detailsUrl: string;
    referenceNumber: number;
    isOsiApproved: boolean;
    seeAlso: Array<string>;
}

export interface License {
    name: string;
    licenseId: string;
    type: string;
    reference: string;
    isDeprecatedLicenseId: boolean;
    detailsUrl: string;
    referenceNumber: number;
    isOsiApproved: boolean;
    seeAlso: Array<string>;
}

export interface Exception {
    reference: string;
    isDeprecatedLicenseId: boolean;
    detailsUrl: string;
    referenceNumber: number;
    name: string;
    licenseExceptionId: string;
    seeAlso: Array<string>;
}

export interface SpdxException {
    licenseListVersion: string;
    exceptions: Array<Exception>;
    releaseDate: string;
}

export interface SpdxLicense {
    licenseListVersion: string;
    licenses: Array<License>;
    releaseDate: string;
}

export interface DejaLicense {
    license_key: string;
    category: string;
    spdx_license_key: string;
    other_spdx_license_keys: Array<string>;
    is_exception: boolean,
    is_deprecated: boolean,
    json: string;
    yaml: string;
    html: string;
    license: string;
}

export interface LicenseJson {
    id: number,
    key: string;
    short_name: string;
    name: string;
    category: string;
    owner: string;
    homepage_url: string;
    is_exception: boolean;
    is_depricated: boolean;
    notes: string;
    spdx_license_key: string;
    text_urls: Array<string>;
    other_urls: Array<string>;
    ignorable_copyrights: Array<string>;
    ignorable_holders?: Array<string>;
    standard_notice?: string;
    other_spdx_license_keys?: Array<string>;
    osi_license_key?: string;
    osi_url?: string;
    faq_url?: string;
    ignorable_urls?: Array<string>;
    text: string;
}

export interface Options {
    method: string;
    url: string | unknown;
    headers: object;
}

export interface LicenseProperties {
    key: string;
    short_name: string;
    name: string;
    category: string;
    owner: string;
    homepage_url: string;
    is_exception: boolean;
    is_depricated: boolean;
    notes: string;
    spdx_license_key: string;
    text_urls: Array<string>;
    other_urls: Array<string>;
    ignorable_copyrights: Array<string>;
    ignorable_holders?: Array<string>;
    standard_notice?: string;
    other_spdx_license_keys?: Array<string>;
    osi_license_key?: string;
    osi_url?: string;
    faq_url?: string;
    ignorable_urls?: Array<string>;
    text: string;
}

export interface LicenseDataObject {
    metadata: MetaData;
    data: Array<LicenseJson>;
}

interface MetaData {
    dejaCodeHash: string;
    spdxExceptionHash: string;
    spdxLicensesHash: string;
}

export interface ExtractedLicense {
    licenseId: string;
    extractedText: string;
    name: string;
}

export interface MappedLicense {
    licenseId: string;
    extractedText: string;
}

export interface SpdxPackages {
    copyrightText: string;
    licenseDeclared: string;
    SPDXID: string;
    name: string;
    versionInfo: string;
    downloadLocation: string;
    hasFiles: Array<String>;
    licenseConcluded: string;
}

export interface SpdxFiles {
    SPDXID: string;
    fileName: string;
    licenseConcluded: string;
    copyrightText: string;
    noticeText?: string;
    licenseComments?: string;
    attributionTexts?: string;
}

export interface SpdxRelationsships {
    spdxElementId: string;
    relatedSpdxElement: string;
    relationshipType: string;
    comment?: string;
}

export interface SpdxIdToInternalId {
    SPDXID : string;
    internalId: number;
}

export interface exportMapper {
    mapId: number;
    originalId: string;
}
