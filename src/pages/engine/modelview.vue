<template>
  <view class="view-root">
    <view class="view-container">
      <image src="/static/images/icon_arrow_down@2x.png" alt="" style="height: 30px;width: 30px;border-radius: 40px; z-index: 9999;
            position: absolute;
            top:20px;
            left: 20px;
            cursor: pointer;" @click="backHome" />
      <image src="/static/images/icon_nav_full@2x.png" alt="" style="height: 30px;width: 30px;border-radius: 40px; z-index: 9999;
            position: absolute;
            top:20px;
            right: 20px;
            cursor: pointer;" @click="fullScreen" />
      <view class="d-progress" v-if="isLoad">
        <view class="progress-circle" :style="{ '--percent': loadProgress }"></view>
        <view class="loading-text">
          <text>{{ loadingInfo }}</text>
        </view>
      </view>
      <view id="video-webrtc"></view>

    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, onMounted } from "vue";
import { postAction } from "@/api";
import { Medusa } from "@/static/engine.sdk";
import { AppEvent, MeasureType } from "@/api/engine/AppEvent";
import { HOME_PATH } from "@/router";

// ✅ 关键：解决TS报错，声明全局Paho对象，无需安装任何依赖
declare global {
  interface Window {
    Paho: any;
  }
}
const screenFullState = ref("no_full");

function fullScreen() {
  let doc = document.querySelector("#app");
  if (doc && !document.fullscreenElement) {
    doc.requestFullscreen();
    screenFullState.value = "full";
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
    screenFullState.value = "no_full";
  }
}

// ✅ 全局变量声明 - 保存MQTT客户端+定时器
let mqttClient: any = null;
let mqttHandshakeTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

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

const isLoad = ref<boolean>(true);
const loadProgress = ref<number>(0);
const loadingInfo = ref<string>("连接中...");
const engineList = ref<EngineInfo[]>([]);

const url = window.location.toString();
const params = url.split("?")[1]?.replace(" ", "").split("&") || [];
let models: string[] = [];
let uuid = "";

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
function backHome(){
  uni.switchTab({
    url: HOME_PATH
  })
}
function OnEngineLoaded() {
  Medusa.InitEngine(
    "video-webrtc",
    `${engineInfo.webrtc}/${engineInfo.engineId}`,
    `${engineInfo.channelIp}/${engineInfo.engineId}`
  );
}

// 页面卸载：销毁所有定时器+关闭MQTT连接+关闭流
onUnmounted(() => {
  OnCloseStream()
  if (mqttHandshakeTimer) {
    clearInterval(mqttHandshakeTimer);
    mqttHandshakeTimer = null; // 同时重置定时器
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null; // 同时重置定时器
  }
  if (mqttClient && mqttClient.isConnected()) {
    mqttClient.disconnect();
  }
  // ✅ 必加：重置MQTT实例为null，彻底销毁旧实例引用
  mqttClient = null;
})



function OnCloseStream() {
  postAction("/Engine/CloseStream", { value: engineInfo.engineId }).then((res) => {
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
  Medusa.RegisterStatusCallBack("ZoomMode", (value: string) => { });
  Medusa.RegisterStatusCallBack("CameraMode", (value: string) => { });
  Medusa.RegisterStatusCallBack("SetRoamPath", (value: string) => { });
  Medusa.RegisterStatusCallBack("RoamPath", (value: string) => {
    AppEvent.dispatchEvent({ type: "OnDrawRoamPath", recordView: value });
  });
  Medusa.RegisterStatusCallBack("GravityEnable", (value: string) => { });
  OnEngineLoaded();
}

const init = async () => {
  Medusa.LoadEngine();
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
    uni.showModal({
      title: "提示",
      content: "当前服务资源压力过大，无法加载模型，请稍后再试。",
      showCancel: false,
      confirmText: "确定",
    });
    return;
  }

  loadProgress.value = 0;
  // 心跳保活定时器
  heartbeatTimer = setInterval(() => {
    postAction("/Engine/KeepliveStream", { value: engineInfo.engineId }).then((res) => {
      console.log("心跳保活:", res);
    }).catch(() => { })
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

  // ========== ↓↓↓ 【终极修复：Paho MQTT 完整适配，核心区域】 ↓↓↓ ==========
  const handshakeId = randomUUID();
  const clientId = `WebClient_${handshakeId}`;
  const handshakeStr = `Handshake_WebClient_0_${handshakeId}`;
  // 解析mqttWs地址：Paho需要 地址+端口 分离
  const mqttHost = engineInfo.mqttWs.replace("ws://", "").split(":")[0];
  const mqttPort = Number(engineInfo.mqttWs.replace("ws://", "").split(":")[1].split("/")[0]);

  // ✅ 1. 创建Paho MQTT客户端【唯一正确写法】
  mqttClient = new window.Paho.Client(
    mqttHost,    // MQTT地址
    mqttPort,    // MQTT端口
    clientId     // 客户端ID
  );

  // ✅ 2. 设置连接断开监听
  mqttClient.onConnectionLost = (responseObject: any) => {
    if (responseObject.errorCode !== 0) {
      console.error("❌ MQTT连接断开:", responseObject.errorMessage);
      uni.showToast({ title: "引擎握手连接断开", icon: "none", duration: 3000 });
    }
  };

  // ✅ 3. 设置收到消息监听【核心：引擎握手响应处理，业务逻辑不变】
  mqttClient.onMessageArrived = (message: any) => {
    const msg = message.payloadString;
    const subscribeTopic = message.destinationName;
    // 收到引擎握手响应，执行核心逻辑
    if (subscribeTopic == engineInfo.engineId && msg.startsWith(`Handshake_MedusaEngine_${handshakeId}`)) {
      LoadEngine(); // 加载引擎
      if (mqttHandshakeTimer) clearInterval(mqttHandshakeTimer); // 停止发送握手包
      mqttClient.unsubscribe(engineInfo.engineId); // 取消订阅
      mqttClient.disconnect(); // 断开MQTT连接
    }
  };

  // ✅ 4. 配置MQTT连接参数 + 建立连接【Paho核心：手动调用connect】
  const connectOptions = {
    userName: "stream_engine",  // 账号
    password: "stream_engine",  // 密码
    cleanSession: false,        // 对应原clean: false
    timeout: 4,                 // 对应原connectTimeout:4000
    onSuccess: () => {
      console.log("✅ MQTT握手连接成功(Paho)");
      // 连接成功后订阅引擎ID主题
      mqttClient.subscribe(engineInfo.engineId);
      // 定时发送握手包，和你原逻辑一致
      mqttHandshakeTimer = setInterval(() => {
        // 必须校验：客户端存在 + 处于已连接状态，才执行发送
        if (mqttClient && mqttClient.isConnected()) {
          mqttClient.send(engineInfo.engineId, handshakeStr);
        }
      }, 300);
    },
    onFailure: (err: any) => {
      console.error("❌ MQTT连接失败:", err);
      uni.showToast({ title: "引擎握手失败，请重试", icon: "none", duration: 3000 });
    }
  };

  // ✅ 5. 执行MQTT连接
  mqttClient.connect(connectOptions);
  // ========== ↑↑↑ 【Paho MQTT 适配结束】 ↑↑↑ ==========
};

init();
</script>

<style lang="scss" scoped>
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

#video-webrtc {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

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