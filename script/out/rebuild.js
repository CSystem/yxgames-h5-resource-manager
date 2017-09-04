// import { Data, ResourceConfig, original, iniConfig } from './';
// import * as c from './config';
// import * as utils from 'egret-node-utils';
// import * as fs from 'fs-extra-promise';
// import * as path from 'path';
// import * as vfs from './FileSystem';
// let projectRoot;
// //清理项目，清除default.res.json里的非法数据
// export async function clean(p: string) {
//     let result = await ResourceConfig.init(p);
//     ResourceConfig.typeSelector = result.typeSelector;
//     if (!ResourceConfig.typeSelector) {
//         throw new Error("missing typeSelector in Main.ts");
//     }
//     // let executeFilter = async (f) => {
//     //     let config = ResourceConfig.config;
//     //     var ext = f.substr(f.lastIndexOf(".") + 1);
//     //     let type = ResourceConfig.typeSelector(f);
//     //     if (type) {
//     //         return { name: f, url: f, type };
//     //     }
//     // }
//     projectRoot = p;
//     let resourcePath = path.join(projectRoot, result.resourceRoot);
//     let filename = path.join(resourcePath, "config.json");
//     let option: utils.walk.WalkOptions = {
//         relative: true,
//         ignoreHiddenFile: true
//     }
//     let list = await utils.walk(resourcePath, () => true, option);
//     let files = await Promise.all(list.map(executeFilter));
//     files.filter(a => a).forEach(element => ResourceConfig.addFile(element));
//     await checkIfHaveNullInConfigAndDel(projectRoot);
//     await updateResourceConfigFileContent(filename);
// }
// //检测是否有不合法的数据并清除
// export async function checkIfHaveNullInConfigAndDel(projectRoot: string) {
//     let filename = path.join(projectRoot, "resource/default.res.json");
//     if (!fs.existsSync(filename)) {
//         filename = path.join(projectRoot, "resource/resource.json");
//     }
//     if (!fs.existsSync(filename)) {
//         return;
//     }
//     let config = ResourceConfig.config;
//     let resourceJson: original.Info = await fs.readJSONAsync(filename);
//     let pre2Del = [];
//     for (let r of resourceJson.resources) {
//         if (isHaveIllegalName(r.name)) {
//             pre2Del.push(r);
//         }
//     }
//     for (let i of pre2Del) {
//         var idx = resourceJson.resources.lastIndexOf(i);
//         if (-1 != idx) {
//             resourceJson.resources.splice(idx, 1);
//             console.log("Delete:" + i.name);
//         }
//     }
//     pre2Del.length = 0;
//     for (let g of resourceJson.groups) {
//         if ("" == g.keys || "" == g.name) {
//             pre2Del.push(g);
//         }
//     }
//     for (let i of pre2Del) {
//         var idx = resourceJson.groups.lastIndexOf(i);
//         if (-1 != idx) {
//             resourceJson.groups.splice(idx, 1);
//             console.log("Delete:" + i.name);
//         }
//     }
//     await updateOldResourceConfigFileContent(filename, resourceJson);
// }
// //重新建立对应目录的资源引用
// export async function rebuild(p: string, d: string) {
//     let result = await ResourceConfig.init(p);
//     ResourceConfig.typeSelector = result.typeSelector;
//     if (!ResourceConfig.typeSelector) {
//         throw new Error("missing typeSelector in Main.ts");
//     }
//     let executeFilter = async (f) => {
//         let config = ResourceConfig.config;
//         var ext = f.substr(f.lastIndexOf(".") + 1);
//         let type = ResourceConfig.typeSelector(f);
//         if (type) {
//             return { name: f, url: f, type };
//         }
//     }
//     projectRoot = p;
//     let filename = path.join(projectRoot, "resource/default.res.json");
//     if (!fs.existsSync(filename)) {
//         filename = path.join(projectRoot, "resource/resource.json");
//     }
//     if (!fs.existsSync(filename)) {
//         return;
//     }
//     let config = ResourceConfig.config;
//     let resourceJson: original.Info = await fs.readJSONAsync(filename);
//     ResourceConfig.oldConfig = resourceJson;
//     var newD = "resource/" + d;
//     rebuildResouces2ResJson(newD, doThing);
//     await updateOldResourceConfigFileContent(filename, ResourceConfig.oldConfig);
// }
// export function doThing(fileName) {
//     console.log(fileName);
// }
// export function rebuildResouces2ResJson(dir, cb) {
//     var pList = [];
//     var states = fs.statSync(dir);
//     if (states.isDirectory()) {
//         var files = fs.readdirSync(dir);
//         files.forEach(function (file) {
//             if (-1 != file.lastIndexOf(".svn") || -1 != file.lastIndexOf(".DS_Store"))
//                 return;
//             pList.push(rebuildResouces2ResJson(dir + '/' + file, cb));
//         });
//     } else if (states.isFile()) {
//         if (-1 != dir.lastIndexOf(".svn") || -1 != dir.lastIndexOf(".DS_Store"))
//             return;
//         pList.push(cb(dir));
//         var file = path.basename(dir);
//         var fileNameNoExt = file.split('.')[0];
//         var ext = path.extname(file);
//         var dirSplit = path.dirname(dir).split('/');
//         var dirName = dirSplit[dirSplit.length - 1];
//         var filename = file.replace('.', '_');
//         var newResDict: original.ResourceInfo = <original.ResourceInfo>{};
//         newResDict.name = filename;
//         newResDict.dir = dirName;
//         var url: string = dir;
//         // url = root + "/" + dirName + "/" + file;
//         // url = url.replace("//", "/");
//         url = url.replace("resource/", "");
//         url = url.replace("./resource/", "");
//         url = url.replace("/resource/", "");
//         newResDict.url = url;
//         if (".png" == ext) {
//             newResDict.type = "image";
//         } else {
//             newResDict.type = "json";
//         }
//         findInResourceAdnCover(filename, newResDict);
//     }
//     return Promise.all(pList);
// }
// //根据动画文件生成group
// export async function addDBFiles2Group(p: string) {
//     var ini = path.resolve(process.cwd(), p, "ini/ini.json");
//     if (!fs.existsSync(ini)) {
//         throw new Error("please generate ini file use conmmand > res init");
//     }
//     let config: iniConfig.IniConfigData = await fs.readJSONAsync(ini);
//     let filename = path.join(p, "resource/default.res.json");
//     if (!fs.existsSync(filename)) {
//         filename = path.join(p, "resource/resource.json");
//     }
//     if (!fs.existsSync(filename)) {
//         return;
//     }
//     let resourceJson: original.Info = await fs.readJSONAsync(filename);
//     var temp = {};
//     for (let r of resourceJson.resources) {
//         if (null == r.dir || "" == r.dir)
//             continue;
//         var bAllow = false;
//         for (let d of config.addGroupAllowDir) {
//             if (-1 != r.url.lastIndexOf(d)) {
//                 bAllow = true;
//                 break;
//             }
//         }
//         if (!bAllow)
//             continue;
//         if (temp.hasOwnProperty(r.dir)) {
//             temp[r.dir].keys = temp[r.dir].keys + "," + r.name;
//         } else {
//             var group = <original.GroupInfo>{};
//             group.name = r.dir;
//             group.keys = r.name;
//             temp[group.name] = group;
//         }
//     }
//     for (var key in temp) {
//         if (temp.hasOwnProperty(key)) {
//             var item: original.GroupInfo = temp[key];
//             var badd = true;
//             for (let gg of resourceJson.groups) {
//                 if (gg.name == item.name) {
//                     if (config.isCoverOldGroup) {
//                         gg.keys = item.keys;
//                         badd = false;
//                         console.log("Cover:" + item);
//                     } else {
//                         badd = false;
//                         break;
//                     }
//                 } else {
//                     badd = true;
//                 }
//             }
//             if (badd) {
//                 resourceJson.groups.push(item);
//                 console.log("Add:" + item.name);
//             }
//         }
//     }
//     updateOldResourceConfigFileContent(filename, resourceJson);
// }
// //检测原有配置是否已经存在该group
// export function hasGroupInConfig(name) {
//     if (null == ResourceConfig.oldConfig.groups)
//         return false;
//     for (let f of ResourceConfig.oldConfig.groups) {
//         if (name == f.name)
//             return;
//     }
// }
// export function findInResourceAdnCover(name, data) {
//     let bfind = false;
//     if (null == ResourceConfig.oldConfig.resources)
//         return;
//     for (let r of ResourceConfig.oldConfig.resources) {
//         if (r.name == name) {
//             r.name = data.name;
//             r.url = data.url;
//             r.type = data.type;
//             r.dir = data.dir;
//             bfind = true;
//             console.log("Cover:" + name);
//         }
//     }
//     if (!bfind) {
//         ResourceConfig.oldConfig.resources.push(data);
//         console.log("Add:" + name);
//     }
//     return bfind;
// }
// export async function updateResourceConfigFileContent(filename: string) {
//     let content = JSON.stringify(ResourceConfig.config, null, "\t");
//     await fs.writeFileAsync(filename, content, "utf-8");
//     return content;
// }
// async function updateResourceConfigFileContent_2(filename, matcher, data) {
//     let content = await c.publish(filename, matcher, data);
//     await fs.writeFileAsync(filename, content, "utf-8");
//     return content;
// }
// export async function updateOldResourceConfigFileContent(filename: string, data: any) {
//     let content = JSON.stringify(data, null, "\t");
//     await fs.writeFileAsync(filename, content, "utf-8");
//     return content;
// }
// export function isHaveIllegalName(name: string) {
//     if (-1 != name.lastIndexOf("ske2") || -1 != name.lastIndexOf("tex2") ||
//         -1 != name.lastIndexOf("ske3") || -1 != name.lastIndexOf("tex3") ||
//         -1 != name.lastIndexOf("icon2"))
//         return true;
// }
