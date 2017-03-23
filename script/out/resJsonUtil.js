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
//清理项目，清除default.res.json里的非法数据
function clean(p) {
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
        yield checkIfHaveNullInConfigAndDel(projectRoot);
        yield updateResourceConfigFileContent(filename);
    });
}
exports.clean = clean;
//重新建立对应目录的资源引用
function rebuild(p, d) {
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
        let filename = path.join(projectRoot, "resource/default.res.json");
        if (!fs.existsSync(filename)) {
            filename = path.join(projectRoot, "resource/resource.json");
        }
        if (!fs.existsSync(filename)) {
            return;
        }
        let config = _1.ResourceConfig.config;
        let resourceJson = yield fs.readJSONAsync(filename);
        _1.ResourceConfig.oldConfig = resourceJson;
        d = "resource/" + d;
        rebuildResouces2ResJson(d, doThing);
        yield updateOldResourceConfigFileContent(filename, _1.ResourceConfig.oldConfig);
    });
}
exports.rebuild = rebuild;
function doThing(fileName) {
    console.log(fileName);
}
exports.doThing = doThing;
function rebuildResouces2ResJson(dir, cb) {
    var pList = [];
    var states = fs.statSync(dir);
    if (states.isDirectory()) {
        var files = fs.readdirSync(dir);
        files.forEach(function (file) {
            pList.push(rebuildResouces2ResJson(dir + '/' + file, cb));
        });
    }
    else if (states.isFile()) {
        pList.push(cb(dir));
        var file = path.basename(dir);
        var fileNameNoExt = file.split('.')[0];
        var ext = path.extname(file);
        var dirSplit = path.dirname(dir).split('/');
        var dirName = dirSplit[dirSplit.length - 1];
        var filename = file.replace('.', '_');
        var newResDict = {};
        newResDict.name = filename;
        newResDict.dir = dirName;
        var url = dir;
        newResDict.url = url;
        if (".png" == ext) {
            newResDict.type = "image";
        }
        else {
            newResDict.type = "json";
        }
        findInResourceAdnCover(filename, newResDict);
    }
    return Promise.all(pList);
}
exports.rebuildResouces2ResJson = rebuildResouces2ResJson;
function findInResourceAdnCover(name, data) {
    let bfind = false;
    if (null == _1.ResourceConfig.oldConfig.resources)
        return;
    for (let r of _1.ResourceConfig.oldConfig.resources) {
        if (r.name == name) {
            r.name = data.name;
            r.url = data.url;
            r.type = data.type;
            r.dir = data.dir;
            bfind = true;
            console.log("Cover:" + name);
        }
    }
    if (!bfind) {
        _1.ResourceConfig.oldConfig.resources.push(data);
        console.log("Add:" + name);
    }
    return bfind;
}
exports.findInResourceAdnCover = findInResourceAdnCover;
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
function updateOldResourceConfigFileContent(filename, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = JSON.stringify(data, null, "\t");
        yield fs.writeFileAsync(filename, content, "utf-8");
        return content;
    });
}
exports.updateOldResourceConfigFileContent = updateOldResourceConfigFileContent;
function isHaveIllegalName(name) {
    if (-1 == name.lastIndexOf("ske2") || -1 == name.lastIndexOf("tex2") ||
        -1 == name.lastIndexOf("ske3") || -1 == name.lastIndexOf("tex3") ||
        -1 == name.lastIndexOf("icon2"))
        return true;
}
exports.isHaveIllegalName = isHaveIllegalName;
//检测是否有不合法的数据并清除
function checkIfHaveNullInConfigAndDel(projectRoot) {
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
        let pre2Del = [];
        for (let r of resourceJson.resources) {
            if (isHaveIllegalName(r.name)) {
                pre2Del.push(r);
            }
        }
        for (let i of pre2Del) {
            var idx = resourceJson.resources.lastIndexOf(i);
            resourceJson.resources.slice(idx, 1);
            console.log("Delete:" + i.name);
        }
        pre2Del.length = 0;
        for (let g of resourceJson.groups) {
            if ("" == g.keys || "" == g.name) {
                pre2Del.push(g);
            }
        }
        for (let i of pre2Del) {
            var idx = resourceJson.groups.lastIndexOf(i);
            resourceJson.groups.slice(idx, 1);
            console.log("Delete:" + i.name);
        }
        yield updateOldResourceConfigFileContent(filename, resourceJson);
    });
}
exports.checkIfHaveNullInConfigAndDel = checkIfHaveNullInConfigAndDel;
