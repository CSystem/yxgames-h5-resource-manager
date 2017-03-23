export interface File {
    url: string;
    type: string;
    name?: string;
}
export interface Dictionary {
    [file: string]: File | Dictionary | string;
}
export declare function init(d: Dictionary): Dictionary;
export declare function addFile(r: File): void;
export declare function getFile(filename: string): File;
export declare function mkdir(dirpath: string): void;
export declare function exists(dirpath: string): boolean;
