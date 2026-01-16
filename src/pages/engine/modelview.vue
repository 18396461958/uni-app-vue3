<template>
  <view class="view-root">
    <view class="view-container">
      <image src="/static/images/icon_arrow_down@2x.png" alt="" style="height: 30px;width: 30px;border-radius: 40px; z-index: 9999;
            position: absolute;
            top:20px;
            left: 20px;
            cursor: pointer;" @click="backHome" />
      <view class="d-progress" v-if="isLoad">
        <view class="progress-circle" :style="{ '--percent': loadProgress }"></view>
        <view class="loading-text">
          <text>{{ loadingInfo }}</text>
        </view>
      </view>
      <view id="video-webrtc"></view>

      <!-- ↓↓↓ 【新增：移植所有工具面板组件，完全复用样本的显隐逻辑】↓↓↓ -->
      <TSettingPlane v-show="toolState.setting" />
      <TStructTreePlane v-show="toolState.structTree" />
      <TPropertyPlane v-show="toolState.Property" />
      <TSectionPlane v-show="toolState.Section" />
      <TRoamPlane v-show="toolState.Roam" />
      <TMeasurePlane v-show="toolState.Measure" />
      <TElementOptPlane v-show="toolState.ElementOpt" />
      <TViewPointPlane v-show="toolState.ViewPoint" />
      <TMarkerPlane v-show="toolState.Marker" />
      <TTestPlane v-show="toolState.test" />
      <!-- ↑↑↑ 工具面板组件结束 ↑↑↑ -->

      <!-- ↓↓↓ 【新增：右上角关闭流按钮+tooltip 跟样本一致】↓↓↓ -->
      <view class="action-bar">
        <view class="action-icon" @click="OnCloseStream">
          <text class="iconfont icon-poweroff"></text>
        </view>
      </view>
      <!-- ↑↑↑ 关闭流按钮结束 ↑↑↑ -->

      <!-- ↓↓↓ 【新增：全局工具栏组件】↓↓↓ -->
      <ToolKit/>
      <!-- ↑↑↑ 工具栏组件结束 ↑↑↑ -->
      
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref,reactive, onUnmounted, onMounted } from "vue";
import { postAction } from "@/api";
import { Medusa } from "@/static/engine.sdk";
import { AppEvent, MeasureType } from "@/api/engine/AppEvent";
import { HOME_PATH } from "@/router";
import { useToolPlaneStore } from "@/store";

// ✅ 【新增：移植样本所有组件导入 - 核心移植点1】
import ToolKit from "@/components/tools/Toolkit.vue";
import TSettingPlane from "@/components/tools/TSettingPlane.vue";
import TStructTreePlane from "@/components/tools/TStructTreePlane.vue";
import TPropertyPlane from "@/components/tools/TPropertyPlane.vue";
import TSectionPlane from "@/components/tools/TSectionPlane.vue";
import TViewPointPlane from "@/components/tools/TViewPointPlane.vue";
import TMarkerPlane from "@/components/tools/TMarkerPlane.vue";
import TMeasurePlane from "@/components/tools/TMeasurePlane.vue";
import TRoamPlane from "@/components/tools/TRoamPlane.vue";
import TElementOptPlane from "@/components/tools/TElementOptPlane.vue";
import TTestPlane from '@/components/tools/TTestPlane.vue';

const toolState = useToolPlaneStore();

// ✅ 关键：解决TS报错，声明全局Paho对象，无需安装任何依赖
declare global {
  interface Window {
    Paho: any;
  }
}
const screenFullState = ref("no_full");

