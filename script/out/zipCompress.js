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
const _1 = require("./");
const path = require("path");
function zipCompress(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let projectRoot = "/Users/wangpengfei/Documents/YxGames/ACTGameH5";
        let result = yield _1.ResourceConfig.init(projectRoot);
        let resourceFolder = path.join(projectRoot, result.resourceRoot);
        console.log(resourceFolder);
    });
}
exports.zipCompress = zipCompress;
