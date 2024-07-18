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

export interface License {
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
    licenses: Array<License>,
    parts: Array<Part>,
    deployPackage: DeployPackage,
    externalDependencies: Array<string>,
}

export interface Part {
    name: string,
    description: string,
    providers: Array<Provider>,
    modified: boolean,
    usage: string,
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
    additionalLicenses: Array<License>,
    //modified: boolean,
    //usage: string,
    //external: boolean,
}
