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
const _1 = require("./");
const c = require("./config");
const utils = require("egret-node-utils");
const fs = require("fs-extra-promise");
const path = require("path");
let projectRoot;
function build(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield _1.ResourceConfig.init(p);
        _1.ResourceConfig.typeSelector = result.typeSelector;
        if (!_1.ResourceConfig.typeSelector) {
            throw new Error("missing typeSelector in Main.ts");
        }
        let executeFilter = (f) => __awaiter(this, void 0, void 0, function* () {
            let config = _1.ResourceConfig.config;
            var ext = f.substr(f.lastIndexOf(".") + 1);
            let type = _1.ResourceConfig.typeSelector(f);
            if (type) {
                return { name: f, url: f, type };
            }
        });
        projectRoot = p;
        let resourcePath = path.join(projectRoot, result.resourceRoot);
        let filename = path.join(resourcePath, "config.json");
        let option = {
            relative: true,
            ignoreHiddenFile: true
        };
        let list = yield utils.walk(resourcePath, () => true, option);
        let files = yield Promise.all(list.map(executeFilter));
        files.filter(a => a).forEach(element => _1.ResourceConfig.addFile(element));
        yield convertResourceJson(projectRoot);
        yield updateResourceConfigFileContent(filename);
    });
}
exports.build = build;
function updateResourceConfigFileContent(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = JSON.stringify(_1.ResourceConfig.config, null, "\t");
        yield fs.writeFileAsync(filename, content, "utf-8");
        return content;
    });
}
exports.updateResourceConfigFileContent = updateResourceConfigFileContent;
function updateResourceConfigFileContent_2(filename, matcher, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = yield c.publish(filename, matcher, data);
        yield fs.writeFileAsync(filename, content, "utf-8");
        return content;
    });
}
//使用新的config导出,转换旧的resjson为新的configjson
function convertResourceJson(projectRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = path.join(projectRoot, "resource/default.res.json");
        if (!fs.existsSync(filename)) {
            filename = path.join(projectRoot, "resource/resource.json");
        }
        if (!fs.existsSync(filename)) {
            return;
        }
        let config = _1.ResourceConfig.config;
        let resourceJson = yield fs.readJSONAsync(filename);
        let newConfig = {};
        for (let r of resourceJson.resources) {
            if (null == newConfig.alias)
                newConfig.alias = {};
            newConfig.alias[r.name] = r.url;
            let file = _1.ResourceConfig.getFile(r.url);
            var lastname = r.url.substr(r.url.lastIndexOf('/') + 1);
            var prename = r.url.substr(0, r.url.lastIndexOf('/') - 1);
            var directName = r.url.substr(0, r.url.lastIndexOf('/') + 1);
            var extion = r.url.substr(r.url.lastIndexOf(".") + 1);
            var fileNameNoExt = lastname.substr(0, lastname.lastIndexOf("."));
            var directNameNoExt = r.url.substr(0, r.url.lastIndexOf("."));
            var list = r.url.split("/");
            if (null == newConfig.resources) {
                newConfig.resources = {};
            }
            //解析resource
            var currentPath = newConfig.resources;
            for (var i = 0; i < list.length - 1; i++) {
                var drName = list[i];
                if (null == currentPath[drName])
                    currentPath[drName] = {};
                currentPath = currentPath[drName];
            }
            currentPath[lastname] = r.url;
            if (-1 != r.url.lastIndexOf("UIAtlas")) {
                if ("json" == extion) {
                    var newFileName = fileNameNoExt + ".png";
                    currentPath[newFileName] = directNameNoExt + ".png";
                }
            }
            var atlasName = null;
            for (var resource_custom_key in r) {
                if (resource_custom_key == "url" || resource_custom_key == "type" || resource_custom_key == "name") {
                    if ("name" == resource_custom_key) {
                        atlasName = resource_custom_key;
                    }
                    continue;
                }
                else if (resource_custom_key == "subkeys") {
                    var subkeysArr = r.subkeys.split(",");
                    for (let subkey of subkeysArr) {
                        newConfig.alias[r.name + "." + subkey] = r.url + "#" + subkey;
                    }
                }
                else {
                    if (typeof file != "string") {
                        file[resource_custom_key] = r[resource_custom_key];
                    }
                    else {
                        console.warn(`missing properties ${resource_custom_key} in ${file}`);
                    }
                }
            }
        }
        for (let group of resourceJson.groups) {
            if (null == newConfig.groups)
                newConfig.groups = {};
            var splitArr = group.keys.split(",");
            var idx = splitArr.lastIndexOf("");
            if (-1 != idx)
                splitArr.splice(idx, 1);
            newConfig.groups[group.name] = splitArr;
        }
        _1.ResourceConfig.config = newConfig;
        return _1.ResourceConfig.config;
    });
}
exports.convertResourceJson = convertResourceJson;
