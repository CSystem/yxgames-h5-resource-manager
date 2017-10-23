import * as htmlparser from 'htmlparser2';
import * as path from 'path';
import * as fs from 'fs-extra-promise';
import * as crc32 from 'crc32';

export async function publish(publishRoot: string, resourceConfigPath: string) {
    let indexHTML = path.join(publishRoot, 'index.html');
    let content = await fs.readFileAsync(indexHTML, "utf-8");
    let oldJSDir = {};
    let handler: htmlparser.Handler = {
        // 这里不要包含异步逻辑
        onopentag: function (name, attributes) {
            if (name == 'script' &&
                attributes['src']) {
                let src = attributes['src'];
                let javascriptFilePath = path.join(publishRoot, src);
                let javascriptContent = fs.readFileSync(javascriptFilePath, "utf-8");
                let javascriptCrc32 = crc32(javascriptContent);
                let javascritpOutFilePath = rename(src, javascriptCrc32, "js");
                fs.copySync(javascriptFilePath, path.join(publishRoot, javascritpOutFilePath))
                manifest.initial.push(javascritpOutFilePath);
                content = content.replace(src, javascritpOutFilePath);
                fs.removeSync(javascriptFilePath);
                let dir = path.dirname(src);
                let dirname = dir.split('/')[0];
                let dirpath = path.join(publishRoot, dirname);
                if (dirpath != publishRoot && dirname != "" && dirname != null && dirname != " " && fs.existsSync(dirpath)) {
                    oldJSDir[dirname] = dirpath;
                }
            }
        }
    }

    let version = Date.now().toString();
    let configPath = renameFile(path.basename(resourceConfigPath), version);
    let manifest = { initial: [] as string[], configPath };

    var parser = new htmlparser.Parser(handler, { decodeEntities: true });
    parser.parseComplete(content)
    parser.end();

    for (var key in oldJSDir) {
        if (oldJSDir.hasOwnProperty(key)) {
            var pt = oldJSDir[key];
            if (fs.existsSync(pt)) {
                fs.removeSync(pt);
                console.log("remove old JS Dir : " + pt);
            }
        }
    }

    // await fs.renameAsync(
    //     resourceConfigPath,
    //     path.join(publishRoot, 'resource/', configPath)
    // )

    let manifestPath = path.join(publishRoot, "manifest.json");
    let manifestContent = JSON.stringify(manifest, null, "\t");
    await fs.writeFileAsync(manifestPath, manifestContent, "utf-8");
    let backupManifest = path.join(publishRoot, rename("manifest.json", version, "backup"));
    await fs.mkdirpAsync(path.dirname(backupManifest));
    await fs.writeFileAsync(backupManifest, manifestContent, "utf-8");
    let indexCrc32 = crc32(content);
    await fs.writeFileAsync(renameFile(indexHTML, indexCrc32), content);
    await fs.removeAsync(indexHTML);
}

function rename(fileName: string, version: string, prefix: string) {
    let result = path.basename(fileName)
    return prefix + "/" + renameFile(fileName, version)
}

function renameFile(fileName: string, version: string) {
    let index = fileName.indexOf(".");
    fileName = fileName.substr(0, index) + "_" + version + fileName.substr(index);
    return fileName;
}
