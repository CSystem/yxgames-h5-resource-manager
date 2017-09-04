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
const ast = require("egret-typescript-ast");
const path = require("path");
function printConfig(egretRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield getConfigViaDecorator(egretRoot);
        let source = getDist();
        let { resourceRoot, resourceConfigFileName, typeSelector } = data;
        let typeSelectorBody = typeSelector.toString();
        let outputData = { resourceRoot, resourceConfigFileName, typeSelectorBody, source };
        console.log(JSON.stringify(outputData));
    });
}
exports.printConfig = printConfig;
function getDist() {
    let folder = path.resolve(__dirname, "../../bin/resourcemanager");
    let bundleFiles = [
        "resourcemanager.js"
    ];
    let minFiles = [
        "resourcemanager.min.js"
    ];
    let declareFiles = [
        "resourcemanager.d.ts"
    ];
    return {
        folder, bundleFiles, minFiles, declareFiles
    };
}
exports.getDist = getDist;
function getConfigViaDecorator(egretRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let decorators = yield ast.findDecorator(path.join(egretRoot, "src/Main.ts"));
        function getFunction(name) {
            let result = decorators.filter(item => item.name == name);
            if (!result || result.length == 0 || result.length > 1) {
                return null;
            }
            else {
                let decorator = result[0];
                return decorator.paramters[0];
            }
        }
        let mapConfigDecorator = decorators.filter(item => item.name == "RES.mapConfig");
        if (!mapConfigDecorator || mapConfigDecorator.length == 0 || mapConfigDecorator.length > 1) {
            throw 'missing decorator';
        }
        let decorator = mapConfigDecorator[0];
        let resourceConfigFileName = decorator.paramters[0];
        let mergeSelector = decorator.paramters[3];
        let resourceRoot = "resource/";
        let resConfigFilePath = path.join(resourceRoot, resourceConfigFileName);
        let nameSelector = getFunction("RES.mapResourceName");
        if (!nameSelector) {
            nameSelector = (p) => p;
        }
        let typeSelector = getFunction("RES.mapResourceType");
        if (!typeSelector) {
            typeSelector = decorator.paramters[2];
        }
        let mergerSelector = getFunction("RES.mapResourceMerger");
        if (!mergerSelector) {
            mergerSelector = decorator.paramters[3];
        }
        return { resourceRoot, resourceConfigFileName, typeSelector, mergeSelector, nameSelector };
    });
}
exports.getConfigViaDecorator = getConfigViaDecorator;
