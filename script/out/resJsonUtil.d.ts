export declare function clean(p: string): Promise<void>;
export declare function rebuild(p: string, d: string): Promise<void>;
export declare function doThing(fileName: any): void;
export declare function rebuildResouces2ResJson(dir: any, cb: any): Promise<any[]>;
export declare function findInResourceAdnCover(name: any, data: any): boolean;
export declare function updateResourceConfigFileContent(filename: string): Promise<string>;
export declare function updateOldResourceConfigFileContent(filename: string, data: any): Promise<string>;
export declare function isHaveIllegalName(name: string): boolean;
export declare function checkIfHaveNullInConfigAndDel(projectRoot: string): Promise<void>;
