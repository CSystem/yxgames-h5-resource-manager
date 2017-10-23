import * as zip from 'jszip';
import { Data, ResourceConfig, GeneratedData, original } from './';
import * as path from 'path';
import * as fs from 'fs-extra-promise';

export async function zipCompress(p: string) {
    let projectRoot = "/Users/wangpengfei/Documents/YxGames/ACTGameH5";
    let result = await ResourceConfig.init(projectRoot);
    let resourceFolder = path.join(projectRoot, result.resourceRoot);
    console.log(resourceFolder);

    

}