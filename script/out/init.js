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
//拷贝生成工程配置文件
function copyIni(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = path.resolve(process.cwd(), p, "ini");
        if (!fs.existsSync(filename)) {
            fs.mkdirsSync(filename);
        }
        let folder = path.resolve(__dirname, "../../");
        let source = path.join(folder, "ini");
        let target = path.join(p, "ini");
        yield fs.copyAsync(source, target);
        // source = path.join(folder, "README.md");
        // target = path.resolve(target, "README.md");
        // var content = await fs.readFileAsync(source);
        // await fs.writeFile(target, content);
    });
}
exports.copyIni = copyIni;
//初始化工具，在项目里生成工具使用所需要的配置文件,测试工具生成配置时使用
function init(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let filename = path.resolve(process.cwd(), p, "ini");
        if (!fs.existsSync(filename)) {
            fs.mkdirsSync(filename);
        }
        filename = path.resolve(process.cwd(), p, "ini/ini.json");
        if (!fs.existsSync(filename)) {
            fs.createFileSync(filename);
        }
        var data = {};
        data.database = {};
        data.database.host = '192.168.1.189';
        data.database.user = 'root';
        data.database.password = '1QAZ2wsx3EDC';
        data.database.db = 'actdb';
        data.database.port = 3306;
        data.config_path = "resource/cfg/";
        data.language_source_path = "resource/cfg/txt.json";
        data.language_destination_path = "src/game/const/LocalLang.ts";
        data.addGroupAllowDir = [
            "dragonebones"
        ];
        data.isCoverOldGroup = false;
        data.config = [
            "cfg_attribute",
            "cfg_chat_choice",
            "cfg_chat_conversation",
            "cfg_clothDetailItem",
            "cfg_explore",
            "cfg_explore_grid",
            "cfg_gift",
            "cfg_item",
            "cfg_item_des",
            "cfg_itinerary",
            "cfg_itineray_list",
            "cfg_npc",
            "cfg_npc_feel_up_condition",
            "cfg_registerCloth",
            "cfg_scene_property",
            "cfg_schedule_animation",
            "cfg_story",
            "cfg_story_appointment_dialog_trigger",
            "cfg_story_main_trigger",
            "cfg_story_npc_trigger",
            "cfg_story_option",
            "cfg_work_effect",
            "cfg_work_profession",
            "cfg_touch",
            "cfg_story_appointment_req",
            "cfg_story_appointment_dating",
            "cfg_gift_result_msg",
            "cfg_npc_animation",
            "cfg_shop",
            "cfg_shop_npc_dialog",
            "cfg_attribute"
        ];
        yield updateOldResourceConfigFileContent(filename, data);
    });
}
exports.init = init;
function updateOldResourceConfigFileContent(filename, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let content = JSON.stringify(data, null, "\t");
        yield fs.writeFileAsync(filename, content, "utf-8");
        return content;
    });
}
exports.updateOldResourceConfigFileContent = updateOldResourceConfigFileContent;