function fullScreen() {
  let doc = document.querySelector("html");
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

// ✅ 【新增：补充样本的FileInfo接口，解决TS报错】
interface FileInfo {
  uuid: string;
  name: string;
  [key:string]: any
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

// ✅ 【新增：移植样本的所有状态变量，组件联动使用，无侵入】
const ZoomMode = ref<boolean>(false);
const CameraModeCode = ref<string>();
const CameraMode = ref<string>();
const SetRoamPath = ref<string>();
const GravityEnable = ref<string>();

const url = window.location.toString();
const params = url.split("?")[1]?.replace(" ", "").split("&") || [];
let models: string[] = [];
let uuid = "";

// ✅ 【新增：样本核心赋值，组件需要的模型列表】
toolState.models = [];

const engineInfo = reactive({
  whep: "http://220.196.62.226:1985/rtc/v1/whep/",
  app: "app",
  mqttWs: "ws://220.196.62.226:30022/mqtt",
  mqttWss: "wss://220.196.62.226:30023/mqtt",
  engineId: "8add02e91f774e76899d4d378d14e8ce",
  webrtc: "",
  channelIp: "",
  new: true,
  code: 0,
});

// ✅ 【新增：样本的服务压力过大弹窗方法】
const showConfirm = () => {
  uni.showModal({
    title: '提示',
    content: '当前服务资源压力过大，无法加载模型，请稍后再试。',
    showCancel: false,
    confirmText: '确定',
  });
};

function backHome(){
  uni.switchTab({
    url: HOME_PATH
  })
}

function OnEngineLoaded() {
  if(!engineInfo.webrtc){
    setTimeout(()=>{OnEngineLoaded()},200)
    return
  }
  Medusa.InitEngine(
    "video-webrtc",
    `${engineInfo.webrtc}/${engineInfo.engineId}`,
    `${engineInfo.channelIp}/${engineInfo.engineId}`
  );
}

// 页面卸载：销毁所有定时器+关闭MQTT连接+关闭流
onUnmounted(() => {
  Medusa.RemoveAllEvent();
  OnCloseStream()
  if (mqttHandshakeTimer) {
    clearInterval(mqttHandshakeTimer);
    mqttHandshakeTimer = null;
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (mqttClient && mqttClient.isConnected()) {
    mqttClient.unsubscribe(engineInfo.engineId);
    mqttClient.disconnect();
    mqttClient.stopTrace();
    mqttClient.onMessageArrived = null;
  }
  mqttClient = null;
  document.querySelectorAll('head script[src*="static/medusa"]').forEach(script => {
    script.remove();
  });
})

function OnCloseStream() {
  postAction("/Engine/CloseStream", { value: engineInfo.engineId }).then((res) => {
    uni.switchTab({ url: HOME_PATH });
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

// ✅ 【完整补全：样本的OnElementSelected方法，组件联动核心逻辑，无侵入原有代码】
function OnElementSelected(elementId: string, position: string) {
  let cId = elementId.split("*");
  AppEvent.dispatchEvent({type:"OnElementSelected", ModelId:cId[0],ElementId:cId[1],  Position:position});
  
  if (toolState.Measure) {
      return;
  }
  if (Medusa.CommonEngineConfig.CameraMode == 2 || Medusa.CommonEngineConfig.CameraMode == 3) {
      let pos = position.split(",");
      pos[1] = `${pos[1]}`;
      Medusa.GetCameraView((view:string) => {
        let views = view.split(",");
        pos.push(views[views.length - 1]);
        toolState.roamingPosition = pos.join(",");
      });
  } 
  else {
      Medusa.ClearHighlightElement();
      if(toolState.AutoSelection)
      {
          Medusa.HighLightElement(elementId, 0, 31, 150, 0.7);
          toolState.annotation.elementId = elementId;
          toolState.annotation.position = position;
          if (!toolState.selectedElements.includes(elementId)) {
              toolState.selectedElements.push(elementId);
          }
      }
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
    if(toolState.modelInfos.has(modelId)) {
        const modelInfo = toolState.modelInfos.get(modelId);
        if (modelInfo) {
            loadingInfo.value = `${modelInfo.name}: 加载模型中...`;
        }
    } else {
        loadingInfo.value = "加载模型中...";
    }
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

  // ✅ 【完整补全：样本的所有状态回调，组件联动核心，无侵入】
  Medusa.RegisterStatusCallBack("ZoomMode", (value:string) => {
    ZoomMode.value = (value == "0");
  });
  Medusa.RegisterStatusCallBack("CameraMode", (value:string) => {
    CameraModeCode.value = value;
    CameraMode.value = `相机视角：${value == "2" ? "第三人称" : value == "3" ? "第一人称" : value == "4" ? "上帝视角" : "常规视角"}`;
  });
  Medusa.RegisterStatusCallBack("SetRoamPath", (value:string) => {
    SetRoamPath.value = `${value == "true" ? "open" : "close"}`;
  });
  Medusa.RegisterStatusCallBack("RoamPath", (value:string) => {
    AppEvent.dispatchEvent({type:"OnDrawRoamPath", recordView:value});
  });
  Medusa.RegisterStatusCallBack("GravityEnable", (value:string) => {
    GravityEnable.value = `${value == "true" ? "open" : "close"}`;
  });
  
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
      toolState.models.push(param[1]);
    }
    if (param[0] == "folderId") {
      let res = await postAction(`/File/GetFiles?folderId=${param[1]}`);
      const files = res as any;
      for (let i = 0; i < files.length; i++) {
        models.push(files[i].uuid);
        toolState.models.push(files[i].uuid);
      }
      uuid = param[1];
    }
  }

  toolState.projectId = uuid;

  // 打开引擎流
  const openRes = await postAction("/Engine/OpenStream", { value: uuid });
  Object.keys(openRes.Data).forEach((key)=>{
    engineInfo[key] = openRes.Data[key]
  })

  if (engineInfo.code < 0) {
    showConfirm();
    return;
  }

  loadProgress.value = 0;
  // 心跳保活定时器
  heartbeatTimer = setInterval(() => {
    postAction("/Engine/KeepliveStream", { value: engineInfo.engineId }).then((res) => {
      console.log("心跳保活:", res);
    }).catch(() => { })
  }, 30000);

  // ✅ 【新增：样本的文件权限校验完整逻辑，组件需要的模型信息】
  let isNoOpen = false;
  for (let i = 0; i < toolState.models.length; i++) {
      const model = toolState.models[i];
      try {
          let modelInfo: FileInfo = await postAction("/File/GetFileInfoByUuid", { value: model }) as any;
          toolState.modelInfos.set(modelInfo.uuid, modelInfo);
      } catch (error) {
          isNoOpen = true;
      }
  }
  if(isNoOpen)
  {
      uni.showModal({
          title:"文件权限不足",
          content: "您暂无权限查看当前文件，请联系管理员获取权限后重试",
          centered:true,
          confirmText:"确定",
          cancelText:"取消",
          success: () => {
              backHome();
          },
      });
      return;
  }

  // ========== ↓↓↓ 【你的核心MQTT逻辑 - 完全未修改，一行没动】 ↓↓↓ ==========
  const handshakeId = randomUUID();
  const clientId = `WebClient_${handshakeId}`;
  const handshakeStr = `Handshake_WebClient_0_${handshakeId}`;
  const mqttHost = engineInfo.mqttWs.replace("ws://", "").split(":")[0];
  const mqttPort = Number(engineInfo.mqttWs.replace("ws://", "").split(":")[1].split("/")[0]);

  mqttClient = new window.Paho.Client(
    mqttHost,
    mqttPort,
    clientId
  );

  mqttClient.onConnectionLost = (responseObject: any) => {
    if (responseObject.errorCode !== 0) {
      console.error("❌ MQTT连接断开:", responseObject.errorMessage);
      uni.showToast({ title: "引擎握手连接断开", icon: "none", duration: 3000 });
    }
  };

  mqttClient.onMessageArrived = (message: any) => {
    const msg = message.payloadString;
    const subscribeTopic = message.destinationName;
    if (subscribeTopic == engineInfo.engineId && msg.startsWith(`Handshake_MedusaEngine_${handshakeId}`)) {
      LoadEngine();
      if (mqttHandshakeTimer) clearInterval(mqttHandshakeTimer);
      mqttClient.unsubscribe(engineInfo.engineId);
      mqttClient.disconnect();
    }
  };

  const connectOptions = {
    userName: "stream_engine",
    password: "stream_engine",
    cleanSession: false,
    timeout: 4,
    onSuccess: () => {
      console.log("✅ MQTT握手连接成功(Paho)");
      mqttClient.subscribe(engineInfo.engineId);
      mqttHandshakeTimer = setInterval(() => {
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

  mqttClient.connect(connectOptions);
  // ========== ↑↑↑ 【核心MQTT逻辑 结束 - 无任何修改】 ↑↑↑ ==========
};

onMounted(()=>{init();})
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

// ✅ 【新增：移植样本的关闭流按钮样式，适配uniapp rpx】
.action-bar {
    position: fixed;
    top: 30rpx;
    right: 150rpx;
    width: 64rpx;
    height: 64rpx;
    color: red;
    z-index: 1000;
}
.action-icon
{
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: red;
    font-size: 40rpx;
}
.action-icon:active {
    color: rgb(172, 39, 39);
    border: rgb(172, 39, 39) 1px solid;
    border-radius: 50%;
}
</style>