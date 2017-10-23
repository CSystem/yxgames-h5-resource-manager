import { Data } from './index';
import * as path from 'path';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';
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
export * from './tools';

export var init = _init;
export var mysql = _mysql;
export var json2ts = _json2ts;
export var config = _config;
export var zip = _zip;

export let handleException = (e: string | Error) => {
    if (typeof e == 'string') {
        console.log(`错误:${e}`);
    }
    else {
        console.log(`错误:${e.stack}`);
    }
}

enum ResourceNodeType {
    FILE, DICTIONARY
}

export namespace iniConfig {
    export interface IniConfigData {
        database: DataBaseHost;
        config: Array<string>;
        config_path: string;
        language_source_path: string;
        language_destination_path: string;
        addGroupAllowDir: Array<string>;
        isCoverOldGroup: boolean;
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

export interface GeneratedDictionary {

    [file: string]: GeneratedFile | GeneratedDictionary

}

export type GeneratedFile = string | vfs.File;

export interface GeneratedData {

    resources: GeneratedDictionary

    groups: {
        [groupName: string]: string[]
    },

    alias: {
        [aliasName: string]: string
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
        subkeys?: string;
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

    function loop(r: vfs.Dictionary, callback: (file: vfs.File) => void) {
        for (var key in r) {
            var f = r[key];
            if (isFile(f)) {
                callback(f);
            }
            else {
                loop(f, callback);
            }

        }
    }

    function isFile(r: any): r is vfs.File {
        return r.url;
    }

    export function getConfig() {
        return config;
    }

    export async function generateClassicalConfig(filename: string) {
        let result: original.Info = {
            groups: [],
            resources: []
        }
        let resources = config.resources;

        let alias = {};
        for (var aliasName in config.alias) {
            alias[config.alias[aliasName]] = aliasName;
        }

        loop(resources, (f) => {
            let r: original.ResourceInfo = f;
            if (alias[r.name]) {
                r.name = alias[r.name]
            }
            result.resources.push(r);
        })
        await fs.writeJSONAsync(filename, result)
    }

    export function generateConfig(debug: boolean): GeneratedData {

        let loop = (r: GeneratedDictionary) => {
            for (var key in r) {
                var f = r[key];
                if (isFile(f)) {
                    if (typeof (f) == "string") {
                        continue;
                    }

                    if (!debug) {
                        delete f.name;
                        if (ResourceConfig.typeSelector(f.url) == f.type) {
                            delete f.type;
                        }
                        if (Object.keys(f).length == 1) {
                            r[key] = f.url;
                        }
                    }
                }
                else {
                    loop(f);
                }

            }
        }

        let isFile = (r: GeneratedDictionary[keyof GeneratedDictionary]): r is GeneratedFile => {
            if (r['url']) {
                return true;
            }
            else {
                return false;
            }
        }

        let generatedData: GeneratedDictionary = JSON.parse(JSON.stringify(config.resources));
        loop(generatedData);
        let result: GeneratedData = {
            alias: config.alias,
            groups: config.groups,
            resources: generatedData
        }
        return result;
    }

    export var config: Data;

    export var typeSelector: (path: string) => string;

    export var nameSelector: (path: string) => string;

    export var mergeSelector: (path: string) => { path: string, alias: string } | null;

    var resourcePath: string;

    export function addFile(r: vfs.File, checkDuplicate: boolean) {
        let {url, name} = r;
        url = url.split("\\").join("/");
        name = name.split("\\").join("/");
        r.url = url;
        r.name = name;

        if (checkDuplicate) {
            let a = vfs.getFile(r.name)
            if (a && a.url != r.url) {
                console.warn("duplicate: " + r.url + " => " + a.url)
            }
        }
        vfs.addFile(r);
    }

    export function getFile(filename: string): vfs.File | undefined {
        return vfs.getFile(filename);
    }

    export async function init(projectPath) {
        let result = await _config.getConfigViaDecorator(projectPath);
        typeSelector = result.typeSelector;
        mergeSelector = result.mergeSelector;
        resourcePath = path.resolve(projectPath, result.resourceRoot);
        let filename = path.resolve(process.cwd(), projectPath, result.resourceRoot, result.resourceConfigFileName);;
        config = { alias: {}, groups: {}, resources: {} };
        vfs.init(config.resources);
        return result;

    }
}