"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
const fs = require("fs-extra-promise");
const path = require("path");
let resourcePath;
let mergeCollection = {};
function init(p) {
    resourcePath = p;
}
exports.init = init;
function walk(f) {
    if (_1.ResourceConfig.mergeSelector) {
        let merge = _1.ResourceConfig.mergeSelector(f);
        if (merge) {
            let mergeFile = merge.path;
            merge.path = f;
            let type = _1.ResourceConfig.typeSelector(f);
            if (!type) {
                throw new Error(`missing merge type : ${merge.path}`);
            }
            if (!mergeCollection[mergeFile]) {
                mergeCollection[mergeFile] = [];
            }
            mergeCollection[mergeFile].push(merge);
        }
    }
}
exports.walk = walk;
function output() {
    for (let mergeFile in mergeCollection) {
        let outputJson = {};
        let sourceFiles = mergeCollection[mergeFile];
        if (_1.ResourceConfig.typeSelector(mergeFile) == "mergeJson") {
            sourceFiles.map(s => {
                let sourcePath = path.join(resourcePath, s.path);
                let json = fs.readJSONSync(sourcePath);
                outputJson[s.alias] = json;
            });
        }
        fs.writeFileSync(path.join(resourcePath, mergeFile), JSON.stringify(outputJson));
    }
}
exports.output = output;
