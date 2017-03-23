import { Data } from './index';
import * as _config from './config';
import * as _build from './build';
import * as _upgrade from './upgrade';
import * as vfs from './FileSystem';
import * as _rebuild from './rebuild';
import * as _init from './init';
import * as _mysql from './mysql';
import * as _json2ts from './json2ts';
export declare var config: typeof _config;
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
        subkeys: string;
        dir: string;
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
    var config: Data;
    var oldConfig: original.Info;
    var typeSelector: (path: string) => string;
    function addFile(r: any): void;
    function getFile(filename: string): vfs.File;
    function init(projectPath: any): Promise<{
        resourceRoot: string;
        resourceConfigFileName: any;
        typeSelector: any;
    }>;
}
export declare var build: typeof _build;
export declare var upgrade: typeof _upgrade;
export declare var rebuild: typeof _rebuild;
export declare var init: typeof _init;
export declare var mysql: typeof _mysql;
export declare var json2ts: typeof _json2ts;
