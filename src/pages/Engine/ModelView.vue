<template>
  <view class="view-root">
    <view class="view-container">
      <!-- 加载进度层 - 替换antd的环形进度为uni原生元素 -->
      <view class="d-progress" v-if="isLoad">
        <view class="progress-circle" :style="{ '--percent': loadProgress }"></view>
        <view class="loading-text">
          <text>{{ loadingInfo }}</text>
        </view>
      </view>

      <!-- ✅ 核心：引擎播放器容器 唯一保留的核心节点 -->
      <view id="video-webrtc"></view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { postAction } from "@/api";
import { Medusa } from "@/static/engine.sdk";
import mqtt from "mqtt";

function randomString(length: number, chats: string) {
  if (!length) length = 1;
  if (!chats) chats = "0123456789qwertyuioplkjhgfdsazxcvbnm";
  let str = "";
  for (let i = 0; i < length; i++) {
    const num = Math.floor(Math.random() * chats.length);
    str += chats[num];
  }
  return str;
}

function randomUUID() {
  const chats = "0123456789abcdef";
  return randomString(32, chats);
}

import { AppEvent, MeasureType } from "@/api/engine/AppEvent";

// 核心接口保留
interface EngineInfo {
  whep: string;
  app: string;
  mqttWs: string;
  mqttWss: string;
  engineId: string;
  new: boolean;
  webrtc: string;
  channelIp: string;
  code: number;
}

// ✅ 只保留引擎核心必要变量，全部删除工具面板相关的toolState
const isLoad = ref<boolean>(true);
const loadProgress = ref<number>(0);
const loadingInfo = ref<string>("连接中...");
const engineList = ref<EngineInfo[]>([]);

const url = window.location.toString();
const params = url.split("?")[1]?.replace(" ", "").split("&") || [];
let models: string[] = [];
let uuid = "";

// 引擎配置信息 核心保留
let engineInfo = {
  whep: "http://220.196.62.226:1985/rtc/v1/whep/",
  app: "app",
  mqttWs: "ws://220.196.62.226:30022/mqtt",
  mqttWss: "wss://220.196.62.226:30023/mqtt",
  engineId: "8add02e91f774e76899d4d378d14e8ce",
  webrtc: "",
  channelIp: "",
  new: true,
  code: 0,
};

// ========== 以下全部为引擎核心回调方法，全部保留 ==========
function OnEngineLoaded() {
  Medusa.InitEngine(
    "video-webrtc",
    `${engineInfo.webrtc}/${engineInfo.engineId}`,
    `${engineInfo.channelIp}/${engineInfo.engineId}`
  );
}

// 关闭流核心方法 保留
function OnCloseStream() {
  postAction("/Engine/CloseStream", { value: engineInfo.engineId }).then((res) => {
    // uni-app路由跳转替换vue-router
    uni.redirectTo({ url: "/pages/model/Explorer" });
  });
}

function OnEngineInited() {
  AppEvent.dispatchEvent({ type: "OnInit", ModelId: uuid });
  Medusa.SetCameraMode(1);
  Medusa.StopClip();
  Medusa.StopMeasure();
  loadingInfo.value = "加载模型中...";
  Medusa.GetModelListAsync()
    .then((res: string[]) => {
      let isAlready = true;
      models.forEach((model) => {
        if (!res.includes(model)) {
          Medusa.AddModel(model, model);
          isAlready = false;
        }
      });
      if (isAlready) {
        isLoad.value = false;
        loadProgress.value = 100;
      }
      AppEvent.dispatchEvent({ type: "OnInitAfter", ModelId: uuid });
    })
    .catch((err) => {
      console.log(err);
    });
}

