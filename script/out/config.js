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
const ts = require("typescript");
const _1 = require("./");
const fs = require("fs-extra-promise");
function getConfigViaDecorator(egretRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        let decorators = yield ast.findDecorator(path.join(egretRoot, "src/Main.ts"));
        decorators = decorators.filter(item => item.name == "RES.mapConfig");
        if (!decorators || decorators.length == 0 || decorators.length > 1) {
            throw new Error('missing decorator');
        }
        let decorator = decorators[0];
        let resourceConfigFileName = decorator.paramters[0];
        let typeSelector = decorator.paramters[2];
        let resourceRoot = "resource/";
        let resConfigFilePath = path.join(resourceRoot, resourceConfigFileName);
        return { resourceRoot, resourceConfigFileName, typeSelector };
    });
}
exports.getConfigViaDecorator = getConfigViaDecorator;
function publish(filename, matcher, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let replacedText = JSON.stringify(data, null, "\t");
        let config = _1.ResourceConfig.config;
        let content = yield fs.readFileAsync(filename, "utf-8");
        let sourceFile = ts.createSourceFile(filename, content, ts.ScriptTarget.ES2015, /*setParentNodes */ true);
        content = yield delint(sourceFile, matcher, replacedText);
        return content;
    });
}
exports.publish = publish;
//分析特定文件中的 exports.resource = {blablabla}，将其中右侧的内容进行替换
function delint(sourceFile, matcher, replacedText) {
    let config = _1.ResourceConfig.config;
    return new Promise((reslove, reject) => {
        function delintNode(node) {
            // ExpressionStatement  表达式
            //    |-- BinaryExpression 二元表达式
            //      |-- left  左侧
            //      |-- right  右侧
            if (node.kind == ts.SyntaxKind.ExpressionStatement) {
                if (node.expression.kind == ts.SyntaxKind.BinaryExpression) {
                    let expression = node.expression;
                    if (expression.left.getText() == matcher) {
                        let right = expression.right;
                        let positionStart = right.getStart();
                        let positionFinish = right.getWidth();
                        let fullText = sourceFile.getFullText();
                        fullText = fullText.substr(0, positionStart) + replacedText + fullText.substr(positionStart + positionFinish);
                        result = fullText;
                    }
                }
            }
            else {
                ts.forEachChild(node, delintNode);
            }
        }
        let result = "";
        let count = setInterval(() => {
            if (result) {
                clearInterval(count);
                reslove(result);
            }
        }, 100);
        delintNode(sourceFile);
    });
}
