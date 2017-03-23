import { iniConfig } from './';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as vfs from './FileSystem'

export async function json2ts(p: string) {
    var ini = path.resolve(process.cwd(), p, "ini/ini.json");
    if (!fs.existsSync(ini)) {
        throw new Error("please generate ini file use conmmand > res init");
    }
    let config: iniConfig.IniConfigData = await fs.readJSONAsync(ini);
    let sourceFile = path.resolve(process.cwd(), p, config.language_source_path);
    if (!fs.existsSync(sourceFile)) {
        throw new Error("can't open " + sourceFile);
    }
    let lanJson: { key: string, val: any } = await fs.readJSONAsync(sourceFile);
    var dest = [];
    dest.push("//自动生成，请勿手动修改  by wpf \n")
    dest.push("class LocalLang {\n")
    for (var key in lanJson) {
        if (lanJson.hasOwnProperty(key)) {
            dest.push("    public static get " + key + "() : any { return " + "LangMgr.getInstance().getContent(\"" + key + "\"" + ");}\n")
        }
    }
    dest.push("}\n")
    let destFile = path.resolve(process.cwd(), p, config.language_destination_path);
    if (!fs.existsSync(destFile)) {
        fs.createFileSync(destFile);
    }
    fs.writeFile(destFile,"");
    var fWrite = fs.createWriteStream(destFile);
    for (let s of dest) {
        fWrite.write(s);
    }
}
