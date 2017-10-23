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
const htmlparser = require("htmlparser2");
const path = require("path");
const fs = require("fs-extra-promise");
const crc32 = require("crc32");
function publish(publishRoot, resourceConfigPath) {
    return __awaiter(this, void 0, void 0, function* () {
        let indexHTML = path.join(publishRoot, 'index.html');
        let content = yield fs.readFileAsync(indexHTML, "utf-8");
        let oldJSDir = {};
        let handler = {
            // 这里不要包含异步逻辑
            onopentag: function (name, attributes) {
                if (name == 'script' &&
                    attributes['src']) {
                    let src = attributes['src'];
                    let javascriptFilePath = path.join(publishRoot, src);
                    let javascriptContent = fs.readFileSync(javascriptFilePath, "utf-8");
                    let javascriptCrc32 = crc32(javascriptContent);
                    let javascritpOutFilePath = rename(src, javascriptCrc32, "js");
                    fs.copySync(javascriptFilePath, path.join(publishRoot, javascritpOutFilePath));
                    manifest.initial.push(javascritpOutFilePath);
                    content = content.replace(src, javascritpOutFilePath);
                    fs.removeSync(javascriptFilePath);
                    let dir = path.dirname(src);
                    let dirname = dir.split('/')[0];
                    let dirpath = path.join(publishRoot, dirname);
                    if (dirpath != publishRoot && dirname != "" && dirname != null && dirname != " " && fs.existsSync(dirpath)) {
                        oldJSDir[dirname] = dirpath;
                    }
                }
            }
        };
        let version = Date.now().toString();
        let configPath = renameFile(path.basename(resourceConfigPath), version);
        let manifest = { initial: [], configPath };
        var parser = new htmlparser.Parser(handler, { decodeEntities: true });
        parser.parseComplete(content);
        parser.end();
        for (var key in oldJSDir) {
            if (oldJSDir.hasOwnProperty(key)) {
                var pt = oldJSDir[key];
                if (fs.existsSync(pt)) {
                    fs.removeSync(pt);
                    console.log("remove old JS Dir : " + pt);
                }
            }
        }
        // await fs.renameAsync(
        //     resourceConfigPath,
        //     path.join(publishRoot, 'resource/', configPath)
        // )
        let manifestPath = path.join(publishRoot, "manifest.json");
        let manifestContent = JSON.stringify(manifest, null, "\t");
        yield fs.writeFileAsync(manifestPath, manifestContent, "utf-8");
        let backupManifest = path.join(publishRoot, rename("manifest.json", version, "backup"));
        yield fs.mkdirpAsync(path.dirname(backupManifest));
        yield fs.writeFileAsync(backupManifest, manifestContent, "utf-8");
        let indexCrc32 = crc32(content);
        yield fs.writeFileAsync(renameFile(indexHTML, indexCrc32), content);
        yield fs.removeAsync(indexHTML);
    });
}
exports.publish = publish;
function rename(fileName, version, prefix) {
    let result = path.basename(fileName);
    return prefix + "/" + renameFile(fileName, version);
}
function renameFile(fileName, version) {
    let index = fileName.indexOf(".");
    fileName = fileName.substr(0, index) + "_" + version + fileName.substr(index);
    return fileName;
}
