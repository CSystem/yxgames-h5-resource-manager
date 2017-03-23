import { iniConfig } from './';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as vfs from './FileSystem'
//拷贝生成工程配置文件
export async function copyIni(p: string) {
    let filename = path.resolve(process.cwd(), p, "ini");
    if (!fs.existsSync(filename)) {
        fs.mkdirsSync(filename);
    }
    let folder = path.resolve(__dirname, "../../")
    let source = path.join(folder, "ini");
    let target = path.join(p, "ini");
    await fs.copyAsync(source, target);
    // source = path.join(folder, "README.md");
    // target = path.resolve(target, "README.md");
    // var content = await fs.readFileAsync(source);
    // await fs.writeFile(target, content);
}

//初始化工具，在项目里生成工具使用所需要的配置文件,测试工具生成配置时使用
export async function init(p: string) {
    let filename = path.resolve(process.cwd(), p, "ini");
    if (!fs.existsSync(filename)) {
        fs.mkdirsSync(filename);
    }

    filename = path.resolve(process.cwd(), p, "ini/ini.json");
    if (!fs.existsSync(filename)) {
        fs.createFileSync(filename);
    }

    var data: iniConfig.IniConfigData = <iniConfig.IniConfigData>{};
    data.database = <iniConfig.DataBaseHost>{};
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
    await updateOldResourceConfigFileContent(filename, data);
}

export async function updateOldResourceConfigFileContent(filename: string, data: any) {
    let content = JSON.stringify(data, null, "\t");
    await fs.writeFileAsync(filename, content, "utf-8");
    return content;
}