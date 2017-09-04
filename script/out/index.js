"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra-promise");
const vfs = require("./FileSystem");
const _config = require("./config");
const _init = require("./init");
const _mysql = require("./mysql");
const _json2ts = require("./json2ts");
const _zip = require("./zipCompress");
__export(require("./watch"));
__export(require("./config"));
__export(require("./upgrade"));
__export(require("./build"));
__export(require("./version"));
__export(require("./html"));
__export(require("./json2ts"));
exports.init = _init;
exports.mysql = _mysql;
exports.json2ts = _json2ts;
exports.config = _config;
exports.zip = _zip;
var ResourceNodeType;
(function (ResourceNodeType) {
    ResourceNodeType[ResourceNodeType["FILE"] = 0] = "FILE";
    ResourceNodeType[ResourceNodeType["DICTIONARY"] = 1] = "DICTIONARY";
})(ResourceNodeType || (ResourceNodeType = {}));
function print() {
    console.log(exports.data);
}
exports.print = print;
var ResourceConfig;
(function (ResourceConfig) {
    function loop(r, callback) {
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
    function isFile(r) {
        return r.url;
    }
    function getConfig() {
        return ResourceConfig.config;
    }
    ResourceConfig.getConfig = getConfig;
    function generateClassicalConfig(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                groups: [],
                resources: []
            };
            let resources = ResourceConfig.config.resources;
            let alias = {};
            for (var aliasName in ResourceConfig.config.alias) {
                alias[ResourceConfig.config.alias[aliasName]] = aliasName;
            }
            loop(resources, (f) => {
                let r = f;
                if (alias[r.name]) {
                    r.name = alias[r.name];
                }
                result.resources.push(r);
            });
            yield fs.writeJSONAsync(filename, result);
        });
    }
    ResourceConfig.generateClassicalConfig = generateClassicalConfig;
    function generateConfig(debug) {
        let loop = (r) => {
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
        };
        let isFile = (r) => {
            if (r['url']) {
                return true;
            }
            else {
                return false;
            }
        };
        let generatedData = JSON.parse(JSON.stringify(ResourceConfig.config.resources));
        loop(generatedData);
        let result = {
            alias: ResourceConfig.config.alias,
            groups: ResourceConfig.config.groups,
            resources: generatedData
        };
        return result;
    }
    ResourceConfig.generateConfig = generateConfig;
    var resourcePath;
    function addFile(r, checkDuplicate) {
        let { url, name } = r;
        url = url.split("\\").join("/");
        name = name.split("\\").join("/");
        r.url = url;
        r.name = name;
        if (checkDuplicate) {
            let a = vfs.getFile(r.name);
            if (a && a.url != r.url) {
                console.warn("duplicate: " + r.url + " => " + a.url);
            }
        }
        vfs.addFile(r);
    }
    ResourceConfig.addFile = addFile;
    function getFile(filename) {
        return vfs.getFile(filename);
    }
    ResourceConfig.getFile = getFile;
    function init(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield _config.getConfigViaDecorator(projectPath);
            ResourceConfig.typeSelector = result.typeSelector;
            ResourceConfig.mergeSelector = result.mergeSelector;
            resourcePath = path.resolve(projectPath, result.resourceRoot);
            let filename = path.resolve(process.cwd(), projectPath, result.resourceRoot, result.resourceConfigFileName);
            ;
            ResourceConfig.config = { alias: {}, groups: {}, resources: {} };
            vfs.init(ResourceConfig.config.resources);
            return result;
        });
    }
    ResourceConfig.init = init;
})(ResourceConfig = exports.ResourceConfig || (exports.ResourceConfig = {}));
