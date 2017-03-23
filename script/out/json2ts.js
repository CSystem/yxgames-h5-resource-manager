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
const fs = require("fs-extra-promise");
const path = require("path");
function json2ts(p) {
    return __awaiter(this, void 0, void 0, function* () {
        var ini = path.resolve(process.cwd(), p, "ini/ini.json");
        if (!fs.existsSync(ini)) {
            throw new Error("please generate ini file use conmmand > res init");
        }
        let config = yield fs.readJSONAsync(ini);
        let sourceFile = path.resolve(process.cwd(), p, config.language_source_path);
        if (!fs.existsSync(sourceFile)) {
            throw new Error("can't open " + sourceFile);
        }
        let lanJson = yield fs.readJSONAsync(sourceFile);
        var dest = [];
        dest.push("//自动生成，请勿手动修改  by wpf \n");
        dest.push("class LocalLang {\n");
        for (var key in lanJson) {
            if (lanJson.hasOwnProperty(key)) {
                dest.push("    public static get " + key + "() : any { return " + "LangMgr.getInstance().getContent(\"" + key + "\"" + ");}\n");
            }
        }
        dest.push("}\n");
        let destFile = path.resolve(process.cwd(), p, config.language_destination_path);
        if (!fs.existsSync(destFile)) {
            fs.createFileSync(destFile);
        }
        fs.writeFile(destFile, "");
        var fWrite = fs.createWriteStream(destFile);
        for (let s of dest) {
            fWrite.write(s);
        }
    });
}
exports.json2ts = json2ts;
