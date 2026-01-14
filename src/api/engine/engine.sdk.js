
/**
 * 引擎SDK调研勒
 */

class Reactive {
  static listeners = new Map(); // 存储监听者

  static data = new Proxy(
    {
      ZoomMode: "0", // 缩放模式0：以屏幕中心，1：以鼠標位置为中心
      OceanNodeNum: "0", // 海面数量 0无海面 >0 有海面
      clickPosition: "", // 鼠标焦点位置
      DynamicCloudState: "0", // 动态体积云状态 0 关 1开
      TimeModeState: "0", // 白天黑夜状态 0白天 1 黑夜
      CameraMode: "1", // 人称视角1 常规视角 2 第三人视角 3 第一人称视角
      PathAnimationState: "0", // 播放状态  0没有播放动画 1为正在播放人物漫游动画
      ShadowMode: "0", // 阴影的状态 0为没阴影，1为有阴影
      SetRoamPath: false, // 正在设置
      RoamPathParams: "100", // 路径时间参数
      RoamPathParamSpeed: "0.5", // 路径时间参数
      RoamPath: "", // 路径返回
      ReConnectRtc: "", // 重连
      measureStatus: false,
      GravityEnable: false// 重力模式状态
    },
    {
      set(target, key, value) {
        target[key] = value;
        // 通知所有监听者
        if (Reactive.listeners.has(key)) {
          for (const listener of Reactive.listeners.get(key)) {
            listener(value);
          }
        }
        return true;
      }
    }
  );

  static removeListener(key, callback) {
    // 清理监听器
    if (Reactive.listeners.has(key)) {
      const listenersArray = Reactive.listeners.get(key);
      const index = listenersArray.indexOf(callback);
      if (index !== -1) {
        listenersArray.splice(index, 1); // 移除指定的监听器
      }
    }
  }

  static registerListener(key, callback) {
    Reactive.removeListener(key, callback);
    // 深层监听状态回调
    if (!Reactive.listeners.has(key)) {
      Reactive.listeners.set(key, []);
    }
    Reactive.listeners.get(key).push(callback);
  }

  static updateMessage(key, newMessage) {
    this.data[key] = newMessage; // 更新响应式变量
  }

  static getMessage(key) {
    // 浅层获取响应式状态
    return this.data[key];
  }
}

export class Medusa {


  /** 以下为枚举值 */
  static EnumEvents = Object.freeze({
    OnEngineLoaded: "OnEngineLoaded", // 引擎加载的回调
    OnEngineInited: "OnEngineInited", // 初始化引擎的回调
    OnModelLoaded: "OnModelLoaded", // 模型加载回调
    OnModelRemoved: "OnModelRemoved", // 模型移除回调
    OnModelProcess: "OnModelProcess", // 模型加载进度回调
    OnElementSelected: "OnElementSelected", // 构件点击回调
    OnGetCameraView: "OnGetCameraView", // 回去视点回调
    OnMeasureResult: "OnMeasureResult", // 测量事件回调
    OnGetCenterByMutipleId: "OnGetCenterByMutipleId", // 多组id获取中心点回调
    OnGetCenterById: "OnGetCenterById", // 根据Id获取中心点位置回调
    OnGetModelList: "OnGetModelList", // 获取已加载模型列表回调
    OnGetModelInfo: "OnGetModelInfo", // 根据模型Id获取模型空间位子的回调
    OnPersonRoamPath: "OnPersonRoamPath", // 根据模型Id获取模型空间位子的回调
    NoElementFound: "NoElementFound",
    OnMessageCallback: "OnMessageCallback",
    OnCameraPos: "OnCameraPos",
    NoModel: "NoModel",
    /**
     * 靠近构件的回调，
     * @param elements:响应参数,靠近的构件数组，[{tag:"",elementId:"",position:""}]
     */
    OnCloseToElement: "OnCloseToElement",
    OnMultiplePosition: "OnMultiplePosition", // 批量获取构件位置的回调
    OnClickPointMarker: "OnClickPointMarker", // 批量获取构件位置的回调
    OnGet2dPosBy3dPos: "OnGet2dPosBy3dPos", // 3d坐标转2d坐标回调
    AddChainNodeFinish: "AddChainNodeFinish", // 新增锚链完成回调
    ClearChainNodeFinish: "ClearChainNodeFinish", // 清理锚链完成回调
    UpdateChainNodeFinish: "UpdateChainNodeFinish", // 更新锚链完成回调
    SetFpsoDataFinish: "SetFpsoDataFinish", // 六自由度设置完成回调
    ClickChainTop: "ClickChainTop", // 锚链顶部的连接处点击事件回调
    ClickChainWhiteTop: "ClickChainWhiteTop"// 锚链白色的聚酯缆连接处点击事件回调
  });

  static InitGetStatus() {
    SendMessage("GetOceanNodeNum"); // 获取海面数量
    SendMessage("GetZoomMode"); // 获取缩放模式
    this.GetDynamicCloudState(); // 天空状态
    this.GetTimeModeState(); // 白天黑夜状态
    this.GetShadowMode(); // 阴影开关
    this.GetSetRoamPathStatus(); // 获取路径设置状态
    this.SetGravityEnable(false); // 关闭并获取重力开启状态
  }

  static RegisterStatusCallBack = Reactive.registerListener; // 深层获取响应式状态

  static messageCallBack = null; // 消息回调

  static reConnect() {
    SendMessage("ReConnectRtc");
  }

  static isTouchDevice() {
    let item = localStorage.getItem("preViewMode");
    if (item) {
      return true;
    }
    return "ontouchstart" in window;// || navigator.maxTouchPoints > 0;
  }

  static isMobileDevice() {
    let item = localStorage.getItem("preViewMode");
    if (item) {
      return true;
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }

  static getMessage(key) {
    // 浅层获取响应式状态
    return Reactive.getMessage(key);
  }

  /** 以下为静态私有成员 */
  static #ResponseEvents = {
    OnEngineLoaded: function() { }, // 引擎加载的回调
    OnEngineInited: function() { }, // 初始化引擎的回调
    OnModelLoaded: function() { }, // 模型加载回调
    OnModelRemoved: function() { }, // 模型移除回调
    OnModelProcess: function() { }, // 模型加载进度回调
    OnElementSelected: function() { }, // 构件点击回调
    OnGetCameraView: function() { }, // 回去视点回调
    OnMeasureResult: function() { }, // 测量事件回调
    OnGetCenterById: function() { }, // 根据Id获取中心点位置回调
    OnGetModelList: function() { }, // 获取已加载模型列表回调
    OnGetModelInfo: function() { }, // 根据模型Id获取模型空间位子的回调
    OnPersonRoamPath: function() { }, // 根据模型Id获取模型空间位子的回调
    NoElementFound: function() { },
    OnCameraPos: function() { },
    NoModel: function() { },
    OnCloseToElement: function() { },
    OnMultiplePosition: function() { },
    OnClickPointMarker: function() { },
    OnGet2dPosBy3dPos: function() { },// 3d坐标转2d坐标回调
    OnMessageCallback: function() { },
  };

