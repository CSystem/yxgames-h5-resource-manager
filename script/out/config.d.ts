export declare function getResourceRoot(): string;
export declare function printConfig(egretRoot: any): Promise<void>;
export declare function getDist(): {
    folder: string;
    bundleFiles: string[];
    minFiles: string[];
    declareFiles: string[];
};
export declare function getConfigViaDecorator(egretRoot: string): Promise<{
    resourceRoot: string;
    resourceConfigFileName: any;
    typeSelector: (p: string) => string;
    mergeSelector: any;
    nameSelector: (p: string) => string;
}>;
