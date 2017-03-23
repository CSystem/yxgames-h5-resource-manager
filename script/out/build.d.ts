import { Data } from './';
export declare function build(p: string): Promise<void>;
export declare function updateResourceConfigFileContent(filename: string): Promise<string>;
export declare function convertResourceJson(projectRoot: string): Promise<Data>;
