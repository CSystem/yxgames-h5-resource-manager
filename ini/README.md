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

* 执行 ```res clean ``` 清理default.res.json 里的非法数据

* 执行 ```res rebuild {.} {dirname} ``` 重建对应目录的资源引用，会覆盖／添加到default.res.json中,例如 ```res rebuild . dragonbones/npc```

* 执行 ```res export ``` 导出数据库配置文件到项目中,具体目录需要在ini.json文件中配置

* 执行 ```res json2ts ``` 将多语言文件导出为ts脚本，对应目录需要在ni.json文件中配置

* 执行 ```res addGroup ``` 将所有文件都生成group

* 执行 ```res upgrade { your-project }``` 将旧版 res 模块升级为新版本，升级过程会完成下述操作
    
    * 将 ```egret-resource-manager``` 中包含的新版本资源管理系统的源代码复制到项目文件夹的 libs/modules 目录下
    
    * 将 ```egretProperties.json``` 中的 ```res``` 字段修改为 ```resourcemanager```

* 当游戏资源发生变化后，执行```res build { your_project }```，更新资源配置


