import { Data } from './index';
import * as vfs from './FileSystem';
import * as _config from './config';
import * as _init from './init';
import * as _mysql from './mysql';
import * as _json2ts from './json2ts';
import * as _zip from './zipCompress';
export * from './watch';
export * from './config';
export * from './upgrade';
export * from './build';
export * from './version';
export * from './html';
export * from './json2ts';
export declare var init: typeof _init;
export declare var mysql: typeof _mysql;
export declare var json2ts: typeof _json2ts;
export declare var config: typeof _config;
export declare var zip: typeof _zip;
export declare namespace iniConfig {
    interface IniConfigData {
        database: DataBaseHost;
        config: Array<string>;
        config_path: string;
        language_source_path: string;
        language_destination_path: string;
        addGroupAllowDir: Array<string>;
        isCoverOldGroup: boolean;
    }
    interface DataBaseHost {
        host: string;
        port: number;
        user: string;
        password: string;
        db: string;
        charset: string;
        cursorclass: string;
    }
}
export interface GeneratedDictionary {
    [file: string]: GeneratedFile | GeneratedDictionary;
}
export declare type GeneratedFile = string | vfs.File;
export interface GeneratedData {
    resources: GeneratedDictionary;
    groups: {
        [groupName: string]: string[];
    };
    alias: {
        [aliasName: string]: string;
    };
}
export declare namespace original {
    interface Info {
        groups: GroupInfo[];
        resources: ResourceInfo[];
    }
    interface GroupInfo {
        keys: string;
        name: string;
    }
    interface ResourceInfo {
        name: string;
        type: string;
        url: string;
        subkeys?: string;
    }
}
export interface Data {
    resources: vfs.Dictionary;
    groups?: {
        [groupName: string]: string[];
    };
    alias?: {
        [aliasName: string]: string;
    };
}
export declare var data: Data;
export declare function print(): void;
export declare namespace ResourceConfig {
    function getConfig(): Data;
    function generateClassicalConfig(filename: string): Promise<void>;
    function generateConfig(debug: boolean): GeneratedData;
    var config: Data;
    var typeSelector: (path: string) => string;
    var nameSelector: (path: string) => string;
    var mergeSelector: (path: string) => {
        path: string;
        alias: string;
    } | null;
    function addFile(r: vfs.File, checkDuplicate: boolean): void;
    function getFile(filename: string): vfs.File | undefined;
    function init(projectPath: any): Promise<{
        resourceRoot: string;
        resourceConfigFileName: any;
        typeSelector: (p: string) => string;
        mergeSelector: any;
        nameSelector: (p: string) => string;
    }>;
}
