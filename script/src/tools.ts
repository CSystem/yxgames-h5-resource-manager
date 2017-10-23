/**
 * file : tools.ts
 * author : wangpengfei
 * date : 2017/10/15
 * description : 
 */
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as vinylfs from 'vinyl-fs';
import * as config from './config';
import * as VinylFile from 'vinyl';
import * as zip from 'jszip';

var map = require('map-stream');
var crc32 = require("crc32");

declare interface ResVinylFile extends VinylFile {
    original_relative: string;
    contents;
    relative;
    extname;
    path;
    base;
}

export async function zipconfig(p: string, publishPath?: string) {
    let resourcePath = publishPath ?
        path.join(publishPath, (await config.getResourceRoot())) :
        undefined;

    let resourceFolder = path.join(p, (await config.getResourceRoot()));

    let publish_resource_path = publishPath ? path.join(publishPath, "resource_publish") : resourceFolder;
    if (publish_resource_path) {
        if (!fs.existsSync(publish_resource_path)) {
            fs.mkdirsSync(publish_resource_path);
        }
    }

    let readConfig = (file: ResVinylFile, cb) => {
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
    }

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
    let cfgstream = vinylfs.src(['./cfg/**'], { cwd: resourceFolder, base: resourceFolder })
    cfgstream = cfgstream.pipe(map(readConfig).on("end", async () => {
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
                        } catch (e) {
                            console.log("modify zip name error : " + e);
                        }
                    } else {
                        console.log("modify zip name error ");
                        console.log("publishPath : " + publishPath);
                        console.log("javascriptFilePath : " + javascriptFilePath);
                        console.log("javascriptContent is null ? : " + javascriptContent == null);
                    }
                });
        }
    }));
}

function rename(fileName: string, crc32: string) {
    let index = fileName.indexOf(".");
    return fileName.substr(0, index) + "_" + crc32 + fileName.substr(index)
}