function OnElementSelected(elementId: string, position: string) {
  AppEvent.dispatchEvent({ type: "OnElementSelected", ElementId: elementId, Position: position });
  if (Medusa.CommonEngineConfig.CameraMode == 2 || Medusa.CommonEngineConfig.CameraMode == 3) {
    let pos = position.split(",");
    pos[1] = `${pos[1]}`;
    Medusa.GetCameraView((view: string) => {
      let views = view.split(",");
      pos.push(views[views.length - 1]);
    });
  } else {
    Medusa.ClearHighlightElement();
    Medusa.HighLightElement(elementId, 0, 31, 150, 0.7);
  }
}

function OnMeasureResult<T extends keyof MeasureType>(type: T, data: MeasureType[T]) {
  AppEvent.dispatchEvent({ type: "OnMeasureResult", MeasureType: type, data: data });
}
function OnGetCenterById() { }
function OnGetCameraView() { }
function NoElementFound() {
  console.log("NoElementFound");
}
function NoModel(id: string) {
  console.log("NoModel", id);
  postAction("/File/GetFileInfoByUuid", { value: id }).then((res: any) => {
    const fileInfo = res as any;
    if (fileInfo) {
      // uni原生提示替换antd的message
      uni.showToast({ title: `${fileInfo.name}模型加载异常`, icon: "none", duration: 3000 });
    }
  }).catch((err) => {
    console.log(err);
  });
  loadingInfo.value = "加载模型中...";
  isLoad.value = false;
}
function OnGetModelList() { }
function OnModelProcess(modelId: string, processStr: string) {
  const process = parseFloat(processStr) * 100;
  loadProgress.value = Math.floor(process);
  if (process >= 100) {
    isLoad.value = false;
    loadProgress.value = 100;
  } else {
    loadingInfo.value = "加载模型中...";
    isLoad.value = true;
  }
}
function OnPersonRoamPath(recordView: string) {
  AppEvent.dispatchEvent({ type: "OnPersonRoamPath", recordView: recordView });
}
function OnGetModelInfo() { }
function OnCameraPos() { }
function OnCloseToElement() { }
function OnClickPointMarker() { }

// ========== 引擎加载核心方法 保留 ==========
function LoadEngine() {
  AppEvent.dispatchEvent({ type: "OnLoadModelInfos", ModelIds: models });
  Medusa.RegisterEvent(Medusa.EnumEvents.OnEngineLoaded, OnEngineLoaded);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnEngineInited, OnEngineInited);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnElementSelected, OnElementSelected);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnMeasureResult, OnMeasureResult);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnGetCenterById, OnGetCenterById);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnGetCameraView, OnGetCameraView);
  Medusa.RegisterEvent(Medusa.EnumEvents.NoElementFound, NoElementFound);
  Medusa.RegisterEvent(Medusa.EnumEvents.NoModel, NoModel);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnGetModelList, OnGetModelList);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnModelProcess, OnModelProcess);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnPersonRoamPath, OnPersonRoamPath);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnGetModelInfo, OnGetModelInfo);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnCameraPos, OnCameraPos);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnCloseToElement, OnCloseToElement);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnClickPointMarker, OnClickPointMarker);
  Medusa.RegisterEvent(Medusa.EnumEvents.OnMessageCallback, (msg: string) => {
    AppEvent.dispatchEvent({ type: "OnMessageCallback", msg: msg });
  });
  // 保留核心状态回调
  Medusa.RegisterStatusCallBack("ZoomMode", (value: string) => { });
  Medusa.RegisterStatusCallBack("CameraMode", (value: string) => { });
  Medusa.RegisterStatusCallBack("SetRoamPath", (value: string) => { });
  Medusa.RegisterStatusCallBack("RoamPath", (value: string) => {
    AppEvent.dispatchEvent({ type: "OnDrawRoamPath", recordView: value });
  });
  Medusa.RegisterStatusCallBack("GravityEnable", (value: string) => { });
  Medusa.LoadEngine();
}

