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
function publish(publishRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let indexHTML = path.join(publishRoot, 'index.html');
        let content = yield fs.readFileAsync(indexHTML, "utf-8");
        var parser = new htmlparser.Parser({
            // 这里不要包含异步逻辑
            onopentag: function (name, attributes) {
                if (name == 'script' &&
                    attributes['src']) {
                    let src = attributes['src'];
                    let javascriptFilePath = path.join(publishRoot, src);
                    let javascriptContent = fs.readFileSync(javascriptFilePath, "utf-8");
                    let javascriptCrc32 = crc32(javascriptContent);
                    let javascritpOutFilePath = rename(src, javascriptCrc32);
                    fs.renameSync(javascriptFilePath, path.join(publishRoot, javascritpOutFilePath));
                    content = content.replace(src, javascritpOutFilePath);
                }
            }
        }, { decodeEntities: true });
        parser.parseComplete(content);
        parser.end();
        let indexCrc32 = crc32(content);
        yield fs.writeFileAsync(rename(indexHTML, indexCrc32), content);
        yield fs.removeAsync(indexHTML);
    });
}
exports.publish = publish;
function rename(fileName, crc32) {
    let index = fileName.indexOf(".");
    return fileName.substr(0, index) + "_" + crc32 + fileName.substr(index);
}
