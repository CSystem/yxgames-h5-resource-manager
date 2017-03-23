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
var mysql = require('mysql');
var res = require('res');
function exportMysql(p) {
    return __awaiter(this, void 0, void 0, function* () {
        var ini = path.resolve(process.cwd(), p, "ini/ini.json");
        if (!fs.existsSync(ini)) {
            throw new Error("please generate ini file use conmmand > res init");
        }
        let config = yield fs.readJSONAsync(ini);
        var connection = mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.db
        });
        connection.connect();
        let filename = path.resolve(process.cwd(), p, config.config_path);
        //查询
        for (let f of config.config) {
            connection.query('SELECT * FROM ' + 'cfg_scene_property', function (err, rows, fields) {
                if (err)
                    throw err;
                var path = filename + "/" + f + ".json";
                if (!fs.existsSync(path)) {
                    fs.createFileSync(path);
                }
                updateOldResourceConfigFileContent(path, rows);
            });
        }
        //关闭连接
        connection.end();
    });
}
exports.exportMysql = exportMysql;
function updateOldResourceConfigFileContent(filename, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = JSON.stringify(data, null, "\t");
        yield fs.writeFileAsync(filename, "{\"RECORDS\":" + content + "}", "utf-8");
        return content;
    });
}
exports.updateOldResourceConfigFileContent = updateOldResourceConfigFileContent;