// ========== 页面挂载核心逻辑 全部保留（引擎初始化关键） ==========
const init = async () => {
  // 解析url参数
  for (let i = 0; i < params.length; i++) {
    const param = params[i].split("=");
    if (param[0] == "fileId") {
      models.push(param[1]);
      uuid = param[1];
    }
    if (param[0] == "folderId") {
      let res = await postAction(`/File/GetFiles?folderId=${param[1]}`);
      const files = res as any;
      for (let i = 0; i < files.length; i++) {
        models.push(files[i].uuid);
      }
      uuid = param[1];
    }
  }

  // 打开引擎流
  const openRes = await postAction("/Engine/OpenStream", { value: uuid });
  engineInfo = openRes.Data as any;
  if (engineInfo.code < 0) {
    // uni原生弹窗替换antd的Modal
    uni.showModal({
      title: "提示",
      content: "当前服务资源压力过大，无法加载模型，请稍后再试。",
      showCancel: false,
      confirmText: "确定",
    });
    return;
  }

  loadProgress.value = 0;
  // 心跳保活
  setInterval(() => {
    postAction("/Engine/KeepliveStream", { value: engineInfo.engineId }).then((res) => {
      console.log(res);
    });
  }, 30000);

  // 文件权限校验
  let isNoOpen = false;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      await postAction("/File/GetFileInfoByUuid", { value: model });
    } catch (error) {
      isNoOpen = true;
    }
  }
  if (isNoOpen) {
    uni.showModal({
      title: "文件权限不足",
      content: "您暂无权限查看当前文件，请联系管理员获取权限后重试",
      showCancel: true,
      confirmText: "确定",
      cancelText: "取消",
      success: () => {
        uni.redirectTo({ url: "/pages/model/Explorer" });
      },
    });
    return;
  }

  // MQTT握手连接引擎 核心逻辑保留
  const handshakeId = randomUUID();
  const options = {
    clean: false,
    connectTimeout: 4000,
    clientId: `WebClient_${handshakeId}`,
    username: "stream_engine",
    password: "stream_engine",
  };
  const handshakeStr = `Handshake_WebClient_0_${handshakeId}`;
  let client = mqtt.connect(engineInfo.mqttWs, options);
  let timeHandle: NodeJS.Timeout;
  client.on("connect", () => {
    client.subscribe(engineInfo.engineId, (err) => {
      if (!err) {
        timeHandle = setInterval(() => {
          client.publish(engineInfo.engineId, handshakeStr);
        }, 300);
      }
    });
  });
  client.on("message", (subscribe: string, payload: Buffer) => {
    const msg = payload.toString();
    if (subscribe == engineInfo.engineId && msg.startsWith(`Handshake_MedusaEngine_${handshakeId}`)) {
      LoadEngine();
      client.unsubscribe(engineInfo.engineId);
      client.disconnected = true;
      clearTimeout(timeHandle);
      client.endAsync();
    }
  });
  client.on("disconnect", (err) => {
    console.log(err);
  });
};
init();
</script>

<style lang="scss" scoped>
// ✅ 全部为uni-app原生样式，删除所有无用样式
.view-root {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}

.view-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #143967;
}

// 引擎核心容器 - 必须保留 宽高100%
#video-webrtc {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

// 加载进度层
.d-progress {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #143967;
}

// 原生环形进度条 替代antd的a-progress
.progress-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: conic-gradient(#87d068 calc(var(--percent) * 1%), #108ee9 0);
  display: flex;
  justify-content: center;
  align-items: center;

  &::after {
    content: "";
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background-color: #143967;
  }
}

.loading-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #ffffff;
}

// 关闭按钮样式
.action-bar {
  position: fixed;
  top: 30rpx;
  right: 30rpx;
  width: 64rpx;
  height: 64rpx;
  z-index: 999;
}

.action-icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff0000;
  font-size: 40rpx;
  border-radius: 50%;
  border: 1px solid #ff0000;
  box-sizing: border-box;

  &:active {
    background-color: rgba(172, 39, 39, 0.2);
  }
}
</style>