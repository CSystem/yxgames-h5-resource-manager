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
const w = require("watch");
const build = require("./build");
const path = require("path");
const config = require("./config");
function watch(p, format) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield config.getConfigViaDecorator(p);
        let root = path.join(p, result.resourceRoot);
        w.createMonitor(root, (m) => {
            m.on("created", (f) => compileChanged(f, "added"))
                .on("removed", (f) => compileChanged(f, "removed"));
            // .on("changed", (f) => compileChanged(f, "modified"));
        });
        function compileChanged(f, type) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("res-watch:file changed start");
                yield build.build(p, format);
                console.log("res-watch:file changed finish");
            });
        }
    });
}
exports.watch = watch;
