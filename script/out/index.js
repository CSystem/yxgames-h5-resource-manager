"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra-promise");
const _config = require("./config");
const _build = require("./build");
const _upgrade = require("./upgrade");
const vfs = require("./FileSystem");
const _rebuild = require("./rebuild");
const _init = require("./init");
const _mysql = require("./mysql");
const _json2ts = require("./json2ts");
exports.config = _config;
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
    var resourcePath;
    function addFile(r) {
        var f = r.url;
        var ext = f.substr(f.lastIndexOf(".") + 1);
        if (r.type == ResourceConfig.typeSelector(r.name)) {
            r.type = "";
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
            resourcePath = path.resolve(projectPath, result.resourceRoot);
            let filename = path.resolve(process.cwd(), projectPath, result.resourceRoot, result.resourceConfigFileName);
            let data;
            try {
                data = yield fs.readJSONAsync(filename);
            }
            catch (e) {
                console.warn(`${filename}解析失败,使用初始值`);
                data = { alias: {}, groups: {}, resources: {} };
            }
            console.log("init data : " + filename);
            vfs.init(data.resources);
            ResourceConfig.config = data;
            ResourceConfig.oldConfig = { groups: [], resources: [] };
            return result;
        });
    }
    ResourceConfig.init = init;
})(ResourceConfig = exports.ResourceConfig || (exports.ResourceConfig = {}));
exports.build = _build;
exports.upgrade = _upgrade;
exports.rebuild = _rebuild;
exports.init = _init;
exports.mysql = _mysql;
exports.json2ts = _json2ts;
