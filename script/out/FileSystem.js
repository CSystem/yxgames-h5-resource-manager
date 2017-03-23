"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function init(d) {
    root = d;
    return root;
}
exports.init = init;
var root = {};
function addFile(r) {
    var type = r.type;
    var filename = r.name;
    var url = r.url;
    if (!type)
        type = "";
    filename = normalize(filename);
    let basefilename = basename(filename);
    let folder = dirname(filename);
    if (!exists(folder)) {
        mkdir(folder);
    }
    let d = reslove(folder);
    if (!type) {
        d[basefilename] = url;
    }
    else {
        d[basefilename] = { url, type };
    }
}
exports.addFile = addFile;
function getFile(filename) {
    return reslove(filename);
}
exports.getFile = getFile;
function basename(filename) {
    return filename.substr(filename.lastIndexOf("/") + 1);
}
function normalize(filename) {
    return filename.split("/").filter(d => !!d).join("/");
}
function dirname(path) {
    return path.substr(0, path.lastIndexOf("/"));
}
function reslove(dirpath) {
    if (dirpath == "") {
        return root;
    }
    dirpath = normalize(dirpath);
    let list = dirpath.split("/");
    let current = root;
    for (let f of list) {
        current = current[f];
    }
    return current;
}
function mkdir(dirpath) {
    dirpath = normalize(dirpath);
    let list = dirpath.split("/");
    let current = root;
    for (let f of list) {
        if (!current[f]) {
            current[f] = {};
        }
        current = current[f];
    }
}
exports.mkdir = mkdir;
function exists(dirpath) {
    if (dirpath == "")
        return true;
    dirpath = normalize(dirpath);
    let list = dirpath.split("/");
    let current = root;
    for (let f of list) {
        if (!current[f]) {
            return false;
        }
        current = current[f];
    }
    return true;
}
exports.exists = exists;
