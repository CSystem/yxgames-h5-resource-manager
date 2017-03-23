//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
@RES.mapConfig("config.json", () => "resource", path => {
    var ext = path.substr(path.lastIndexOf(".") + 1);
    var typeMap = {
        "jpg": "image",
        "png": "image",
        "webp": "image",
        "json": "json",
        "fnt": "font",
        "pvr": "pvr",
        "mp3": "sound"
    }
    var type = typeMap[ext];
    if (type == "json") {
        if (path.indexOf("Atlas") >= 0) {
            type = "sheet";
        } else if (path.indexOf("movieclip") >= 0) {
            type = "movieclip";
        };
    }
    return type;
})

class Main extends egret.DisplayObjectContainer {
    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView: LoadingUI;
    private timer: egret.Timer;

    private static instance = null;
    public static getInstance(): Main {
        return Main.instance;
    }
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        Main.instance = this;
    }

    private onAddToStage(event: egret.Event) {
        var assetAdapter = new AssetAdapter();
        this.stage.registerImplementation("eui.IAssetAdapter", assetAdapter);
        this.stage.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        engine.GameEngine.startEngine(this);
        this.stage.addChild(this.loadingView);
        engine.TimeAnimationClock.getInstance();
        HTTPMgr.getInstance().addAction(FriendConst.MSG_VAL, new FriendAction());
        HTTPMgr.getInstance().addAction(GiftConst.MSG_VAL, new GiftAction());
        HTTPMgr.getInstance().addAction(ChatConst.MSG_VAL, new ChatAction());
        HTTPMgr.getInstance().addAction(BagConst.MSG_VAL, new BagAction());
        HTTPMgr.getInstance().addAction(StageConst.MSG_VAL, new StageAction());
        HTTPMgr.getInstance().addAction(ScheduleConst.MSG_VAL, new ScheduleAction());
        HTTPMgr.getInstance().addAction(ServerConst.MSG_VAL, new ServerAction());
        HTTPMgr.getInstance().addAction(ShopConst.MSG_VAL, new ShopAction());
        HTTPMgr.getInstance().addAction(StoryConst.MSG_VAL, new StoryAction());
        HTTPMgr.getInstance().addAction(UserConst.MSG_VAL, new UserAction());
        HTTPMgr.getInstance().addAction(WorkConst.MSG_VAL, new WorkAction());
        HTTPMgr.getInstance().addAction(ExploreConst.MSG_VAL, new ExploreAction());
        HTTPMgr.getInstance().addAction(PayConst.MSG_VAL, new PayAction());
        HTTPMgr.getInstance().addAction(CalendarConst.MSG_VAL, new CalendarAction());
        HTTPMgr.getInstance().addAction(DiaryConst.MSG_VAL, new DiaryAction());
        HTTPMgr.getInstance().addAction(TaskConst.MSG_VAL, new TaskAction());
        UIParent.initStage(this.stage);
        HTTPMgr.getInstance().bindHttpProgressCall(this.httpProgress, this);

        //初始化Resource资源加载库
        //initiate Resource loading library
        MessageCenter.getInstance().addEventListener(EventConst.EVENT_PRELOAD_LOAD_COMPLETE, this.onBasicResLoadComplete, this);
        MessageCenter.getInstance().addEventListener(EventConst.EVENT_PRELOAD_LOAD_PROGRESS, this.onResourceProgress, this);
        PreloadMgr.getInstance().startPreload();
    }
    private httpProgress(param: any): void {
        var event: egret.ProgressEvent = param;
        if (this.loadingView != null) {
            this.loadingView.setProgress(Math.floor(100 * event.bytesLoaded / event.bytesTotal), 100);
        } else {
            // TODO 查看进度
            console.log("[Main.httpProgress] progress : " + Math.floor(100 * event.bytesLoaded / event.bytesTotal) + "%");
        }
    }
    //基本配置初始化完毕
    private onBasicResLoadComplete() {
        //初始化皮肤        
        var theme = new eui.Theme("resource/default.thm.json", this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);
        MessageCenter.getInstance().removeEventListener(EventConst.EVENT_PRELOAD_LOAD_COMPLETE, this.onBasicResLoadComplete, this);
        MessageCenter.getInstance().removeEventListener(EventConst.EVENT_PRELOAD_LOAD_PROGRESS, this.onResourceProgress, this);
        MessageCenter.getInstance().addEventListener(EventConst.EVENT_LOGIN_LOGIN_SUCCESS, this.onLoginSuccess, this);
    }

    private onThemeLoadComplete(): void {
        this.enterScene();
    }

    private async enterScene() {
        WaitingUI.generateUI();

        // var test = new DragonAnimEditorUI();
        // this.addChild(test);
        // SceneMgr.getInstance().enterSceneByType(EScene_Type.HOME);
        this.loadingView.visible = false;
        this.createGameScene();
        // var frd = new FriendFrameUI();
        // this.addChild(frd);
        // frd.open();
        // var loginui = new LoginUI();
        // this.addChild(loginui);
        // loginui.open();
        // console.log("main load FriendGiftResultUI finish");

        // WaitingUI.open();
        // TrueLoadingUI.open();
    }

    public async loadBodyGroup(name: string): Promise<void> {
        console.log("start " + name);
        await RES.loadGroup(name);
        console.log("end" + name);
    }

    // 登陆成功回调
    private onLoginSuccess(evt: egret.Event) {
        MessageCenter.getInstance().removeEventListener(EventConst.EVENT_LOGIN_LOGIN_SUCCESS, this.onLoginSuccess, this);
        MessageCenter.getInstance().addEventListener(EventConst.EVENT_PRELOAD_LOAD_COMPLETE, this.onUserNessesaryResComplete, this);
        MessageCenter.getInstance().addEventListener(EventConst.EVENT_PRELOAD_LOAD_PROGRESS, this.onResourceProgress, this);
        PreloadMgr.getInstance().doLoadNessesaryRes();
    }

    private onLoginFailed(evt: egret.Event) {
        //登陆失败
    }

    private onUserNessesaryResComplete() {
        console.log("login  onUserNessesaryResComplete...");
        MessageCenter.getInstance().removeEventListener(EventConst.EVENT_PRELOAD_LOAD_COMPLETE, this.onUserNessesaryResComplete, this);
        MessageCenter.getInstance().removeEventListener(EventConst.EVENT_PRELOAD_LOAD_PROGRESS, this.onResourceProgress, this);
        this.loadingView.parent.removeChild(this.loadingView);
        var storyCtrl = UiControllerMgr.getInstance().addCtrl(StoryCtrl);
        storyCtrl.open();
        var tipuiCtrl = UiControllerMgr.getInstance().addCtrl(TipUICtrl);
        tipuiCtrl.open();
        var gender = UserDataMgr.getInstance().myUserData.Gender;
        if (0 == gender || null == gender) {
            console.log("login  registCtrl...");
            BackgroudLoadMgr.getInstance().doloadArray(StoryMgr.getInstance().getAllNeedResInStory("100001"));
            BackgroudLoadMgr.getInstance().doloadArray(StoryMgr.getInstance().getAllNeedResInStory("201005"));
            BackgroudLoadMgr.getInstance().doloadArray(StoryMgr.getInstance().getAllNeedResInStory("202002"));
            BackgroudLoadMgr.getInstance().doloadArray(StoryMgr.getInstance().getAllNeedResInStory("202003"));
            var registCtrl = UiControllerMgr.getInstance().addCtrl(RegisterCtrl);
            if (registCtrl) {
                registCtrl.open();
            }
        } else {
            GameTimeEventCenter.getInstance().initEvent();
            // var guideProcess = StoryMgr.getInstance().GuideProcess;
            // if (0 != guideProcess) {
            //     guideProcess += 1;
            //     if (guideProcess <= 100019) {
            //         storyCtrl.triggerStory(guideProcess + "");
            //     }
            //     else {
            //         CalendarRequest.sendGet();
            //         FriendRequest.sendGet();
            //         GiftRequest.sendGet();
            //         SceneMgr.getInstance().enterSceneByType(EScene_Type.HOME);
            //     }
            // } else {
            console.log("login  success onUserNessesaryResComplete...");
            console.log(" login :  daxiao " + this.stage.stageHeight);
            CalendarRequest.sendGet();
            FriendRequest.sendGet();
            GiftRequest.sendGet();
            TaskRequest.sendGet();
            UiControllerMgr.getInstance().removeCtrl(LoginUICtrl);
            SceneMgr.getInstance().enterSceneByType(EScene_Type.HOME);
            // }
        }
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(evt: RES.ResourceEvent): void {
        var event = evt.data;
        this.setLoadinViewMsgProgress("正在加载" + event.groupName, event.itemsLoaded, event.itemsTotal);
    }
    public setLoadinViewMsgProgress(msg: string, current: number, total: number): void {
        if (this.loadingView != null) {
            this.loadingView.setMsg(msg);
            this.loadingView.setProgress(current, total);
        }
    }
    private callNativeJSONCallback(param: string): void {

    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene(): void {
        Tool.addCookie(CookieConst.COOKIE_GAME_ID, CfgMgr.getInstance().cfgData.gameId);
        Tool.addCookie(CookieConst.COOKIE_PLAT, CfgMgr.getInstance().cfgData.plat);
        var loginCtrl = UiControllerMgr.getInstance().addCtrl(LoginUICtrl);
        loginCtrl.open();
        // LoginRequest.sendLogin({ username: "wangtest20", password: "123456" });
        // if (engine.Application.isMobile) {
        //     loginCtrl.open();
        //     console.log("open loginctrl finish....native");
        // } else {
        //     console.log("open loginctrl finish.... web");
        //     var code = document.getElementById("code").innerHTML;
        //     if (code == null || code == undefined || code == "undefined") {
        //         loginCtrl.open();
        //     } else {
        //         CfgMgr.getInstance().cfgData.plat = BaseConst.PLAT_WEIXIN;
        //         Tool.addCookie(CookieConst.COOKIE_PLAT, CfgMgr.getInstance().cfgData.plat);
        //         LoginRequest.sendLogin({ username: code, password: code });
        //     }
        // }

        // TODO 直接登陆
        // var usr = engine.PlayerPrefs.get(LoginConst.USER_NAME);
        // var pwd = engine.PlayerPrefs.get(LoginConst.PASSWORD);
        // var data = { username: usr, password: pwd };
        // loginCtrl.sendLogin(data);
        // 添加js和平台代码的交互
        egret.ExternalInterface.addCallback("NativeCallBack", this.callNativeJSONCallback);
        this.timer = new egret.Timer(1000, 0);
        this.timer.addEventListener(egret.TimerEvent.TIMER, this.timerCall, this);
        this.timer.start();
        // TODO 第一步，握手，handshake
        // TODO 第二步，判断如果是网页版本，显示登陆界面，如果是手机，判断是否有默认账号，（注:目前只有支持网页版本）
        // Tool.addCookie("game_id", "1000000");
        // Tool.sendHTTP(this, this.loadingCallback, HandShakeConst.MSG_VAL, HandShakeConst.CMD_GET,
        //     HandShakeConst.PLAT, HandShakeConst.PLAT_WEB_CN,
        //     HandShakeConst.MIEI, "web");
        // Tool.sendHTTP(this, this.loadingCallback, HandShakeConst.MSG_VAL, HandShakeConst.CMD_GET,
        //     HandShakeConst.PLAT, HandShakeConst.PLAT_WEB_CN,
        //     HandShakeConst.MIEI, "web");

        // RES.getResByUrl("resource/cfg/cfg_story.zip", function (data) {
        //     var zip = new JSZip(data);
        //     console.log(zip.file("cfg_story.json").asText());
        // }, this, RES.ResourceItem.TYPE_BIN);

        // var bodyConfig: BodyConfig = new BodyConfig();
        // /// bodyConfig.appId = "wxaf4cc86fc4a8e8a1";// 测试账号
        // bodyConfig.appId = "aaaaaaa";
        // bodyConfig.debug = true;
        // if (wx) {
        //     wx.config(bodyConfig);
        //     wx.ready(function () {
        //         /// 在这里调用微信相关功能的 API
        //         console.log("fffffffffvvvvvvvvvvvxxxxxxxxxxxxx");
        //     });
        // }
    }

    private timerCallCnt: number = 0;
    /**
     * timer调用，时间间隔1秒
     */
    private timerCall(event: egret.Event) {
        // 循环事件
        this.timerCallCnt++;
        // console.log("[Main.timerCall] this.timerCallCnt : " + this.timerCallCnt);
        // 10秒钟同步服务器数据
        if (this.timerCallCnt % 10 == 0) {
            // Tool.sendHTTP(this, this.parsePingPong, PingPongConst.MSG_VAL, PingPongConst.CMD_GET);
        }
    }
    
    private parsePingPong(data: HTTPData): void {

    }
}