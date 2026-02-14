export declare function createIsStaticFile(): (relativeFile: string, onlySubPackages?: boolean) => boolean;
export type IsStaticFile = (file: string, onlySubPackages?: boolean) => boolean;
export declare function getIsStaticFile(): IsStaticFile;
