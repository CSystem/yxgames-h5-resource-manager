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
const path = require("path");
const fs = require("fs-extra-promise");
function run(projectPath) {
    return __awaiter(this, void 0, void 0, function* () {
        function copyLibrary() {
            return __awaiter(this, void 0, void 0, function* () {
                let folder = path.resolve(__dirname, "../../");
                let source = path.join(folder, "bin");
                let target = path.join(projectPath, "libs/modules");
                yield fs.copyAsync(source, target);
            });
        }
        function convertEgretProperties() {
            return __awaiter(this, void 0, void 0, function* () {
                var propertyFile = path.join(projectPath, "egretProperties.json");
                let propertyData = yield fs.readJsonAsync(propertyFile);
                delete propertyData.modules['res'];
                for (let m of propertyData.modules) {
                    if (m.name == "res") {
                        m.name = "resourcemanager";
                        m.path = ".";
                    }
                }
                yield fs.writeJSONAsync(propertyFile, propertyData);
            });
        }
        function createDecorator() {
            return __awaiter(this, void 0, void 0, function* () {
                var mainSourceFile = path.join(projectPath, "src/Main.ts");
                let contents = yield fs.readFileAsync(mainSourceFile, "utf-8");
                if (contents.indexOf("RES.mapConfig") == -1) {
                    var index = contents.indexOf("class Main");
                    if (index == -1) {
                        throw new Error("无法匹配到 class Main,升级失败");
                    }
                    contents = contents.substr(0, index) +
                        `@RES.mapConfig("config.json",()=>"resource",path => {
    var ext = path.substr(path.lastIndexOf(".") + 1);
    var typeMap = {
        "jpg": "image",
        "png": "image",
        "webp": "image",
        "json": "json",
        "fnt": "font",
        "pvr": "pvr",
        "mp3": "sound"
    }
    var type = typeMap[ext];
    if (type == "json") {
        if (path.indexOf("sheet") >= 0) {
            type = "sheet";
        } else if (path.indexOf("movieclip") >= 0) {
            type = "movieclip";
        };
    }
    return type;
})\n`
                        + contents.substr(index);
                }
                yield fs.writeFileAsync(mainSourceFile, contents, "utf-8");
            });
        }
        ;
        function modifyTypeScriptConfigFile() {
            return __awaiter(this, void 0, void 0, function* () {
                let tsconfigFile = path.join(projectPath, "tsconfig.json");
                if (!(yield fs.existsAsync(tsconfigFile))) {
                    let contents = `{
   "compilerOptions": {
      "target": "es5",
      "experimentalDecorators":true
   },
   "exclude": [
      "node_modules"
   ]
}`;
                    yield fs.writeFileAsync(tsconfigFile, contents, 'utf-8');
                }
                else {
                    let tsconfigJson = yield fs.readJSONAsync(tsconfigFile);
                    tsconfigJson.compilerOptions.experimentalDecorators = true;
                    yield fs.writeFileAsync(tsconfigFile, JSON.stringify(tsconfigJson, null, "\t"), 'utf-8');
                }
            });
        }
        yield convertEgretProperties();
        yield copyLibrary();
        yield createDecorator();
        yield modifyTypeScriptConfigFile();
    });
}
exports.run = run;
