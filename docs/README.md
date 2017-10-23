# Egret 资源管理框架游心乐动定制版

## 核心功能

* 遵循 ES6 Promise 标准的异步语法
``` javascript
RES.loadConfig().then(()=>{
    RES.getResAsync("assets/bg.jpg");
}).then(()=>{
    RES.getResAsync("assets/icon.jpg");
});
```
* 支持 ES2015 async / await 异步语法 ( 依赖白鹭引擎4.0版本 )
``` javascript
await RES.loadConfig()
await RES.getResAsync("assets/bg.jpg");
await RES.getResAsync("assets/icon.jpg");
```
## 如何使用
* 在命令行中执行 ``` npm install yxgames-h5-resource-manager -g ``` 安装命令行工具

* 执行 ```res init ``` 初始化工具集，根目录生成ini文件夹，包含工具配置文件以及readme

* 执行 ```res watch ``` 监听资源变更，自动更新default.res.json```

* 执行 ```res export ``` 导出数据库配置文件到项目中,具体目录需要在ini.json文件中配置

* 执行 ```res json2ts ``` 将多语言文件导出为ts脚本，对应目录需要在ni.json文件中配置

* 执行 ```res zipconfig { your-project }``` 将resource/cfg目录打包成zip,可以指定目录，只要存在resource/cfg目录即可

* 执行 ```res upgrade { your-project }``` 将旧版 res 模块升级为新版本，升级过程会完成下述操作
    
    * 将 ```egret-resource-manager``` 中包含的新版本资源管理系统的源代码复制到项目文件夹的 libs/modules 目录下
    
    * 将 ```egretProperties.json``` 中的 ```res``` 字段修改为 ```resourcemanager```

* 当游戏资源发生变化后，执行```res build { your_project }```，更新资源配置


# 使用 ResourceManager 发布资源
## 执行过程

* 在项目的 ```egretProperties.json``` 中添加```"resources": []```
* 执行 ``` egret publish --version version1 ``` 完成游戏 js 文件编译加密过程
* 执行 ``` res publish . bin-release/web/version1 ``` 完成资源发布和 js 文件发布
* 将游戏资源上传至游戏远程服务器 / CDN 中，不要发布到另一个文件夹，
* 增加将游戏配置文件打包zip,并添加crc32