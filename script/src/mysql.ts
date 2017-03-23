import { Data, iniConfig, original } from './';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as vfs from './FileSystem'

var mysql = require('mysql');
var res = require('res');

export async function exportMysql(p: string) {
    var ini = path.resolve(process.cwd(), p, "ini/ini.json");
    if (!fs.existsSync(ini)) {
        throw new Error("please generate ini file use conmmand > res init");
    }
    let config: iniConfig.IniConfigData = await fs.readJSONAsync(ini);
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
            if (err) throw err;
            var path = filename + "/" + f + ".json";
            if (!fs.existsSync(path)) {
                fs.createFileSync(path);
            }
            updateOldResourceConfigFileContent(path, rows);
        });
    }
    //关闭连接
    connection.end();
}

export async function updateOldResourceConfigFileContent(filename: string, data: any) {
    let content = JSON.stringify(data, null, "\t");
    await fs.writeFileAsync(filename, "{\"RECORDS\":" + content + "}", "utf-8");
    return content;
}