  static #EngineConfiguration = {
    StreamServerUrl: "",
    CmdServerUrl: "",
    ContainerIds: [],
    ModelIds: [],
    Models: [],
    RoamCalculate: false,
    RoamCalculateDistance: 20,
    RaamCalculateInterval: 5000,
    lastView: "", // 记录上次的view
    timeHandleNum: "" // 记录上次的定时器
  };

  static CommonEngineConfig = {
    /**
     * 引擎模式:1常规模型 2人物模式
     */
    CameraMode: 1,
    /**
     * 剖切类型：normal,box,plane
     */
    ClipType: "normal"
  };

  static RenderData = {
    PointMarkerPositions: {},
    MarkerIds: [],
    OceanIds: [],
    ElementPositions: []
  };

  static #Temp = {
    TempViewFunction: null,
    OnGetCenterById: null,
    OnGetCenterByMutipleId: null,
    OnGetCenterByIdParam: null
  };

  static isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static #loadScript(res, cbFun) {
    let dom = document.getElementsByTagName("script");
    let existFlag = false;
    // Remove previously loaded scripts/styles
    for (let i = 0; i < dom.length; i++) {
      if (dom[i].src.includes(res[0].name)) {
        existFlag = true;
        break;
      }
    }

    if (!existFlag) {
      var header = document.getElementsByTagName("head")[0];
      let loadCount = 0;
      res.forEach((e) => {
        let src;
        if (e.type == "js") {
          src = document.createElement("script");
          src.setAttribute("src", e.src);
        } else {
          src = document.createElement("link");
          src.setAttribute("rel", "stylesheet");
          src.setAttribute("href", e.src);
        }
        header.appendChild(src);

        // 对于浏览器的判断是ie还是其他
        if (!(!!window.ActiveXObject || "ActiveXObject" in window)) {
          src.onload = function() {
            loadCount++;
            if (loadCount == res.length && cbFun) cbFun();
          };
        } else {
          src.onreadystatechange = function() {
            if (src.readystate == "loaded" || src.readState == "complate") {
              loadCount++;
              if (loadCount == res.length && cbFun) cbFun();
            }
          };
        }
      });
    }

    // 本项目无需切换路由，此处重复代码导致引擎重复加载
    // var header = document.getElementsByTagName("head")[0];
    // let loadCount = 0;
    // // Remove previously loaded scripts and styles
    // res.forEach((e) => {
    //   let selector = e.type === "js" ? `script[src="${e.src}"]` : `link[href="${e.src}"]`;
    //   let existingElement = header.querySelector(selector);

    //   if (existingElement) {
    //     header.removeChild(existingElement); // Remove the existing script or link
    //   }
    // });

    // // Now we can load new scripts/styles
    // res.forEach((e) => {
    //   let src;
    //   if (e.type === "js") {
    //     src = document.createElement("script");
    //     src.setAttribute("src", e.src);
    //   } else {
    //     src = document.createElement("link");
    //     src.setAttribute("rel", "stylesheet");
    //     src.setAttribute("href", e.src);
    //   }

    //   header.appendChild(src);

    //   // Check for browser type to handle loading
    //   if (!(!!window.ActiveXObject || "ActiveXObject" in window)) {
    //     src.onload = function() {
    //       loadCount++;
    //       if (loadCount === res.length && cbFun) cbFun();
    //     };
    //   } else {
    //     src.onreadystatechange = function() {
    //       if (src.readyState === "loaded" || src.readyState === "complete") {
    //         loadCount++;
    //         if (loadCount === res.length && cbFun) cbFun();
    //       }
    //     };
    //   }
    // });
  }

  /** 以下为静态成员 */
  /**
   * 注册回调事件
   * @param {*} funName 回调函数名
   * @param {*} funEvent 回调函数
   */
  static RegisterEvent(funName, funEvent) {
    if (Object.keys(this.#ResponseEvents).includes(funName)) {
      this.#ResponseEvents[funName] = funEvent;
    } else {
      console.warn("----无法注册回调枚举值之外的回调函数----");
    }
  }

  static SetPreViewMode(params) {
    if (params == true) {
      localStorage.setItem("preViewMode", true);
    } else {
      localStorage.removeItem("preViewMode");
    }
    location.reload();
  }

  /**
   * 用于加载引擎文件，可以在页面初始化后进行调研，预先加载相关的引擎文件
   */
  static LoadEngine() {
    let resources = [
      { name: "jquery-3.7.1.min.js", type: "js", src: "/medusa/jquery-3.7.1.min.js" },
      { name: "adapter-7.4.0.min.js", type: "js", src: "/medusa/adapter-7.4.0.min.js" },
      { name: "srs.sdk.js", type: "js", src: "/medusa/srs.sdk.js" },
      { name: "winlin.utility.js", type: "js", src: "/medusa/winlin.utility.js" },
      { name: "srs.page.js", type: "js", src: "/medusa/srs.page.js" },
      { name: "mqtt.min.js", type: "js", src: "/medusa/mqtt.min.js" }
    ].concat(
      this.isMobileDevice() || this.isTouchDevice()
        ? [{ name: "medusa.engine.phone.js", type: "js", src: "/medusa/medusa.engine.phone.js" }]
        : [{ name: "medusa.engine.js", type: "js", src: "/medusa/medusa.engine.js" }]
    );
    this.#loadScript(resources, this.#ResponseEvents.OnEngineLoaded);
  }

  /**
   * 初始化引擎，在容器页面中调用
   * @param {*} containerId 引擎容器的Id
   * @param {*} streamServerUrl 获取到的流传输地址
   * @param {*} cmdServerUrl 获取到的指令传输地址
   */
  static InitEngine(containerId, streamServerUrl, cmdServerUrl, height = "") {
    console.log("------初始化引擎配置------");
    // 配置引擎相关参数
    if (streamServerUrl) this.#EngineConfiguration.StreamServerUrl = streamServerUrl;
    if (cmdServerUrl) this.#EngineConfiguration.CmdServerUrl = cmdServerUrl;
    if (!this.#EngineConfiguration.ContainerIds.includes(containerId)) {
      this.#EngineConfiguration.ContainerIds.push(containerId);
    }
    let container = document.getElementById(containerId);
    let player = document.getElementById("cloud_render_player");
    if (container && !player) {
      player = document.createElement("video");
      player.setAttribute("disablePictureInPicture", "true");
      player.setAttribute("autoplay", "true");
      if (this.isIOS()) {
        player.setAttribute("webkit-playsinline", "true");
        player.setAttribute("playsinline", "true");
      }
      player.id = "cloud_render_player";
      player.setAttribute("style", `width:100%;height:${height || "100%"};object-fit:fill;`);
      container.append(player);
    } else {
      container.innerHTML = "";
      container.append(player);
    }
    window.MessageReceived = null;
    /**
     * 监听服务端响应给客户端的引擎内容
     * @param {*} message
     */
    window.MessageReceived = (message) => {
      try {
        if(this.messageCallBack)
          this.messageCallBack(message);
        if(this.#ResponseEvents.OnMessageCallback)
          this.#ResponseEvents.OnMessageCallback(message);
        var receiveArray = [];
        receiveArray = message.split("_");
        if (message == "ping server") {
          SendMessage("WebLinking_1");
        } else if (receiveArray.length > 0) {
          console.log(message);
          let cmd = receiveArray[0];
          if (cmd == "CameraView") {
            if (this.#Temp.TempViewFunction) {
              this.#Temp.TempViewFunction(receiveArray[1]);
              this.#Temp.TempViewFunction = null;
            } else this.#ResponseEvents.OnGetCameraView(receiveArray[1]);
          } else if (cmd == "OnLMouseDown" && this.CommonEngineConfig.CameraMode == 1) {
            receiveArray.shift();
            Reactive.updateMessage("clickPosition", receiveArray.join("_"));
          } else if (cmd == "OnLMouseUp" && this.CommonEngineConfig.CameraMode == 1) {
            receiveArray.shift();
            if (
              Reactive.getMessage("clickPosition") &&
              Reactive.getMessage("clickPosition") == receiveArray.join("_")
            ) {
              if (!Reactive.getMessage("measureStatus")) {
                this.ClearHighlightElement();
              }
              Reactive.updateMessage("clickPosition", "");
            }
          } else if (cmd == "ClearModel") {
            this.#EngineConfiguration.ModelIds.length = 0;
            this.#EngineConfiguration.Models.length = 0;
          } else if (cmd == "Click") {
            if (receiveArray[1].includes("chain")) {
              if (receiveArray[1].includes("b")) {
                this.#ResponseEvents.ClickChainTop(receiveArray[1], receiveArray[2]);
              } else {
                this.#ResponseEvents.ClickChainWhiteTop(receiveArray[1], receiveArray[2]);
              }
              return;
            }
            this.#ResponseEvents.OnElementSelected(receiveArray[1], receiveArray[2]);
          } else if (cmd == "RecordPath") {
            this.#ResponseEvents.OnPersonRoamPath(receiveArray[1]);
          } else if (cmd == "MutipleCenterPos") {
            let item = receiveArray[1].split(",");
            if (this.#Temp.OnGetCenterByMutipleId && this.#Temp.OnGetCenterByIdParam[item[0]]) {
              this.#Temp.OnGetCenterByMutipleId(
                [item[1], item[2], item[3]],
                this.#Temp.OnGetCenterByIdParam[item[0]]
              );
              return;
            } this.#ResponseEvents.OnGetCenterByMutipleId([item[1], item[2], item[3]]);
            receiveArray.shift();
            Medusa.UpdateElementPosition(receiveArray);
          } else if (cmd == "CenterPos") {
            if (this.#Temp.OnGetCenterById && this.#Temp.OnGetCenterByIdParam[receiveArray[1]]) {
              this.#Temp.OnGetCenterById(
                [receiveArray[2], receiveArray[3], receiveArray[4]],
                this.#Temp.OnGetCenterByIdParam[receiveArray[1]]
              );
            } else this.#ResponseEvents.OnGetCenterById([receiveArray[2], receiveArray[3], receiveArray[4]]);
          } else if (cmd == "OnDistanceMeasureResult") {
            // console.log('测量距离为' + strs1[1] + '米,x距离为' + strs1[2] + '米,y距离为' + strs1[3] + '米,z距离为' + strs1[4] + '米');
            this.#ResponseEvents.OnMeasureResult("dis", [
              receiveArray[1],
              receiveArray[2],
              receiveArray[3],
              receiveArray[4]
            ]);
          } else if (cmd == "OnAngleMeasureResult") {
            // console.log('测量角度为' + strs1[1] + '度');
            this.#ResponseEvents.OnMeasureResult("angle", receiveArray[1]);
          } else if (cmd == "OnAreaMeasureResult") {
            this.#ResponseEvents.OnMeasureResult("area", receiveArray[2]);
            // console.log('测量构件id为' + strs1[1] + ',测量构件面积为' + strs1[2] + '平方米');
          } else if (cmd == "OnMutiplePointAreaMeasureResult") {
            this.#ResponseEvents.OnMeasureResult("closedArea", receiveArray[1]);
            // console.log('测量构件id为' + strs1[1] + ',测量构件面积为' + strs1[2] + '平方米');
          } else if (cmd == "OnMutipleDistanceMeasureResult") {
            this.#ResponseEvents.OnMeasureResult("polyline", receiveArray[1]);
            // console.log('测量总距离为' + strs1[1] + '米');
          } else if (cmd == "OnModelProcess") {
            this.#ResponseEvents.OnModelProcess(receiveArray[1], receiveArray[2]);
            if (receiveArray[2] >= 1) {
              this.#ResponseEvents.OnModelLoaded(receiveArray[1], receiveArray[2]);
            }
          } else if (cmd == "ModelList") {
            // ModelList_tag1_tag2，用_隔开的内容为多个模型的tag
            receiveArray.shift();
            this.#EngineConfiguration.ModelIds = [...receiveArray];
            if (this.#ResponseEvents.OnGetModelList) {
              this.#ResponseEvents.OnGetModelList([...receiveArray]);
            }
          } else if (cmd == "ModelInfo") {
            // 返回值格式为ModelInfo_tag1_0.000000_0.000000_0.000000_0.000000_1.000000，数字分别是模型的xyz值，旋转值（角度），大小值
            receiveArray.shift();
            let modelId = receiveArray.shift();
            if (this.#ResponseEvents.OnGetModelInfo) {
              this.#ResponseEvents.OnGetModelInfo(modelId, [...receiveArray]);
            }
          } else if (cmd == "CmdConnected") {
            this.GetModelList();
            this.InitGetStatus();
            try {
              document.addEventListener("keydown", (event) => {
                if (event.key === "Escape" || event.key === "Esc") {
                  Medusa.ResetAllElement();
                }
              });
              if (this.#ResponseEvents.OnEngineInited) {
                this.#ResponseEvents.OnEngineInited();
                this.SetAttachDistance(0.2);
              }
            } catch (error) { }
            if (window.appConfig && window.appConfig.engineRenderColors) {
              this.SetRenderColor(window.appConfig.engineRenderColors);
            } else this.SetRenderColor();
          } else if (cmd == "NoElementFound") {
            if (this.#ResponseEvents.NoElementFound) {
              this.#ResponseEvents.NoElementFound();
            }
          } else if (cmd == "AddChainNodeFinish") {
            if (this.#ResponseEvents.AddChainNodeFinish) {
              this.#ResponseEvents.AddChainNodeFinish(receiveArray[receiveArray.length - 1]);
            }
          } else if (cmd == "ClearChainNodeFinish") {
            if (this.#ResponseEvents.ClearChainNodeFinish) {
              this.#ResponseEvents.ClearChainNodeFinish();
            }
          } else if (cmd == "UpdateChainNodeFinish") {
            if (this.#ResponseEvents.UpdateChainNodeFinish) {
              this.#ResponseEvents.UpdateChainNodeFinish(receiveArray[receiveArray.length - 1]);
            }
          } else if (cmd == "SetFpsoDataFinish") {
            if (this.#ResponseEvents.SetFpsoDataFinish) {
              this.#ResponseEvents.SetFpsoDataFinish();
            }
          } else if (cmd == "NoModel") {
            let model = this.#EngineConfiguration.Models.find((x) => x.name == receiveArray[1]) || {};
            this.#EngineConfiguration.ModelIds = this.#EngineConfiguration.ModelIds.filter((x) => x != model.id);
            this.#EngineConfiguration.Models = this.#EngineConfiguration.Models.filter(
              (x) => x.name != receiveArray[1]
            );
            if (this.#ResponseEvents.NoModel) {
              this.#ResponseEvents.NoModel(receiveArray[1]);
            }
          } else if (cmd == "CameraPos") {
            if (this.#ResponseEvents.OnCameraPos) {
              receiveArray.shift();
              this.#ResponseEvents.OnCameraPos([...receiveArray]);
            }
          } else if (cmd == "OceanNodeNum") {
            Reactive.updateMessage("OceanNodeNum", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "ZoomMode") {
            Reactive.updateMessage("ZoomMode", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "DynamicCloudState") {
            Reactive.updateMessage("DynamicCloudState", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "TimeModeState") {
            Reactive.updateMessage("TimeModeState", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "ClickMarker") {
            if (receiveArray[1]) {
              this.#ResponseEvents.OnClickPointMarker(receiveArray[1], receiveArray[2]);
              if (receiveArray[2] && Reactive.getMessage("CameraMode") == 1) {
                Medusa.FlyToPosition(receiveArray[2].split(","));
              }
            }
          } else if (cmd == "SetCameraMode") {
            Reactive.updateMessage("CameraMode", receiveArray[receiveArray.length - 1]);
            this.CommonEngineConfig.CameraMode = receiveArray[receiveArray.length - 1];
            if (receiveArray[receiveArray.length - 1] == 2 && this.RenderData.ElementPositions.length > 0) {
              this.GetCenterByMutipleId();
            } else {
              this.#EngineConfiguration.RoamCalculate = false;
            }
          } else if (cmd == "PathAnimationState") {
            Reactive.updateMessage("PathAnimationState", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "ShadowMode") {
            // ShadowMode
            Reactive.updateMessage("ShadowMode", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "2dPos") {
            let receiveArrayReturn = receiveArray;
            receiveArrayReturn.shift();
            this.#ResponseEvents.OnGet2dPosBy3dPos(receiveArrayReturn);
          } else if (cmd == "ResultGetSetRoamPathStatus") {
            // SetRoamPath
            Reactive.updateMessage("SetRoamPath", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "ResultGetGravityEnable") {
            // GravityEnable
            Reactive.updateMessage("GravityEnable", receiveArray[receiveArray.length - 1]);
          } else if (cmd == "ResultGetSetRoamPath") {
            // GravityEnable
            if (receiveArray[receiveArray.length - 1].length > 10) {
              let time = Reactive.getMessage("RoamPathParams");
              if (time == 100) {
                let speed = Reactive.getMessage("RoamPathParamSpeed");
                let pathAll = this.getPathLength(receiveArray[receiveArray.length - 1]);
                let time = pathAll / speed;
                this.GetSetRoamPath(time, speed);
              } else {
                Reactive.updateMessage("RoamPath", receiveArray[receiveArray.length - 1]);
              }
            }
          } else if (cmd == "ResultReConnectRtc") { // GravityEnable
            if (receiveArray[receiveArray.length - 1] == 1) { // 成功
              let aa = Reactive.getMessage("ReConnectRtc");
              clearInterval(aa);
              if (window.connectFlag) {
                location.reload();
              }
              // location.reload();
            } else {
              let aa = Reactive.getMessage("ReConnectRtc");
              clearInterval(aa);
              let nn = setInterval(() => {
                SendMessage("ReConnectRtc");
              }, 10000);
              Reactive.updateMessage("ReConnectRtc", nn);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (!this.#EngineConfiguration.StreamServerUrl && !this.#EngineConfiguration.CmdServerUrl) {
      console.log("-----引擎未初始化相关的地址参数，请先完成相关参数的初始化-----");
      return;
    }

    if (window.appConfig && window.appConfig.engineAgent) {
      // let tmpStreams = this.#EngineConfiguration.StreamServerUrl.replace("webrtc://", "").split("/");
      // let tmpCmds = this.#EngineConfiguration.CmdServerUrl.replace("tcp://", "").split("/");
      // let streamUrl = `${this.#EngineConfiguration.StreamServerUrl.replace(tmpStreams[0], location.host)}?play=/dp_engine/rtc/v1/play&streamUrl=${this.#EngineConfiguration.StreamServerUrl}`;
      // let cmdUrl = this.#EngineConfiguration.CmdServerUrl.replace(tmpCmds[0], location.host);
      ConnectServer(this.#EngineConfiguration.StreamServerUrl, this.#EngineConfiguration.CmdServerUrl);
    }
    else if (location.protocol === "https:") {
      // HTTPS 则需要先授权信任
      let streamAddr = this.#EngineConfiguration.StreamServerUrl.split("/live/");
      let mqAddr = this.#EngineConfiguration.CmdServerUrl.replace("tcp://", "").split("/");

      let pSrs = new Promise((resolve, reject) => {
        let httpsUrl = `${streamAddr[0].replace("webrtc", "https")}:1990/rtc/v1/play/`;
        fetch(httpsUrl, {
          method: "GET"
        })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject({ error, type: "流服务信任操作", url: httpsUrl });
          });
      });

      let pMqtt = new Promise((resolve, reject) => {
        let httpsUrl = `https://${mqAddr[0]}`;
        let ws = new WebSocket(`wss://${mqAddr[0]}/mqtt`, ["mqtt"]);

        ws.onopen = function(params) {
          ws.close();
          resolve(params);
        };

        ws.onerror = function(evt) {
          reject({ evt, type: "指令服务信任操作", url: httpsUrl });
        };
      });

      Promise.allSettled([pSrs, pMqtt]).then((res) => {
        let certAvailable = true;
        let windowflag = true;
        res.forEach((r) => {
          if (r.status === "rejected") {
            certAvailable = false;
            const width = window.innerWidth * 0.4;
            const height = window.innerHeight * 0.4; // 保持宽高一致
            const left = (window.innerWidth - width) * 0.55;
            const top = (window.innerHeight - height) * 0.4;
            const features = `width = ${width * window.devicePixelRatio}, height = ${
              height * window.devicePixelRatio
            }, left = ${left * window.devicePixelRatio}, top = ${top * window.devicePixelRatio}, location = no`;
            const windowInfo = window.open(r.reason.url, r.reason.type, features);
            // windowInfo.document.title = r.reason.type;
            if (windowInfo === null || typeof windowInfo === "undefined") {
              console.log("弹窗被拦截");
              // // 创建一个用于显示错误信息的div
              const errorDisplayDiv = document.createElement("div");
              errorDisplayDiv.id = "errorTips";
              errorDisplayDiv.style.position = "fixed";
              errorDisplayDiv.style.top = "20px";
              errorDisplayDiv.style.left = "50%";
              errorDisplayDiv.style.transform = "translateX(-50%)";
              errorDisplayDiv.style.padding = "10px";
              errorDisplayDiv.style.backgroundColor = "#0177f1";
              errorDisplayDiv.style.color = "white";
              errorDisplayDiv.style.zIndex = "1000";
              errorDisplayDiv.style.display = "none"; // 初始隐藏
              for (let r of res) {
                if (r.status === "rejected") {
                  certAvailable = false;
                  windowflag = false;
                  let errorMessage = "三维引擎服务因HTTPS证书认证问题被限制访问，请在地址栏授予弹窗权限并在刷新页面后进行信任操作";

                  // 显示错误信息
                  errorDisplayDiv.innerText += `${errorMessage}\r\n`;
                  errorDisplayDiv.style.display = "block"; // 显示该div
                  break;
                }
              }
              if (!document.querySelector("#errorTips")) {
                document.body.appendChild(errorDisplayDiv); // 将div添加到body中
              }
            } else {
              const errorDisplayDiv = document.createElement("div");
              errorDisplayDiv.id = "errorTips";
              errorDisplayDiv.style.position = "fixed";
              errorDisplayDiv.style.top = "20px";
              errorDisplayDiv.style.left = "50%";
              errorDisplayDiv.style.transform = "translateX(-50%)";
              errorDisplayDiv.style.padding = "10px";
              errorDisplayDiv.style.backgroundColor = "#0177f1";
              errorDisplayDiv.style.color = "white";
              errorDisplayDiv.style.zIndex = "1000";
              errorDisplayDiv.style.display = "none"; // 初始隐藏
              let errorMessage = "共二个服务地址需要信任，成功后请刷新界面";
              // 显示错误信息
              errorDisplayDiv.innerText += `${errorMessage}\r\n`;
              errorDisplayDiv.style.display = "block"; // 显示该div
              if (!document.querySelector("#errorTips")) {
                document.body.appendChild(errorDisplayDiv); // 将div添加到body中
              }
            }
          }
        });

        if (certAvailable) {
          ConnectServer(this.#EngineConfiguration.StreamServerUrl, this.#EngineConfiguration.CmdServerUrl);
        }
      });
    } else {
      ConnectServer(this.#EngineConfiguration.StreamServerUrl, this.#EngineConfiguration.CmdServerUrl);
    }
    // ConnectServer("webrtc://220.196.62.226/live/render0", "tcp://220.196.62.226:30007/channel0")
  }

  /**
   * **************************************************************以下为模型操作**************************************************************
   */

  /**
   * @param {*} position 通过3d坐标获取2d坐标
   * @returns
   */
  static Get2dPosBy3dPos(position) {
    // 通过3d坐标获取2d坐标，支持多坐标传输
    // Get2dPosBy3dPos_598.114,813.645,-14_658.162231,795.700012,-13.909426'
    SendMessage(`Get2dPosBy3dPos_${position}`);
  }

  static GetShadowMode() {
    SendMessage("GetShadowMode"); // 获取当前阴影的状态，0为没阴影，1为有阴影
  }

  static SetShadowMode(value) {
    // 显示/不显示阴影 0为没阴影，1为有阴影
    SendMessage(`SetShadowMode_${value}`);
    this.GetShadowMode();
  }

  /**
   * 动态体积云开关
   * @param {*} show 动态体积云
   * @returns
   */
  static SetDynamicCloud(show = true) {
    // 打开（true）/关闭（false）动态体积云
    SendMessage(show ? "ShowDynamicCloud" : "HideDynamicCloud");
    this.GetDynamicCloudState();
  }

  static GetDynamicCloudState() {
    // 获取当前体积云状态
    SendMessage("GetDynamicCloudState");
  }

  /**
   * 白天黑夜开关
   * @param {*} value//0白天、1黑夜
   */
  static SetTimeMode(value) {
    // 0白天、1黑夜
    SendMessage(`SetTimeMode_${value}`);
    this.GetTimeModeState();
  }

  /**
   * 白天黑夜状态
   */
  static GetTimeModeState() {
    // 获取当前是白天还是黑夜的状态
    SendMessage("GetTimeModeState");
  }

  /**
   * 向引擎中添加模型
   * @param {*} ModelId 模型参数
   * @returns {*} 响应模型加载后回调
   */
  static AddModel(ModelId, ModelName) {
    this.SetZoomSpeed(2);
    // ModelId为模型的Id,后续用于多模型加载
    if (!this.#EngineConfiguration.ModelIds.includes(ModelId)) {
      this.#EngineConfiguration.ModelIds.push(ModelId);
      this.#EngineConfiguration.Models.push({ name: ModelName, id: ModelId });
      SendMessage(`AddModel_${ModelName}_${ModelId}`);
    } else {
      this.#ResponseEvents.OnModelProcess(ModelId, 1);
    }
  }

  /**
   * 移除模型
   * @param {string} ModelId 模型Id
   */
  static RemoveModel(ModelId) {
    this.#EngineConfiguration.ModelIds = this.#EngineConfiguration.ModelIds.filter((x) => x != ModelId);
    this.#EngineConfiguration.Models = this.#EngineConfiguration.Models.filter((x) => x.id != ModelId);
    this.ClearHighlightElement();
    SendMessage(`RemoveModel_${ModelId}`);
  }

  /**
   * 清理模型
   */
  static ClearModel() {
    this.#EngineConfiguration.ModelIds = [];
    this.#EngineConfiguration.Models = [];
    SendMessage("ClearModel");
    this.ClearHighlightElement();
    this.ClearArrowNode();
    this.ClearLiquidNode();
    this.ClearMarker();
  }

  /**
   * 获取模型的列表，通过模型列表回调响应给页面
   */
  static GetModelList() {
    // 返回的信息格式为ModelList_tag1_tag2，用_隔开的内容为多个模型的tag
    SendMessage("GetModelList");
  }

  static GetModelListAsync(){


    return new Promise((resolve) => {
      this.messageCallBack = (message) => {
        if (message.startsWith("ModelList")) {
          resolve(this.#EngineConfiguration.ModelIds);
          this.messageCallBack = null;
        }
      };
      this.GetModelList();
    });
  }


  // 通过模型的ModelId值获取模型的基本信息，通过模型列表回调响应给页面
  /**
   * @param {*} ModelId 模型Id
   */
  static GetModelInfo(ModelId) {
    // 返回的信息格式为ModelInfo_tag1_0.000000_0.000000_0.000000_0.000000_1.000000，数字分别是模型的xyz值，旋转值（角度），大小值
    SendMessage(`GetModelInfo_${ModelId}`);
  }

  // 通过模型的ModelId值给模型进行着色，后面四个数字分别为rgba，rgb的范围0-255，a的范围是0-1.0
  /**
   * @param {*} ModelId 模型Id
   * @param {*} r 颜色r
   * @param {*} g 颜色g
   * @param {*} a 颜色b
   * @param {*} a 透明度0.0~1.0
   */
  static SetModelColor(ModelId, r, g, b, a) {
    SendMessage(`SetModelColor_${ModelId}_${r}_${g}_${b}_${a}`);
  }

  // 通过模型的tag值显示特定的模型
  /**
   *
   * @param {*} ModelId 模型Id
   * @param {*} visible 设置模型可见性
   */
  static SetModelVisible(ModelId, visible) {
    SendMessage(`SetModelVisible_${ModelId}_${visible}`);
  }

  /**
   * 隔离模型 通过模型的ModelId值只显示特定的模型
   * @param {*} ModelId 模型Id
   */
  static LeaveModel(ModelId) {
    SendMessage(`LeaveModel_${ModelId}`);
  }

  /**
   * 设置模型位置 通过模型的ModelId值来设置模型的位置，内容分别为xyz的坐标，默认为[0,0,0]
   * @param {*} ModelId 模型Id
   * @param {*} posArr 调整位置坐标数组按顺序为xyz坐标
   */
  static SetModelPosition(ModelId, posArr) {
    this.ClearHighlightElement();
    SendMessage(`SetModelPosition_${ModelId}_${posArr.join("_")}`);
  }

  /**
   * 通过模型的ModelId值来设置模型的xyz旋转值，单位是角度，单位是角度，默认为0.0_0.0_0.0
   * @param {*} ModelId 模型Id
   * @param {*} rx x旋转角度
   * @param {*} ry y旋转角度
   * @param {*} rz z旋转角度
   */
  static SetModelRotation(ModelId, rotateArr) {
    this.ClearHighlightElement();
    SendMessage(`SetModelRotation_${ModelId}_${rotateArr.join("_")}`);
  }

  /**
   * 通过模型的ModelId来设置模型的大小，默认为1.0
   * @param {*} ModelId 模型Id
   * @param {*} Scale 缩放比例,默认为1.0
   */
  static SetModelScale(ModelId, Scale) {
    if (Scale <= 0.3) return;
    this.ClearHighlightElement();
    SendMessage(`SetModelScale_${ModelId}_${Scale}`);
  }

  /**
   * **************************************************************以上为模型操作**************************************************************
   */
  /**
   * **************************************************************以上为构件操作**************************************************************
   */
  /**
   * 定位到构件
   * @param {String} elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   * @param {Number} distance 定位后视点到模型构件中心点的距离
   * @returns 模型定位到对应的构件，并选中高亮模型
   */
  static FlyToElement(elementId, distance = 1.5) {
    if (!elementId) return;
    SendMessage(`${"ZoomFit" + "_"}${elementId}_${distance}`);
    let _this = this;
    setTimeout(() => {
      _this.ResetAllElement();
      // _this.SetElementColor(elementId, 255, 0, 0)
      _this.HighLightElement(elementId, 0, 31, 255, 0.2);
    }, 50);
  }

  static FlyToElementNoAction(elementId, distance = 1.5) {
    if (!elementId) return;
    SendMessage(`${"ZoomFit" + "_"}${elementId}_${distance}`);
  }

  /**
   * 单线图位置定位
   * 通过元素编号定位到指定位置
   * @param {*} lineCode 元素编号
   * @param {*} distance 定位动画时间
   * @returns
   */
  static ZoomFitLineSegment(lineCode, distance = 1.5) {
    if (!lineCode) return;
    SendMessage(`${"ZoomFitLineSegment" + "_"}${lineCode}_${distance}`);
  }

  /**
   * 定位到指定位置
   * @param {Array} positions 空间坐标[x,y,z]
   * @param {Number} distance 定位后视点到模型构件中心点的距离
   * @returns 模型定位到对应的构件，并选中高亮模型
   */
  static FlyToPosition(positions, distance = 1.5) {
    // 显示所有的构件
    if (this.CommonEngineConfig.CameraMode == 1) {
      SendMessage(`ZoomFitPosition_${positions.join(",")}_${distance}`);
    }
  }

  static ShowAllElement() {
    // 显示所有的构件
    SendMessage("ShowAllElement");
  }

  /**
   * 设置构件颜色 或透明度
   * @param {*} elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   * @param {*} r 颜色r
   * @param {*} g 颜色g
   * @param {*} b 颜色b
   * @param {*} a 透明度 0.0~1.0
   */
  static SetElementColor(elementId, r, g, b, a = 1.0) {
    if (!elementId) return;
    if (a < 1) {
      this.ClearHighlightElement();
    }
    SendMessage(`${"SetElementColor" + "_"}${elementId}_${r}_${g}_${b}_${a}`);
  }

  /**
   * 设置模型构件高亮效果
   * @param {string} elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   * @param {*} g 颜色g
   * @param {*} b 颜色b
   * @param {*} a 透明度 0.0~1.0
   */
  static HighLightElement(elementId, r = 0, g = 0, b = 255, a = 1.0) {
    if (!elementId) return;
    SendMessage(`${"HighlightElement" + "_"}${elementId}_${r}_${g}_${b}_${a}`);
  }

  /**
   * 清除模型构件高亮效果
   */
  static ClearHighlightElement() {
    SendMessage("ClearHighlightElement"); // 清空高亮节点
  }

  /**
   * 设置模型构件显示影藏
   * @param {*}  elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   * @param {*} boolean 是否可见的布尔值
   */
  static SetElementVisible(elementId, boolean) {
    if (!elementId) return;
    if (!boolean) this.ClearHighlightElement();
    SendMessage(`${"SetElementVisible" + "_"}${elementId}_${boolean}`);
  }

  /**
   * 设置模型构件隔离
   * @param {*}  elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   */
  static LeaveElement(elementId) {
    if (!elementId) return;
    SendMessage(`${"LeaveElement" + "_"}${elementId}`);
  }

  /**
   * 重置构件,清除构件作色
   */
  static ResetAllElement() {
    SendMessage("ResetAllElement");
  }

  /**
   * 根据构件Id获取中心点坐标
   * @param {*} elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   */
  static GetCenterById(elementId) {
    SendMessage(`GetCenterById_${elementId}`);
  }
  /**
   * **************************************************************以上为构件操作**************************************************************
   */

  /**
   * **************************************************************以下为引擎其他操作**************************************************************
   */

  /**
   * 设置缩放模式
   * @param {*} mode 缩放模式，0：以屏幕中心，1：以鼠標位置为中心
   */
  static SetZoomMode(mode = 1) {
    SendMessage(`SetZoomMode_${mode}`);
    SendMessage("GetZoomMode"); // 获取缩放模式
  }

  /**
   * 开启测量模式
   * @param {*} measureType 测量模式，1：距离测量，2：角度测量，3：面积测量 4：开始多段线距离测量 5：开始多点封闭图形面积测量
   */
  static StartMeasure(measureType) {
    Reactive.updateMessage("measureStatus", true);
    SendMessage(`StartMeasure_${measureType}`);
  }

  /**
   * 关闭测量模式
   * @param {*}
   */
  static StopMeasure() {
    Reactive.updateMessage("measureStatus", false);
    SendMessage("StopMeasure");
  }

  /**
   * 开启剖切模式
   * @param {*} type 剖切类型：normal-一般模式，box-盒子剖切，plane-平面剖切
   */
  static StartClip(type) {
    this.CommonEngineConfig.ClipType = type;
    if (type == "box") {
      SendMessage("StartClipBox");
    } else if (type == "plane") {
      SendMessage("StartClipPlane");
    } else {
      this.CommonEngineConfig.ClipType = "normal";
      SendMessage("StartClip");
    }
  }

  /**
   * 重置剖切参数
   */
  static ResetClipFree() {
    if (this.CommonEngineConfig.ClipType != "normal") SendMessage("ResetClipFree");
  }

  /**
   * 设置剖切参数
   * @param {*} transformType 剖切类型
   * @param {*} axis 轴线
   * @param {*} value 剖切值
   */
  static TransformClip(transformType, axis, value) {
    if (this.CommonEngineConfig.ClipType == "stop") return;
    // TransformClip设置裁切位置具体如下
    // move表示移动到xyz的某个位置，类型分别为move-x,move-y,move-z,范围为-0.5到0.5之间 -0.5表示min 0.5表示max
    // rotate表示旋转0-360度,类型分别为rotate-x,rotate-y,rotate-z
    // scale表示缩放0-1之间 等于0会报错 大于1表示放大,类型分别为scale-x,scale-y,scale-z

    // SendMessage('TransformClip_move-x_0.2');
    // SendMessage('TransformClip_move-y_0.2');
    // SendMessage('TransformClip_move-z_0.2');

    // SendMessage('TransformClip_rotate-x_45');
    // SendMessage('TransformClip_rotate-y_45');
    // SendMessage('TransformClip_rotate-z_45');

    // SendMessage('TransformClip_scale-x_0.5');
    // SendMessage('TransformClip_scale-y_0.5');
    // SendMessage('TransformClip_scale-z_0.5');

    if (transformType == "move") {
      if (value < -0.5 || value > 0.5) {
        console.log("----剖切参数value错误，参数超过范围----");
        return;
      }
    } else if (transformType == "rotate") {
      if (value < 0 || value > 360) {
        console.log("----剖切参数value错误，参数超过范围----");
        return;
      }
    } else if (transformType == "scale") {
      if (value <= 0 || value > 10) {
        console.log("----剖切参数value错误，参数超过范围----");
        return;
      }
    } else {
      return;
    }

    if (["x", "y", "z"].includes(axis)) SendMessage(`TransformClip_${transformType}-${axis}_${value}`);
    else console.log("----剖切参数错误，请按照接口要求提供参数----");
  }

  /**
   * 关闭剖切模式
   */
  static StopClip() {
    this.CommonEngineConfig.ClipType = "stop";
    SendMessage("StopClipFree");
    SendMessage("StopClip");
  }

  /**
   * 执行剖切
   * 执行对应axis轴线上的剖切
   * @param {*} axis 轴线类型：x，y，z
   * @param {*} direction 剖切方向，min:正向，max:反向
   * @param {*} value 剖切值 0.0~1.0
   */
  static PlateClip(axis, direction, value) {
    if (this.CommonEngineConfig.ClipType == "stop") return;
    if (value > 1 || value < 0) {
      console.log("----剖切参数value错误，参数超过范围----");
      return;
    }
    if (["x", "y", "z"].includes(axis) && ["min", "max"].includes(direction)) {
      SendMessage(`PlateClip_${axis}-${direction}_${value}`);
    } else console.log("----剖切参数错误，请按照接口要求提供参数----");
  }

  /**
   * 鼠标缩放速度设置的接口
   * @param {*} speed 缩放速度
   */
  static SetZoomSpeed(speed = 1.0) {
    SendMessage(`SetZoomSpeed_${speed}`);
  }

  /**
   * 添加标注物 参数分别为MarkerId，位置数组，[x,y,z]的字符串（逗号隔开），三行文字的内容，如果没有内容用空格代替
   * @param {*} MarkerId 标注物Id
   * @param {*} MarkerPosition 标注物位置
   * @param {*} content 第一行文字
   * @param {*} imgType 1,2,3 三种图片样式
   * @param {*} imgColor blue,green,orange,red
   * @param {*} textColors [r,g,b]文字颜色
   */
  static AddMarker(MarkerId, MarkerPosition, content = " ", imgType = 3, imgColor, textColors = [255, 255, 255]) {
    if (imgType != 1 && imgType != 2 && imgType != 3) imgType = 3;
    var colorOffset = imgColor == "blue" ? 1 : imgColor == "green" ? 2 : imgColor == "orange" ? 3 : 4;
    var type = (imgType - 1) * 4 + colorOffset;

    if (this.RenderData.MarkerIds.includes(MarkerId)) return;
    SendMessage(`AddMarker_${MarkerId}_${type}_${MarkerPosition.join(",")}_${content}_${textColors.join(",")}`);
    this.#Temp.OnGetCenterById = null;
    this.#Temp.OnGetCenterByIdParam = null;
    this.RenderData.MarkerIds.push(MarkerId);
  }

  /**
   * 添加标注物 参数分别为MarkerId，位置数组，[x,y,z]的字符串（逗号隔开），三行文字的内容，如果没有内容用空格代替
   * @param {*} MarkerId 标注物Id
   * @param {*} MarkerPostion 标注物位置
   * @param {*} title 标题
   * @param {*} content 多行文本的数组
   * @param {*} textColors [r,g,b]文字颜色
   */
  static AddMultipleLineMarker(MarkerId, MarkerPostion, title = " ", content = [" "], textColors = [255, 255, 255]) {
    if (this.RenderData.MarkerIds.includes(MarkerId)) return;
    SendMessage(
      `AddMarker_${MarkerId
      }_${13
      }_${MarkerPostion.join(",")
      }_${title
      }*${content.join("*")
      }_${textColors.join(",")}`
    );
    // SendMessage('AddMarker_marker1_13_100.538704,94.085220,-33.299709_标题1*测试内容1*测试内容2*测试内容3*测试内容4*测试内容5_255,255,255');
    this.#Temp.OnGetCenterById = null;
    this.#Temp.OnGetCenterByIdParam = null;
    this.RenderData.MarkerIds.push(MarkerId);
  }

  /**
   * 添加标注物 参数分别为MarkerId，位置数组，[x,y,z]的字符串（逗号隔开），三行文字的内容，如果没有内容用空格代替
   * @param {*} MarkerId 标注物Id
   * @param {*} elementId 构件Id  可以传多个  用#隔开
   * @param {*} title 标题
   * @param {*} content 多行文本的数组
   * @param {*} textColors [r,g,b]文字颜色
   */
  static AddMultipleLineMarkerCenter(MarkerId, elementId, title = " ", content = [" "], textColors = [255, 255, 255]) {
    if (this.RenderData.MarkerIds.includes(MarkerId)) return;
    // SendMessage('AddMarker_marker1_13_100.538704,94.085220,-33.299709_标题1*测试内容1*测试内容2*测试内容3*测试内容4*测试内容5_255,255,255');
    SendMessage(`GetCenterByMutipleId_${elementId}`);
    this.#Temp.OnGetCenterByMutipleId = this.AddMultipleLineMarkerByElementId;
    if (!this.#Temp.OnGetCenterByIdParam) {
      this.#Temp.OnGetCenterByIdParam = {};
    }

    this.#Temp.OnGetCenterByIdParam[elementId] = { MarkerId, content, title, textColors };
  }

  /**
   * 添加标注物 参数分别为MarkerId，对于文字的内容，如果没有内容用空格代替
   * @param {*} MarkerId 标注物Id
   * @param {*} elementId 构件Id
   * @param {*} content 第一行文字
   * @param {*} imgType 1,2,3 三种图片样式
   * @param {*} imgColor blue,green,orange,red
   * @param {*} textColors [r,g,b]文字颜色
   */
  static AddMarkerByElementId(
    MarkerId,
    elementId,
    content = " ",
    imgType = 3,
    imgColor = "red",
    textColors = [255, 255, 255]
  ) {
    if (imgType != 1 && imgType != 2 && imgType != 3) imgType = 3;
    var colorOffset = imgColor == "blue" ? 1 : imgColor == "green" ? 2 : imgColor == "orange" ? 3 : 4;
    var type = (imgType - 1) * 4 + colorOffset;

    this.GetCenterById(elementId);
    this.#Temp.OnGetCenterById = this.OnAddMarkerByElementId;
    if (!this.#Temp.OnGetCenterByIdParam) {
      this.#Temp.OnGetCenterByIdParam = {};
    }

    this.#Temp.OnGetCenterByIdParam[elementId] = { MarkerId, content, type, textColors };
  }

  static AddPointMarkerById(MarkerPostion, Param) {
    SendMessage(`AddPointMarker_${Param.MarkerId}_1_${MarkerPostion.join(",")}_${Param.MarkerColor.join(",")}`);
    Medusa.RenderData.MarkerIds.push(Param.MarkerId);
  }

  static AddMultipleLineMarkerByElementId(MarkerPostion, Param) {
    if (Param) {
      if (Medusa.RenderData.MarkerIds.includes(Param.MarkerId)) return;
      SendMessage(
        `AddMarker_${
          Param.MarkerId
        }_${
          13
        }_${
          MarkerPostion.join(",")
        }_${
          Param.title
        }*${
          Param.content.join("*")
        }_${
          Param.textColors.join(",")}`
      );
      Medusa.RenderData.MarkerIds.push(Param.MarkerId);
    }
  }

  static OnAddMarkerByElementId(MarkerPostion, Param) {
    if (Param) {
      if (Medusa.RenderData.MarkerIds.includes(Param.MarkerId)) return;
      SendMessage(
        `AddMarker_${Param.MarkerId}_${Param.type}_${MarkerPostion.join(",")}_${Param.content}_${Param.textColors.join(
          ","
        )}`
      );
      Medusa.RenderData.MarkerIds.push(Param.MarkerId);
    }
  }

  /**
   * 更新标注内容 通过MarkerId值更新标签的文字
   * @param {*} content 多行文本数组
   */
  static UpdateMarkerContent(MarkerId, title = " ", content = [" "]) {
    SendMessage(`UpdateMarkerContent_${MarkerId}_${title}*${content.join("*")}`);
  }

  /**
   * 通过MarkerId值删除标签
   * @param {*} MarkerId 标注物Id
   */
  static RemoveMarker(MarkerId) {
    if (this.RenderData.MarkerIds.includes(MarkerId)) {
      this.RenderData.MarkerIds = this.RenderData.MarkerIds.filter((x) => x != MarkerId);
      SendMessage(`RemoveMarker_${MarkerId}`);
    }
  }

  /**
   * 清除所有标注物
   */
  static ClearMarker() {
    this.RenderData.MarkerIds = [];
    SendMessage("ClearMarker");
  }

  /**
   * 添加圆点标注物 参数分别为MarkerId，位置数组，[x,y,z]的字符串（逗号隔开），三行文字的内容，如果没有内容用空格代替
   * @param {*} MarkerId 标注物Id
   * @param {*} elementId 标注物Id
   * @param {*} MarkerColor [r,g,b]标记颜色
   */
  static AddPointMarker(MarkerId, elementId, MarkerColor = [255, 0, 0]) {
    console.log("output->elementId", elementId);
    if (this.RenderData.MarkerIds.includes(MarkerId)) return;
    SendMessage(`GetCenterByMutipleId_${elementId}`);
    this.#Temp.OnGetCenterByMutipleId = this.AddPointMarkerById;
    if (!this.#Temp.OnGetCenterByIdParam) {
      this.#Temp.OnGetCenterByIdParam = {};
    }

    this.#Temp.OnGetCenterByIdParam[elementId] = { MarkerId, MarkerColor };
  }

  /**
   *通过MarkerId值删除标签
   * @param {*} MarkerId 标注物Id
   */
  static RemovePointMarker(MarkerId) {
    SendMessage(`RemovePointMarker_${MarkerId}`);
  }

  /**
   * 清空场景中所有的圆点标签
   */
  static ClearPointMarker() {
    SendMessage("ClearPointMarker");
  }

  /**
   * 重置视点为模型初始的加载视点
   */
  static ResetViewPort() {
    SendMessage("ResetViewPort");
  }


  /**
   * 视角模式设定
   * @param {*} mode 1 常规视角 2 第三人视角 3 第一人称视角 4 上帝视角
   */
  static SetCameraMode(mode) {
    if ([1, 2, 3, 4].includes(mode)) {
      if (this.CommonEngineConfig.CameraMode != 1) {
        this.GetCameraView((res) => {
          SendMessage(`SetCameraMode_${mode}`);
          this.SetCameraView(res);
        });
      } else {
        SendMessage(`SetCameraMode_${mode}`);
      }
    } else {
      console.log("----无效的参数，模式设定失败----");
    }
  }

  static GetPoint(pointString) {
    const point = pointString.split(",");
    return { x: Number.parseFloat(point[0]), y: Number.parseFloat(point[1]), z: Number.parseFloat(point[2]) };
  }

  static getPathLength(path) {
    let length = 0;
    const points = path.split("#");
    for (let i = 0; i < points.length - 1; i++) {
      const cur = this.GetPoint(points[i]);
      const nxt = this.GetPoint(points[i + 1]);
      const distance = Math.sqrt(Math.pow(cur.x - nxt.x, 2) + Math.pow(cur.y - nxt.y, 2) + Math.pow(cur.z - nxt.z, 2));
      if (distance <= 0 || Number.isNaN(distance)) continue;
      length += distance;
    }
    return length;
  }

  /**
   * 设置引擎的相机视角
   * @param {*} view 设置引擎相机视角
   */
  static SetCameraView(view) {
    SendMessage(`SetCameraView_${view}`);
  }

  /**
   * 获取相机的视角
   * @param {*} func 临时视角响应回调函数，不传入则通过注册的回调函数相应给页面
   * @returuns 通过注册回去相机视角回调事件：GetCameraView来接收响应的视角结果
   */
  static GetCameraView(func) {
    SendMessage("GetCameraView");
    if (func) {
      this.#Temp.TempViewFunction = func;
    } else {
      this.#Temp.TempViewFunction = null;
    }
  }

  static GetPathAnimationState() {
    // 获取人物是否处于漫游当中
    SendMessage("GetPathAnimationState");
  }

  static StartSetRoamPath() {
    SendMessage("StartSetRoamPath"); // 开启漫游路径设置
    this.GetSetRoamPathStatus();
  }

  static GetRoamPath(time = 300) { // 获取行走路径  参数行走的时间
    SendMessage(`GetSetRoamPath_${time}`);
  }

  static GetSetRoamPath(time = "100", speed = "0.5") { // 获取行走路径  参数行走的时间
    Reactive.updateMessage("RoamPathParamSpeed", speed);
    Reactive.updateMessage("RoamPathParams", time);
    if (time != 100) {
      SendMessage(`GetSetRoamPath_${Math.ceil(Math.ceil(time) * 1000 / 60)}`);
      return;
    }
    SendMessage(`GetSetRoamPath_${time}`);
  }

  static EndSetRoamPath() {
    SendMessage("EndSetRoamPath"); // 关闭漫游路径设置
    this.GetSetRoamPathStatus();
  }

  static GetSetRoamPathStatus() {
    SendMessage("GetSetRoamPathStatus"); // 获取当前是否正在设置行走路径状态
  }

  static SetGravityEnable(flag) {
    // 重力
    SendMessage(`SetGravityEnable_${flag}`);
    this.GetGravityEnable();
  }

  static MoveForward() {
    SendMessage("KeyDown_w");
    SendMessage("KeyUp_w");
  }
  static MoveUp() {
    SendMessage("KeyDown_q");
    SendMessage("KeyUp_q");
  }
  static GetGravityEnable() {
    // 获取当前重力模式是否开启
    SendMessage("GetGravityEnable");
  }

  /**
   * 相机视点漫游动画，
   * @param {*} views 视点数组，按顺序播放
   * @param {*} time 漫游动画的时间，单位为毫秒
   */
  static StartViewAnimation(views, time) {
    if (this.CommonEngineConfig.CameraMode == 1) SendMessage(`StartViewAnimation_${time}_${views.join("_")}`);
    else {
      console.log("----当前为人物漫游状态，无法设置常规模式下的相机漫游----");
    }
  }

  /**
   * 暂停播放视点漫游动画
   */
  static PauseViewAnimation() {
    if (this.CommonEngineConfig.CameraMode == 1) SendMessage("PauseViewAnimation");
    else {
      console.log("----当前为人物漫游状态，无法设置常规模式下的相机漫游----");
    }
  }

  /**
   * 继续播放视点漫游动画
   */
  static ResumeViewAnimation() {
    if (this.CommonEngineConfig.CameraMode == 1) SendMessage("ResumeViewAnimation");
    else {
      console.log("----当前为人物漫游状态，无法设置常规模式下的相机漫游----");
    }
  }

  /**
   * 停止播放视点漫游动画
   */
  static StopViewAnimation() {
    if (this.CommonEngineConfig.CameraMode == 1) SendMessage("StopViewAnimation");
    else {
      console.log("----当前为人物漫游状态，无法设置常规模式下的相机漫游----");
    }
  }

  /**
   * 设置小人大小，参数为浮点型，等比例放大或者缩小
   */
  static SetRoamPersonScale(percent = 1.0) {
    SendMessage(`SetPersonScale_${percent}`);
  }

  /**
   * 设置小人行走碰撞检测
   * @param {*} flag open or close
   */
  static SetCollisionEnable(flag) {
    SendMessage(`SetCollisionEnable_${flag == "open"}`);
  }

  /**
   * 开始记录人物视点漫游路径
   */
  static StartRecordPath() {
    if (this.CommonEngineConfig.CameraMode == 2) SendMessage("StartRecordPath");
    else {
      console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线录制----");
    }
  }

  /**
   * 结束记录人物视点漫游路径
   * @returns 通过回调（OnPersonRoamPath）将漫游路径响应给页面
   */
  static StopRecordPath() {
    if (this.CommonEngineConfig.CameraMode == 2) SendMessage("StopRecordPath");
    else {
      console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线录制----");
    }
  }

  /**
   * 获取多组构件的中心点
   * @param {*} devElements 设备构件数组，例：[{tag:"XXX-XXX",elementId:"m1*123"}]
   */
  static GetCenterByMutipleId(devElements) {
    if (!devElements) devElements = this.RenderData.ElementPositions;
    let param = devElements.map((x) => x.elementId);
    // SendMessage('GetCenterByMutipleId_' + 'tag0*994#tag0*1002' + '_' + 'tag0*41#tag0*42')
    SendMessage(`GetCenterByMutipleId_${param.join("_")}`);
  }

  /**
   * 开启定时获取人物和构件距离计算
   * @param {*} calculate 触发回调距离,默认为20
   * @param {*} dis 触发回调距离,默认为20
   * @param {*} interval 计算间隔时间，默认为5000，即5秒，如果小于2000，则为2秒
   */
  static SetRoamCalculate(calculate = false, dis = 20, interval = 5000) {
    this.#EngineConfiguration.RoamCalculateDistance = dis;
    this.#EngineConfiguration.RoamCalculate = calculate;
    this.#EngineConfiguration.RaamCalculateInterval = interval < 2000 ? 2000 : interval;
    this.#TraggerRoamCalculate();
  }

  static #TraggerRoamCalculate() {
    if (Medusa.#EngineConfiguration.RoamCalculate) {
      Medusa.GetCameraView((view) => {
        // view格式：1265.000000,-1075.000000,-1.500000,0.000000
        let pos = view.split(",");
        Medusa.ClearMarker();
        if (Medusa.RenderData.ElementPositions.length > 0) {
          let elements = [];
          let minDistance = Infinity; // 用于记录最小距离
          let closestElement = null; // 用于记录最小距离的元素
          Medusa.RenderData.ElementPositions.forEach((m) => {
            if (m.position) {
              var x = m.position[0] - pos[0];
              var y = m.position[1] - -pos[1];
              var z = m.position[2] - pos[2];
              let dis = Math.sqrt(x * x + y * y + z * z);
              console.log(dis);
              // 判断当前距离是否在配置的范围内
              if (dis <= Medusa.#EngineConfiguration.RoamCalculateDistance) {
                elements.push({ tag: m.tag, position: m.position, elementId: m.elementId });
                // 查找最小距离的元素
                if (dis < minDistance) {
                  minDistance = dis;
                  closestElement = { tag: m.tag, position: m.position, elementId: m.elementId }; // 记录最接近的元素
                }
              }
            }
          });
          // 如果存在最近的元素，先将其从 elements 中删除，再加到第一个位置
          if (closestElement) {
            // 先从 elements 中删除 closestElement
            elements = elements.filter((element) => element.elementId !== closestElement.elementId);
            // 将 closestElement 放到 elements 的第一个位置
            elements.unshift(closestElement);
          }
          if (!Medusa.#EngineConfiguration.lastView || Medusa.#EngineConfiguration.lastView != view) {
            Medusa.#EngineConfiguration.lastView = view;
            if (Medusa.#ResponseEvents.OnCloseToElement) Medusa.#ResponseEvents.OnCloseToElement(elements);
          }
        }
        clearTimeout(Medusa.#EngineConfiguration.timeHandleNum);
        Medusa.#EngineConfiguration.timeHandleNum = setTimeout(
          Medusa.#TraggerRoamCalculate,
          Medusa.#EngineConfiguration.RaamCalculateInterval
        );
      });
    }
  }

  /**
   * 回调接口
   * 构件中心点
   * @param {*} positions ["tag0*994#tag0*1002,616.770020,798.200012,-11.500000"]
   */
  static UpdateElementPosition(positions = []) {
    Medusa.RenderData.ElementPositions.forEach((e) => {
      let element = positions.find((x) => x.startsWith(e.elementId));
      if (element) {
        let pos = element.split(",");
        if (pos.length == 4) {
          pos.shift(1);
          e.position = pos;
        }
      }
    });

    if (Medusa.#ResponseEvents.OnMultiplePosition) {
      Medusa.#ResponseEvents.OnMultiplePosition([...Medusa.RenderData.ElementPositions]);
    }
  }

  /**
   * 设备构件
   * @param {*} devElements 设备构件数组，数据格式为json数组，例：[{tag:"",elementId:""},{tag:"",elementId:""}]
   */
  static SetRoamElements(devElements) {
    if (devElements == null || !Array.isArray(devElements)) {
      console.warn("设置设备构件参数错误");
      return;
    }
    this.RenderData.ElementPositions = devElements;
  }

  /**
   * 添加记录人物视点漫游路径地标箭头
   */
  // static AddArrowPath(pathView) {
  //     SendMessage('AddArrowPath_' + pathView);
  // }

  /**
   * 播放人物视点漫游路径
   * @param {*} pathView 人物漫游路径
   */
  static PlayPathAnimation(pathView) {
    if (pathView) {
      if (this.CommonEngineConfig.CameraMode == 2 || this.CommonEngineConfig.CameraMode == 3 || this.CommonEngineConfig.CameraMode == 4) {
        SendMessage(`PlayPathAnimation_${pathView}`);
      } else {
        console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线操作----");
      }
      // this.AddArrowPath(pathView)
    }
  }

  /**
   * 暂停播放人物视点漫游路径
   */
  static PausePathAnimation() {
    if (this.CommonEngineConfig.CameraMode == 2 || this.CommonEngineConfig.CameraMode == 3 || this.CommonEngineConfig.CameraMode == 4) {
      SendMessage("PausePathAnimation");
    } else {
      console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线操作----");
    }
  }

  /**
   * 继续播放人物漫游视点路径
   */
  static ResumePathAnimation() {
    if (this.CommonEngineConfig.CameraMode == 2 || this.CommonEngineConfig.CameraMode == 3 || this.CommonEngineConfig.CameraMode == 4) {
      SendMessage("ResumePathAnimation");
    } else {
      console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线操作----");
    }
  }

  /**
   * 停止播放视点漫游动画
   */
  static StopPathAnimation() {
    if (this.CommonEngineConfig.CameraMode == 2 || this.CommonEngineConfig.CameraMode == 3 || this.CommonEngineConfig.CameraMode == 4) {
      SendMessage("StopPathAnimation");
    } else {
      console.log("----当前为常规漫游状态，无法进行人物漫游模式下的漫游路线操作----");
    }
  }

  /**
   * 设置水面显示
   * @param {*} visible 布尔值，标识水面是否可见
   */
  // SetWaterVisible(visible) {

  // }

  /**
   * 获取项目的世界位置
   */
  static GetCameraPos() {
    SendMessage("GetCameraPos");
  }

  /**
   * 设置测量吸附距离
   * @param {*} visible 布尔值，标识水面是否可见
   */
  static SetAttachDistance(attachDistance = 0.1) {
    SendMessage(`SetAttachDistance_${attachDistance}`);
  }

  /**
   * 视点画面截图
   * @returns 视点画面的图片字符串(base64位编码)
   */
  static GetCameraImg() {
    var player = document.getElementById("cloud_render_player"); // 获取video的Dom节点
    // player.setAttribute("crossOrigin", "anonymous");  //添加srossOrigin属性，解决跨域问题
    var canvas = document.createElement("canvas");

    canvas.width = 247.5;
    canvas.height = 165;
    // canvas = canvas.getContext("2d")
    canvas.getContext("2d").drawImage(player, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
  }

  /**
   * 设置渲染顔色
   */
  static SetRenderColor(colors = [0.8, 0.8, 0.8]) {
    SendMessage(`SetRenderColor_${colors.join(",")}`);
    // SendMessage('SetRenderColor_0.3,0.3,0.3');
  }

  /**
   * **************************************************************以上为引擎常规接口操作**************************************************************
   * **************************************************************以上为引擎常规接口操作**************************************************************
   * **************************************************************以上为引擎常规接口操作**************************************************************
   * **************************************************************以上为引擎常规接口操作**************************************************************
   */

  /**
   * **************************************************************以下为孪生应用接口操作**************************************************************
   * **************************************************************以下为孪生应用接口操作**************************************************************
   * **************************************************************以下为孪生应用接口操作**************************************************************
   * **************************************************************以下为孪生应用接口操作**************************************************************
   */

  /**
   * **************************************************************以下为锚链操作**************************************************************
   */
  /**
   *加载六自由度模拟
   */
  static LoadFpsoData() {
    SendMessage("LoadFpsoData_fpso");
  }

  /**
   * //设置浮体平台的6自由度数据
   * 参数分别为位置的xyz，例如 ：{x:-0.117,y:0.265,z:-22.819}
   * 旋转的xyz,例如 ：{x:0.6714,y:-0.023,z:0.0}
   *
   */
  static SetFpsoData(location, rotation) {
    SendMessage(`SetFpsoData_${location.x}_${location.y}_${location.z}_${rotation.x}_${rotation.y}_${rotation.z}`);
  }

  /**
   * 删除六自由度模拟
   */
  static ClearFpsoData() {
    SendMessage("ClearFpsoData");
  }

  /**
   * 单线图展示
   * params 不传 或者传true  展示单线图
   * 传false关闭单线图
   *
   */
  static SetAllLineSegmentVisible(params = true) {
    if (params) {
      SendMessage("SetModelVisible_daoguanjia_false");	// 隐藏常规模型
      SendMessage("SetAllLineSegmentVisible_true");	// 显示单线图
      return;
    }
    SendMessage("SetModelVisible_daoguanjia_true");	// 显示常规模型
    SendMessage("SetAllLineSegmentVisible_false");	// 隐藏单线图
  }

  /**
   * 设置单线图单个节点颜色
   */
  static SetLineSegmentColor(tag, r, g, b) {
    SendMessage(`SetLineSegmentColor_${tag}_${r}_${g}_${b}`);
  }

  /**
   * 批量设置单线图多个节点颜色
   * params为多个节点信息组成 节点的id值 + RGB颜色
   * 数据结构如下：
   *  [{ id: 'L1HA-LH11', color: { r:255, g:0, b:0 } },
    { id: 'L1HA-H100', color: { r:0, g:255, b:0 } },
    { id: 'L1HA-XI11', color: { r:0, g:0, b:255 } }
    ];
   */
  static BatchSetLineSegmentColor(params) {
    const output = params.map((item) => {
      const { id, color } = item;
      return `${id},${color.r},${color.g},${color.b}`;
    }).join("_");
    SendMessage(`SetLineSegmentColor_${output}`);
  }

  // 批量或重置单个特定线条状态
  /**
   *
   * @param {*} params 节点的id值
   * 单个直接传 如：L1HA-H100
   * 多个用下划线隔开
   * 如：L1HA-H100_L1HA-H100_L1HA-H100
   *
   */
  static ResetLineByTag(params) {
    SendMessage(`ResetLineByTag_${params}`);
  }

  /**
   * 重置单线图状态
   */
  static ResetAllLine() {
    SendMessage("ResetAllLine");
  }

  /**
    * 设置倾角系数变化
    * x横向方向
    * y竖向方向
    * 参数为x,y数值范围[0-1]之间
    *  */
  static SetModelOffset(x, y) {
    if (x > 1 || x < 0 || y > 1 || y < 0) {
      console.log("===========参数错误===============,参数为x,y数值范围[0-1]之间");
      return;
    }
    SendMessage(`SetModelOffset_${x}_${y}`);	// 设置倾角变化，分别对应xy方向，0_0为无变化，一般给0.1就可以看出变化，越大幅度越大
    // SendMessage('SetModelOffset_0_0');
  }

  /**
   * 阀门旋转函数
   * @param {*} tag //构件号
   * @param {*} time //动画时间
   * @param {*} startPosition //阀门旋转开始位置
   * @param {*} endPosition //阀门旋转结束位置
   */
  static StartModelRotAnimation(tag, time = 3000, startPosition = 0, endPosition = 0) {
    SendMessage(`StartModelRotAnimation_${time}_${tag}_${startPosition},${endPosition},-90_0,90,-90`);	// 参数分别为动画时间，tag值（这个demo里就写f1），起始旋转值，结束旋转值，这里的旋转主要控制第二个值
  }

  /**
 * 设置导管架左侧液位
 * @param {*} value /左侧液位设置，0为空，1为满 取值范围[0-1]之间
 */
  static SetLiquidValueLeft(value) {
    SendMessage(`SetLiquidValue1_${value}`);	// 左侧液位设置，0为空，1为满
  }
  /**
 * 设置导管架右侧液位
 * @param {*} value /右侧侧液位设置，0为空，1为满 取值范围[0-1]之间
 */

  static SetLiquidValueRight(value) {
    SendMessage(`SetLiquidValue2_${value}`);// 右侧液位设置，0为空，1为满
  }

  /**
   * 添加锚链节点-当前为添加单节锚链的效果，目前还在调试中，会进一步更新sdk
   */
  static AddChain() {
    // 多条线段用_隔开，每条线参数分别为线的tag值,x,y,z
    var testStr = "chain1,0,0,-2.0_chain2,0.25,0.0,-2.0_chain3,0.5,0.0,-2.0";
    SendMessage(`AddChainNode_${testStr}`); // 添加锚链

    // SendMessage('SetChainPosition_chain2_0.25,0.0,-2.1');//设置锚链的位置
    SendMessage("SetChainRotation_chain2_90.0,0.0,0.0"); // 设置锚链的旋转,单位是角度值
    // SendMessage('SetChainScale_chain2_2.0,2.0,2.0');//设置锚链的大小
    SendMessage("SetChainColor_chain2_1.0,1.0,0.0"); // 设置锚链的颜色
  }

  /** *
   * AddChainNode_
   * 添加锚链节点
   * 多条线段用_隔开，每条线参数分别为线的tag值,x,y,z
   */
  static AddChainNode(params) {
    SendMessage(`AddChainNode_${params}`); // 添加锚链
  }

  /**
   * 更新锚链
   */
  static UpdateChainNode(params) {
    SendMessage(`UpdateChainNode_${params}`);// 更新锚链
  }

  /**
   * 设置锚链的位置
   */
  static SetChainPosition(params) {
    SendMessage(`SetChainPosition_${params}`);// 设置锚链的位置
  }

  /**
   * 设置锚链的旋转,单位是角度值
   */
  static SetChainRotation(params) {
    SendMessage(`SetChainRotation_${params}`);// 设置锚链的位置
  }

  /**
   * 设置锚链的大小
   */
  static SetChainScale(params) {
    SendMessage(`SetChainScale_${params}`);
  }

  /**
   * 设置锚链的颜色
   */
  static SetChainColor(params) {
    SendMessage(`SetChainColor_${params}`); // 设置锚链的颜色
  }

  /**
   * 根据线的chainId值删除具体锚链-目前还在调试中，会进一步更新sdk
   * @param {*} chainId 添加时自定义的锚链Id
   */
  static RemoveChain(chainId) {
    SendMessage(`RemoveChainNode_${chainId}`);
  }

  /**
   * 清空所有锚链节点-目前还在调试中，会进一步更新sdk
   */
  static ClearChain() {
    SendMessage("ClearChainNode");
  }
  /**
   * **************************************************************以上为锚链操作**************************************************************
   */

  /**
   * **************************************************************以下为海面操作**************************************************************
   */
  /**
   * 添加海面节点，目前限制为一个海面
   * @param {number[]} [centerPos=[0, 0, 0]] 海面中心点位置空间坐标，默认为[0,0,0]
   */
  static AddOcean(centerPos = [0, 0, 0]) {
    if (this.RenderData.OceanIds.length > 0) {
      return;
    }
    let oceanId = "ocean1";
    this.RenderData.OceanIds.push(oceanId);
    SendMessage(`AddOceanNode_${oceanId}_${centerPos.join(",")}`);
    SendMessage("SetRenderMode_1");
    SendMessage("GetOceanNodeNum"); // 获取海面数量
  }

  /**
   * 移除海面
   */
  static ClearOcean() {
    this.RenderData.OceanIds = [];
    SendMessage("ClearOceanNode");
    SendMessage("SetRenderMode_0");
    SendMessage("GetOceanNodeNum"); // 获取海面数量
  }

  /**
   * **************************************************************以上为海面操作**************************************************************
   */
  /**
   * **************************************************************以下为中心点操作**************************************************************
   */
  /**
   * 添加坐标中心节点
   * @param {*} centerId 中心点Id
   * @param {*} posArr 中心点坐标
   */
  static AddCenter(centerId, posArr) {
    SendMessage(`AddCoordinateNode_${centerId}_${posArr.join(",")}`);
  }

  /**
   * 删除坐标中心节点
   * @param {*} centerId 中心点Id
   */
  static RemoveCenter(centerId) {
    SendMessage(`RemoveCoordinateNode_${centerId}`);
  }

  /**
   * 清空坐标中心节点
   */
  static ClearCenter() {
    SendMessage("ClearCoordinateNode");
  }

  /**
   * **************************************************************以上为中心点操作**************************************************************
   */

  /**
   * **************************************************************以下为线段操作**************************************************************
   */
  /**
   * 添加单线段
   * @param {*} lineId 线段Id,自定义
   * @param {*} pos1 线段起点[x,y,z]
   * @param {*} pos2 线段终点[x,y,z]
   * @param {*} color 颜色数组 [r,g,b]
   */
  static AddLineSegment(lineId, pos1, pos2, color) {
    // 多条线段用_隔开，每条线参数分别为线的tag值,x1,y1,z1,x2,y2,z2,red,green,blue
    var data = [];
    data.push(lineId);
    data = data.concat(pos1, pos2, color);
    SendMessage(`AddLineSegment_${data.join(",")}`);
  }

  /**
   * 添加多条线段
   * @param {*} lineData [{ lineId: "Lline1", pos1: [x, y, z], pos2: [x, y, z], color: [r, g, b] }]
   */
  static AddMultipleLineSegment(lineData) {
    // 多条线段用_隔开，每条线参数分别为线的tag值,x1,y1,z1,x2,y2,z2,red,green,blue
    // var testStr = "line1,0,0,0,0,0,-1.0,255,0,0_line2,0,0,-1.0,0,-1.0,-1.0,255,255,0_line3,0,-1.0,-1.0,0,-2.0,-0.0,0,255,0";
    let lines = [];
    lineData.forEach((x) => {
      let data = [];
      data.push(x.lineId);
      data = data.concat(x.pos1, x.pos2, x.color);
      lines.push(data.join(","));
    });
    SendMessage(`AddLineSegment_${lines.join("_")}`);
  }

  /**
   * 删除线段
   * @param {*} lineId 线段Id
   */
  static RemoveLineSegment(lineId) {
    // 根据线的tag值删除具体某条线段
    SendMessage(`RemoveLineSegment_${lineId}`);
  }

  /**
   * 清空线段
   */
  static ClearLineSegment() {
    SendMessage("ClearLineSegment");
  }

  /**
   * **************************************************************以上为线段操作**************************************************************
   */
  /**
   * **************************************************************以下为液位操作**************************************************************
   * **************************************************************液位接口后面有变动**************************************************************
   */
  /**
   * 添加液位节点
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} elementId 构件Id,多个构件Id使用#拼接,使用tag1*id1表示id1属于模型tag1,例如：tag1*eid1#tag2*eid,表示选中tag1模型的eid1和tag2模型的eid2
   * @param {*} startColor 开始位置渐变颜色，范围是0-0.1，例如红色为1.0,0.0,0.0,蓝色为0.0，0.0，1.0，设置startColor和endColor一样则没有渐变
   * @param {*} endColor 结束位置渐变颜色，范围是0-0.1，例如红色为1.0,0.0,0.0,蓝色为0.0，0.0，1.0
   */
  static AddLiquidNode(nodeId, elementId, startColor, endColor) {
    SendMessage(`AddLiquidNode_${nodeId}_${elementId}_${startColor}_${endColor}`);
  }

  /**
   * 设置液位高度
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} value 高度比例，0.0是空的，1.0是满的
   */
  static UpdateLiquidValue(nodeId, value) {
    SendMessage(`UpdateLiquidValue_${nodeId}_${value}`);
  }

  /**
   * 液位高度变化动画，参数分别为液位节点的tag值，动画时间，起始高度比例，结束高度比例
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} time 动画播放时间
   * @param {*} startValue 结束高度比例，0.0是空的，1.0是满的
   * @param {*} endValue 结束高度比例，0.0是空的，1.0是满的
   */
  static StartLiquidValueAnimation(nodeId, time, startValue, endValue) {
    SendMessage(`StartLiquidValueAnimation_${nodeId}_${time}_${startValue}_${endValue}`);
  }

  /**
   * 液位颜色渐变动画，参数分别为液位节点的id值，动画时间，起始渐变颜色1，结束渐变颜色1，起始渐变颜色2，结束渐变颜色2
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} time 动画播放时间
   * @param {*} startColor1 起始渐变颜色1
   * @param {*} startColor2 起始渐变颜色2
   * @param {*} endColor1 结束渐变颜色1
   * @param {*} endColor2 结束渐变颜色2
   */
  static StartLiquidColorAnimation(nodeId, time, startColor1, startColor2, endColor1, endColor2) {
    SendMessage(`StartLiquidColorAnimation_${nodeId}_${time}_${startColor1}_${startColor2}_${endColor1}_${endColor2}`);
  }

  /**
   * 删除指定液位节点
   * @param {*} nodeId 节点的id值
   */
  static RemoveLiquidNode(nodeId) {
    SendMessage(`RemoveLiquidNode${nodeId}`);
  }

  /**
   * 清除液位节点
   */
  static ClearLiquidNode() {
    SendMessage("ClearLiquidNode");
  }

  /**
   * **************************************************************以上为液位操作**************************************************************
   */

  /**
   * **************************************************************以下为箭头操作**************************************************************
   */
  /**
   * 添加箭头节点的命令
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} color 箭头颜色，例：红色1.0,0.0,0.0;
   * @param {*} position 箭头位置，例：位置字符串0,0,0；
   * @param {*} rotation 箭头旋转值，例：旋转字符串0,0,0;
   * @param {*} scale 箭头大小，例：大小字符串0.06,0.06,0.06;
   */
  static AddArrowNode(nodeId, color, position, rotation, scale = "0.06,0.06,0.06") {
    SendMessage(`AddArrowNode_${nodeId}_${color}_${position}_${rotation}_${scale}`);
  }

  /**
   * //开始箭头的位移动画，第一个参数为节点的tag值，第二个参数为动画的播放时间，第三个参数为位置1，2的字符串，例如0,0,0
   * @param {*} nodeId 自定义节点的唯一标识
   * @param {*} time 动画时间
   * @param {*} startPostion 开始位置
   * @param {*} endPosition 结束位置
   */
  static StartArrowPositionAnimation(nodeId, time, startPosition, endPosition) {
    SendMessage(`StartArrowPositionAnimation_${nodeId}_${time}_${startPosition}_${endPosition}`);
  }

  /**
   * 开始箭头的旋转动画，第一个参数为节点的id值，第二个参数为动画的播放时间，第三个参数为旋转1，2的字符串，例如0
   * @param {*} nodeId 节点的id值
   * @param {*} time 动画的播放时间
   * @param {*} startRotation 开始旋转值
   * @param {*} endRotation 结束旋转值
   */
  static StartArrowRotationAnimation(nodeId, time, startRotation, endRotation) {
    SendMessage(`StartArrowRotationAnimation_${nodeId}_${time}_${startRotation}_${endRotation}`);
  }

  /**
   * 设置箭头的可见性
   * @param {*} nodeId 节点的id值
   * @param {*} visible 箭头可见性
   */
  static SetArrowVisible(nodeId, visible) {
    SendMessage(`SetArrowVisible_${nodeId}_${visible}`);
  }

  /**
   * 设置所有箭头的可见性
   * @param {*} visible 箭头可见性
   */
  static SetAllArrowVisible(visible) {
    SendMessage(`SetAllArrowVisible_${visible}`);
  }

  /**
   * 删除指定箭头节点
   * @param {*} nodeId 节点的id值
   */
  static RemoveArrowNode(nodeId) {
    SendMessage(`RemoveArrowNode_${nodeId}`);
  }

  static SendMqttMessage(time)
  {
    SendMessage(`SendMqttMessage_${time}`);
  }

  // static GetSendMqttMessageAsync(time){

  //   return new Promise((resolve) => {
  //     this.messageCallBack = (message) => {
  //       if (message.startsWith("SendMqttMessage_")) {
  //         let data = message.split("_")[1];
  //         let start = Number.parseInt(data);
  //         let end = Date.now();
  //         let time = end - start;
  //         resolve(time);
  //         this.messageCallBack = null;
  //       }
  //     };
  //   });
  // }

  /**
   * 清除液位节点
   */
  static ClearArrowNode() {
    SendMessage("ClearArrowNode");
  }
  /**
   * **************************************************************以上为箭头操作**************************************************************
   */

  /**
   * 页面路由销毁后，保留视频画面到dom中，方便后续页面再次打开时快速呈现
   */
  static SetEngineContainer() {
    try {
      const player = document.getElementById("cloud_render_player");
      if (player) {
        const containerId = this.#EngineConfiguration.ContainerIds.find((x) => x != player.parentElement.id);
        if (containerId) {
          let container = document.getElementById(containerId);
          container.append(player);
        } else {
          let remain = document.getElementById("containerRemain");
          if (!remain) {
            remain = document.createElement("div");
            remain.id = "containerRemain";
          }

          remain.append(player);
          const body = document.querySelector("body");
          body.append(remain);
          remain.style.display = "none";
        }
      } else {
        console.error("-----渲染video组件不存在-----");
      }
    } catch (error) {
      console.log("--------异常日志-----", error);
    }
  }
}