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
const vinylfs = require("vinyl-fs");
const _1 = require("./");
const utils = require("egret-node-utils");
const fs = require("fs-extra-promise");
const path = require("path");
const merger = require("./merger");
const html = require("./html");
const config = require("./config");
const zip = require("jszip");
var map = require('map-stream');
var crc32 = require("crc32");
let projectRoot;
let resourceFolder;
let _configZip;
function build(p, format, publishPath, debug = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let resourcePath = publishPath ?
            path.join(publishPath, (yield config.getConfigViaDecorator(p)).resourceRoot) :
            undefined;
        let result = yield _1.ResourceConfig.init(p);
        _1.ResourceConfig.typeSelector = result.typeSelector;
        _1.ResourceConfig.nameSelector = result.nameSelector;
        let executeFilter = (url) => __awaiter(this, void 0, void 0, function* () {
            var ext = url.substr(url.lastIndexOf(".") + 1);
            merger.walk(url);
            let type = _1.ResourceConfig.typeSelector(url);
            let name = _1.ResourceConfig.nameSelector(url);
            if (type) {
                return { name, url, type };
            }
            else {
                return null;
            }
        });
        projectRoot = p;
        resourceFolder = path.join(projectRoot, result.resourceRoot);
        merger.init(resourceFolder);
        let option = {
            relative: true,
            ignoreHiddenFile: true
        };
        let init = (file, cb) => {
            file.original_relative = file.relative.split("\\").join("/");
            cb(null, file);
        };
        let convert = (file, cb) => {
            let crc32_file_path = crc32(file.contents);
            crc32_file_path = `${crc32_file_path.substr(0, 2)}/${crc32_file_path.substr(2)}${file.extname}`;
            file.path = `${file.base}${crc32_file_path}`;
            cb(null, file);
        };
        let convert2 = (file, cb) => __awaiter(this, void 0, void 0, function* () {
            let r = yield executeFilter(file.original_relative);
            if (r) {
                r.url = file.relative;
                _1.ResourceConfig.addFile(r, true);
                cb(null, file);
            }
            else {
                cb(null);
            }
        });
        let list = yield utils.walk(resourceFolder, () => true, option);
        let outputFile = resourcePath ?
            path.join(projectRoot, resourcePath, result.resourceConfigFileName) :
            path.join(resourceFolder, result.resourceConfigFileName);
        let stream = vinylfs.src([`**/**.*`], { cwd: resourceFolder, base: resourceFolder })
            .pipe(map(init));
        if (resourcePath) {
            stream = stream.pipe(map(convert));
        }
        let readCfg = (file, cb) => {
            if (null == this._configZip) {
                this._configZip = new zip();
            }
            file.original_relative = file.relative.split("\\").join("/");
            let stat = fs.lstatSync(file.path);
            if (stat.isDirectory()) {
                cb(null, file);
                return;
            }
            this._configZip.file(file.original_relative, fs.readFileSync(file.path));
            cb(null, file);
        };
        //资源发布目录
        let publish_resource_path = publishPath ? path.join(publishPath, "resource_publish") : undefined;
        if (publish_resource_path) {
            if (!fs.existsSync(publish_resource_path)) {
                fs.mkdirsSync(publish_resource_path);
            }
        }
        stream = stream.pipe(map(convert2).on("end", () => __awaiter(this, void 0, void 0, function* () {
            let config = _1.ResourceConfig.getConfig();
            yield convertResourceJson(projectRoot, config);
            yield updateResourceConfigFileContent(outputFile, debug);
            //await ResourceConfig.generateClassicalConfig(path.join(resourceFolder, "wing.res.json"));
            merger.output();
            if (resourcePath) {
                //修改main.min.js里的config和default版本号
                //资源发布目录 publish_resource
                let javascriptFilePath = path.join(publishPath, "main.min.js");
                let javascriptContent = fs.readFileSync(javascriptFilePath, "utf-8");
                let configPath = path.join(resourcePath, "config.json");
                let configContent = fs.readFileSync(configPath, "utf-8");
                let configCrc32 = crc32(configContent);
                let configOutputFilePath = rename("config.json", configCrc32);
                fs.writeFileSync(path.join(publish_resource_path, configOutputFilePath), configContent);
                let themeConfigPath = path.join(resourcePath, "default.thm.json");
                let themeConfigContent = fs.readFileSync(themeConfigPath, "utf-8");
                let themeConfigCrc32 = crc32(themeConfigContent);
                let themeConfigOutputFilePath = rename("default.thm.json", themeConfigCrc32);
                fs.writeFileSync(path.join(publish_resource_path, themeConfigOutputFilePath), themeConfigContent);
                javascriptContent = javascriptContent.replace("config.json", configOutputFilePath);
                javascriptContent = javascriptContent.replace("default.thm.json", themeConfigOutputFilePath);
                fs.writeFileSync(javascriptFilePath, javascriptContent, "utf-8");
                //生成cfg的zip包
                let cfgstream = vinylfs.src(['./cfg/**'], { cwd: resourceFolder, base: resourceFolder });
                cfgstream = cfgstream.pipe(map(readCfg).on("end", () => __awaiter(this, void 0, void 0, function* () {
                    if (this._configZip) {
                        this._configZip.generateAsync({ type: "uint8array", compression: "DEFLATE", })
                            .then(function (content) {
                            let configCrc32 = crc32(content);
                            let defaultCfgName = "default.cfg.zip";
                            let outputname = rename(defaultCfgName, configCrc32);
                            let cfgOutput = path.join(publish_resource_path, outputname);
                            fs.writeFileSync(cfgOutput, content, "utf-8");
                            javascriptContent = javascriptContent.replace(defaultCfgName, outputname);
                            fs.writeFileSync(javascriptFilePath, javascriptContent, "utf-8");
                        });
                    }
                })));
            }
        })));
        if (resourcePath) {
            stream = stream.pipe(vinylfs.dest(path.join(projectRoot, publish_resource_path)).on("end", () => {
                html.publish(publishPath);
            }));
        }
    });
}
exports.build = build;
function rename(fileName, crc32) {
    let index = fileName.indexOf(".");
    return fileName.substr(0, index) + "_" + crc32 + fileName.substr(index);
}
function updateResourceConfigFileContent(filename, debug) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = _1.ResourceConfig.generateConfig(debug);
        let content = JSON.stringify(config, null, "\t");
        yield fs.mkdirpAsync(path.dirname(filename));
        yield fs.writeFileAsync(filename, content, "utf-8");
        return content;
    });
}
exports.updateResourceConfigFileContent = updateResourceConfigFileContent;
function convertResourceJson(projectRoot, config) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = path.join(projectRoot, "resource/default.res.json");
        if (!fs.existsSync(filename)) {
            filename = path.join(projectRoot, "resource/resource.json");
        }
        if (!fs.existsSync(filename)) {
            return;
        }
        let resourceJson = yield fs.readJSONAsync(filename);
        for (let r of resourceJson.resources) {
            let resourceName = _1.ResourceConfig.nameSelector(r.url);
            let file = _1.ResourceConfig.getFile(resourceName);
            if (!file) {
                if (yield fs.existsAsync(path.join(resourceFolder, r.url))) {
                    _1.ResourceConfig.addFile(r, false);
                }
                else {
                    console.error(`missing file ${r.name} ${r.url}`);
                }
                continue;
            }
            if (file.name != r.name) {
                config.alias[r.name] = file.name;
            }
            for (var resource_custom_key in r) {
                if (resource_custom_key == "url" || resource_custom_key == "name") {
                    continue;
                }
                else if (resource_custom_key == "subkeys") {
                    var subkeysArr = r[resource_custom_key].split(",");
                    for (let subkey of subkeysArr) {
                        config.alias[r.name + "." + subkey] = r.url + "#" + subkey;
                        file[resource_custom_key] = r[resource_custom_key];
                    }
                }
                else {
                    //包含 type 在内的自定义属性
                    file[resource_custom_key] = r[resource_custom_key];
                }
            }
        }
        for (let group of resourceJson.groups) {
            config.groups[group.name] = group.keys.split(",");
        }
    });
}
exports.convertResourceJson = convertResourceJson;
