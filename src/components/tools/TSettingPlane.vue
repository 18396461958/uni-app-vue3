<template>
    <!-- 纯原生view替代div，根容器，保留拖拽ref和原有样式结构 -->
    <view class="setting-root" ref="settingRoot">
        <!-- 纯原生实现原TPlaneHeader头部组件，无任何引入，原生view+text组合 -->
        <view class="setting-header" @mousedown="dragHelper.startDrag">
            <text class="header-title">设置面板</text>
            <text class="header-close" @click="()=>{toolState.setting = false}">×</text>
        </view>
        
        <!-- 内容区，纯原生view替代所有div -->
        <view class="setting-content">
            <!-- 日夜模式 -->
            <view class="setting-item">
                <text>日夜模式</text>
                <!-- 纯原生自定义开关组件，无任何第三方，替代a-switch -->
                <view class="native-switch" :class="{'active': dayStatus}" @click="handleDayStatusChange">
                    <text class="switch-text">{{ dayStatus ? '黑夜' : '白天' }}</text>
                </view>
            </view>
            <!-- 动态天空 -->
            <view class="setting-item">
                <text>动态天空</text>
                <view class="native-switch" :class="{'active': dySky}" @click="handleDayStatusChange">
                    <text class="switch-text">{{ dySky ? '开' : '关' }}</text>
                </view>
            </view>
            <!-- 海洋显示 -->
            <view class="setting-item">
                <text>海洋显示</text>
                <view class="native-switch" :class="{'active': ocean}" @click="handleSeaChange">
                    <text class="switch-text">{{ ocean ? '开' : '关' }}</text>
                </view>
            </view>
            <!-- 阴影效果 -->
            <view class="setting-item">
                <text>阴影效果</text>
                <view class="native-switch" :class="{'active': shadow}" @click="handleShadowChange">
                    <text class="switch-text">{{ shadow ? '开' : '关' }}</text>
                </view>
            </view>
            <!-- 自动选中 -->
            <view class="setting-item">
                <text>自动选中</text>
                <view class="native-switch" :class="{'active': toolState.AutoSelection}" @click="toolState.AutoSelection = !toolState.AutoSelection">
                    <text class="switch-text">{{ toolState.AutoSelection ? '开' : '关' }}</text>
                </view>
            </view>
            <!-- 保留原注释的测试项 -->
            <!-- <view class="setting-item">
                <view class="native-switch" :class="{'active': testSwitch}" @click="handleTesChange">
                    <text class="switch-text">{{ testSwitch ? 'mqtt测试' : '关' }}</text>
                </view>
                <text>{{ startDelayTime }}</text>
                <view class="slider-box" @touchmove="handleSliderChange" :style="{width: '100px'}">
                    <view class="slider-track" :style="{width: (delayMs/1000)*100 + '%'}"></view>
                    <view class="slider-btn" :style="{left: (delayMs/1000)*100 + '%'}"></view>
                </view>
                <text>{{ delayMs }}</text>
            </view> -->
        </view>
    </view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { ref, watch } from 'vue';
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from '@/store';

// ✅ 彻底删除多语言useI18n相关所有代码
const toolState = useToolPlaneStore();

// 原生DOM绑定，保留原拖拽逻辑
const settingRoot = ref<HTMLElement | null>(null);
const dragHelper = new DragHelper(settingRoot);

// 所有原变量保留，类型+初始值不变
const dayStatus = ref<boolean>(false);
const dySky = ref<boolean>(false);
const ocean = ref<boolean>(false);
const shadow = ref<boolean>(false);
const testSwitch = ref<boolean>(false);
const delayMs = ref<number>(0);
const startDelayTime = ref<string>("");

// ✅ 保留原监听逻辑，z-index层级处理不变
watch(() => toolState.setting, (newVal) => {
    if (newVal && settingRoot.value) {
        settingRoot.value.style.zIndex = toolState.DivIndex++ + "";
    }
})

// ✅ 保留所有Medusa原生回调注册，逻辑完全不变
Medusa.RegisterStatusCallBack("DynamicCloudState", (value:string) => {
    dySky.value = (value == "0");
});
Medusa.RegisterStatusCallBack("ShadowMode", (value:string) => {
    shadow.value = (value == "1");
});
Medusa.RegisterStatusCallBack("OceanNodeNum", (value:string) => {
    ocean.value = (value == "1");
});
Medusa.RegisterStatusCallBack("TimeModeState", (value:string) => {
    dayStatus.value = (value == "1");
});

// ✅ 保留所有原事件处理方法，逻辑完全不变
function handleDayStatusChange() {
    Medusa.SetDynamicCloud(dySky.value);
    Medusa.SetTimeMode(dayStatus.value?1:0);
}

let TestThread: any;

function handleShadowChange() {
    shadow.value ? Medusa.SetShadowMode(1) : Medusa.SetShadowMode(0);
    // 手动同步开关状态，原生开关需手动赋值
    shadow.value = !shadow.value;
}

function handleTesChange() {
    if(testSwitch.value)
    {
        TestThread && clearInterval(TestThread);
        TestThread = setInterval(() => {
            let t = Date.now();
            startDelayTime.value = new Date(t).toLocaleString() +" " + t % 1000;
            Medusa.SendMqttMessage(t);
        }, 50);
    }
    else
    {
        TestThread && clearInterval(TestThread);
        TestThread = null;
    }
    testSwitch.value = !testSwitch.value;
}

function handleSeaChange() {
    if(ocean.value) {
        Medusa.AddOcean();
    } else {
        Medusa.ClearOcean();
    }
    // 手动同步开关状态
    ocean.value = !ocean.value;
}
</script>

<style scoped>
/* 保留原所有样式，仅把div选择器改为view，无任何新增样式依赖 */
.setting-root
{
    color: #FFF;
    width: 330px;
    height: 340px;
    background-color: #324985;
    position: fixed;
    top: 50%;
    right: 300px;
    transform: translate(-50%, -50%);
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    box-sizing: border-box;
}
/* 原生头部样式，完美替代原TPlaneHeader组件，样式和原头部一致 */
.setting-header {
    width: 100%;
    height: 36px;
    line-height: 36px;
    padding: 0 15px;
    background-color: #324985;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    box-sizing: border-box;
    border-bottom: #3471cb solid 1px;
}
.header-title {
    font-size: 16px;
    font-weight: 500;
}
.header-close {
    font-size: 20px;
    cursor: pointer;
}
.setting-content
{
    background-color: #506498;
    margin-bottom: 28px;
    margin-left: 10px;
    margin-right: 10px;
}
.setting-item{
    background-color: #3b5997;
    font-size: 14px;
    padding-left: 10px;
    padding-right: 10px;
    height: 38px;
    margin-bottom: 1px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: space-between;
}
/* ✅ 纯原生开关样式，无任何依赖，完美复刻a-switch的视觉和大小，和原setting-item-switch一致 */
.native-switch {
    width: 60px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 11px;
    background-color: #999;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.native-switch.active {
    background-color: #3471cb;
}
.switch-text {
    display: inline-block;
    width: 100%;
    height: 100%;
}
</style>