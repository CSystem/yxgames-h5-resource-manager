import { Data } from './index';
import * as path from 'path';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';


import * as _config from './config';
import * as _build from './build';
import * as _upgrade from './upgrade';
import * as vfs from './FileSystem'
import * as _rebuild from './rebuild';
import * as _init from './init';
import * as _mysql from './mysql';
import * as _json2ts from './json2ts';

export var config = _config;

enum ResourceNodeType {
    FILE, DICTIONARY
}

export namespace iniConfig {
    export interface IniConfigData {
        database: DataBaseHost;
        config: Array<string>;
        config_path : string;
        language_source_path : string;
        language_destination_path :string;
        addGroupAllowDir : Array<string>;
        isCoverOldGroup : boolean;
    }

    export interface DataBaseHost {
        host: string;
        port: number;
        user: string;
        password: string;
        db: string;
        charset: string;
        cursorclass: string;
    }
}

export namespace original {
    export interface Info {
        groups: GroupInfo[],
        resources: ResourceInfo[],
    }

    export interface GroupInfo {
        keys: string,
        name: string
    }

    export interface ResourceInfo {
        name: string;
        type: string;
        url: string;
        subkeys: string;
        dir: string;   //添加新的字段，描述文件上一层目录
    }
}

export interface Data {
    resources: vfs.Dictionary,
    groups?: {
        [groupName: string]: string[]
    },
    alias?: {
        [aliasName: string]: string
    }

}


export var data: Data;

export function print() {
    console.log(data);
}

export namespace ResourceConfig {

    export var config: Data;    //新的配置结构

    export var oldConfig: original.Info; //旧的配置结构

    export var typeSelector: (path: string) => string;

    var resourcePath: string;

    export function addFile(r) {

        var f = r.url;
        var ext = f.substr(f.lastIndexOf(".") + 1);
        if (r.type == typeSelector(r.name)) {
            r.type = "";
        }
        vfs.addFile(r);
    }

    export function getFile(filename: string): vfs.File {
        return vfs.getFile(filename);
    }

    export async function init(projectPath) {
        let result = await _config.getConfigViaDecorator(projectPath);
        typeSelector = result.typeSelector;
        resourcePath = path.resolve(projectPath, result.resourceRoot);
        let filename = path.resolve(process.cwd(), projectPath, result.resourceRoot, result.resourceConfigFileName);
        let data: Data;
        try {
            data = await fs.readJSONAsync(filename);
        }
        catch (e) {
            console.warn(`${filename}解析失败,使用初始值`)
            data = { alias: {}, groups: {}, resources: {} };
        }
        console.log("init data : " + filename);
        vfs.init(data.resources);
        config = data;
        oldConfig = { groups: [], resources: [] };
        return result;
    }
}

export var build = _build;

export var upgrade = _upgrade;

export var rebuild = _rebuild;

export var init = _init;

export var mysql = _mysql;

export var json2ts = _json2ts;

