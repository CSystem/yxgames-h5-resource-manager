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
/**
 * file : tools.ts
 * author : wangpengfei
 * date : 2017/10/15
 * description :
 */
const fs = require("fs-extra-promise");
const path = require("path");
const vinylfs = require("vinyl-fs");
const config = require("./config");
const zip = require("jszip");
var map = require('map-stream');
var crc32 = require("crc32");
function zipconfig(p, publishPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let resourcePath = publishPath ?
            path.join(publishPath, (yield config.getResourceRoot())) :
            undefined;
        let resourceFolder = path.join(p, (yield config.getResourceRoot()));
        let publish_resource_path = publishPath ? path.join(publishPath, "resource_publish") : resourceFolder;
        if (publish_resource_path) {
            if (!fs.existsSync(publish_resource_path)) {
                fs.mkdirsSync(publish_resource_path);
            }
        }
        let readConfig = (file, cb) => {
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
        let javascriptFilePath = null;
        let javascriptContent = null;
        if (publishPath) {
            console.log("start modify config and default url in main.min.js");
            //modify config and default url in main.min.js
            //create new resource Directory publish_resource
            javascriptFilePath = path.join(publishPath, "main.min.js");
            javascriptContent = fs.readFileSync(javascriptFilePath, "utf-8");
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
        }
        console.log("start zip config");
        //zip config Directory
        let cfgstream = vinylfs.src(['./cfg/**'], { cwd: resourceFolder, base: resourceFolder });
        cfgstream = cfgstream.pipe(map(readConfig).on("end", () => __awaiter(this, void 0, void 0, function* () {
            if (this._configZip) {
                this._configZip.generateAsync({ type: "uint8array", compression: "DEFLATE", })
                    .then(function (content) {
                    let configCrc32 = crc32(content);
                    let defaultCfgName = "default.cfg.zip";
                    let outputname = publishPath ? rename(defaultCfgName, configCrc32) : defaultCfgName;
                    let cfgOutput = path.join(publish_resource_path, outputname);
                    fs.writeFileSync(cfgOutput, content, "utf-8");
                    console.log("zip config success");
                    if (publishPath && javascriptContent) {
                        try {
                            javascriptContent = javascriptContent.replace(defaultCfgName, outputname);
                            fs.writeFileSync(javascriptFilePath, javascriptContent, "utf-8");
                            console.log("write cfg.zip new name into main.js");
                        }
                        catch (e) {
                            console.log("modify zip name error : " + e);
                        }
                    }
                    else {
                        console.log("modify zip name error ");
                        console.log("publishPath : " + publishPath);
                        console.log("javascriptFilePath : " + javascriptFilePath);
                        console.log("javascriptContent is null ? : " + javascriptContent == null);
                    }
                });
            }
        })));
    });
}
exports.zipconfig = zipconfig;
function rename(fileName, crc32) {
    let index = fileName.indexOf(".");
    return fileName.substr(0, index) + "_" + crc32 + fileName.substr(index);
}
