import { Data } from './';
export declare function build(p: string, format: "json" | "text", publishPath?: string, debug?: boolean): Promise<void>;
export declare function updateResourceConfigFileContent(filename: string, debug: boolean): Promise<string>;
export declare function convertResourceJson(projectRoot: string, config: Data): Promise<void>;
