import { Data, ResourceConfig, original } from './';
import * as c from './config';
import * as utils from 'egret-node-utils';
import * as fs from 'fs-extra-promise';
import * as path from 'path';
import * as vfs from './FileSystem'

let projectRoot;

export async function build(p: string) {
    let result = await ResourceConfig.init(p);
    ResourceConfig.typeSelector = result.typeSelector;
    if (!ResourceConfig.typeSelector) {
        throw new Error("missing typeSelector in Main.ts");
    }

    let executeFilter = async (f) => {
        let config = ResourceConfig.config;
        var ext = f.substr(f.lastIndexOf(".") + 1);
        let type = ResourceConfig.typeSelector(f);
        if (type) {
            return { name: f, url: f, type };
        }
    }

    projectRoot = p;
    let resourcePath = path.join(projectRoot, result.resourceRoot);
    let filename = path.join(resourcePath, "config.json");

    let option: utils.walk.WalkOptions = {
        relative: true,
        ignoreHiddenFile: true
    }

    let list = await utils.walk(resourcePath, () => true, option);
    let files = await Promise.all(list.map(executeFilter));
    files.filter(a => a).forEach(element => ResourceConfig.addFile(element));

    await convertResourceJson(projectRoot);
    await updateResourceConfigFileContent(filename);
}

export async function updateResourceConfigFileContent(filename: string) {
    let content = JSON.stringify(ResourceConfig.config, null, "\t");
    await fs.writeFileAsync(filename, content, "utf-8");
    return content;
}

async function updateResourceConfigFileContent_2(filename, matcher, data) {
    let content = await c.publish(filename, matcher, data);
    await fs.writeFileAsync(filename, content, "utf-8");
    return content;
}

//使用新的config导出,转换旧的resjson为新的configjson
export async function convertResourceJson(projectRoot: string) {
    let filename = path.join(projectRoot, "resource/default.res.json");
    if (!fs.existsSync(filename)) {
        filename = path.join(projectRoot, "resource/resource.json");
    }
    if (!fs.existsSync(filename)) {
        return;
    }
    let config = ResourceConfig.config;
    let resourceJson: original.Info = await fs.readJSONAsync(filename);
    let newConfig: Data = <Data>{};
    for (let r of resourceJson.resources) {
        if (null == newConfig.alias)
            newConfig.alias = {};
        newConfig.alias[r.name] = r.url;
        let file = ResourceConfig.getFile(r.url);
        var lastname = r.url.substr(r.url.lastIndexOf('/') + 1);
        var prename = r.url.substr(0, r.url.lastIndexOf('/') - 1);
        var directName = r.url.substr(0, r.url.lastIndexOf('/') + 1);
        var extion = r.url.substr(r.url.lastIndexOf(".") + 1);
        var fileNameNoExt = lastname.substr(0, lastname.lastIndexOf("."));
        var directNameNoExt = r.url.substr(0, r.url.lastIndexOf("."));
        var list = r.url.split("/");
        if (null == newConfig.resources) {
            newConfig.resources = {};
        }

        //解析resource
        var currentPath = newConfig.resources;
        for (var i = 0; i < list.length - 1; i++) {
            var drName = list[i];
            if (null == currentPath[drName])
                currentPath[drName] = <vfs.Dictionary>{};
            currentPath = <vfs.Dictionary>currentPath[drName];
        }
        currentPath[lastname] = r.url;

        if (-1 != r.url.lastIndexOf("UIAtlas")) {
            if ("json" == extion) {
                var newFileName = fileNameNoExt + ".png";
                currentPath[newFileName] = directNameNoExt + ".png";
            }
        }

        var atlasName = null;
        for (var resource_custom_key in r) {
            if (resource_custom_key == "url" || resource_custom_key == "type" || resource_custom_key == "name") {
                if ("name" == resource_custom_key) {
                    atlasName = resource_custom_key;
                }
                continue;
            }
            else if (resource_custom_key == "subkeys") {
                var subkeysArr = r.subkeys.split(",");
                for (let subkey of subkeysArr) {
                    newConfig.alias[r.name + "." + subkey] = r.url + "#" + subkey;
                }
            }
            else {
                if (typeof file != "string") {
                    file[resource_custom_key] = r[resource_custom_key];
                }
                else {
                    console.warn(`missing properties ${resource_custom_key} in ${file}`)
                }
            }
        }
    }

    for (let group of resourceJson.groups) {
        if (null == newConfig.groups)
            newConfig.groups = {};
        var splitArr = group.keys.split(",");
        var idx = splitArr.lastIndexOf("");
        if (-1 != idx)
            splitArr.splice(idx, 1);
        newConfig.groups[group.name] = splitArr;
    }
    ResourceConfig.config = newConfig;
    return ResourceConfig.config;
}