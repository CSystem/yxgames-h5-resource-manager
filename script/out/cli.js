#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const res = require("./");
function getProjectPath(p) {
    return p ? p : ".";
}
var command = process.argv[2];
switch (command) {
    case "init":
        var p = getProjectPath(process.argv[3]);
        res.init.copyIni(p).catch(e => console.log(e));
        break;
    case "upgrade":
        var p = getProjectPath(process.argv[3]);
        res.upgrade.run(p).catch(e => console.log(e));
        break;
    case "build":
        var p = getProjectPath(process.argv[3]);
        res.build.build(p).catch(e => console.log(e.stack));
        break;
    case "clean":
        var p = getProjectPath(process.argv[3]);
        res.rebuild.clean(p).catch(e => console.log(e.stack));
        break;
    case "rebuild":
        var p = getProjectPath(process.argv[3]);
        var d = getProjectPath(process.argv[4]);
        res.rebuild.rebuild(p, d).catch(e => console.log(e.stack));
        break;
    case "export":
        var p = getProjectPath(process.argv[3]);
        res.mysql.exportMysql(p).catch(e => console.log(e.stack));
        break;
    case "json2ts":
        var p = getProjectPath(process.argv[3]);
        res.json2ts.json2ts(p).catch(e => console.log(e.stack));
        break;
    case "addGroup":
        var p = getProjectPath(process.argv[3]);
        res.rebuild.addDBFiles2Group(p).catch(e => console.log(e.stack));
        break;
    default:
        var p = getProjectPath(command);
        res.build.build(p).catch(e => console.log(e.stack));
        break;
}
