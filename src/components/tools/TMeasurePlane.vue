<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 纯原生实现 顶部标题栏 - 替代原TPlaneHeader组件，保留拖拽+关闭逻辑 -->
        <view class="header-root" @mousedown="dragHelper.startDrag">
            <text class="header-title">测量工具</text>
            <view class="header-close" @click="() => { toolState.Measure = false }">×</view>
        </view>
        
        <!-- 内容区域 -->
        <view class="setting-content">
            <!-- 纯原生手写分段选择器 - 替代原a-segmented组件，无任何第三方依赖 -->
            <view class="segmented-root">
                <view 
                    class="segmented-item"
                    :class="{ active: value === item }"
                    v-for="item in data" 
                    :key="item"
                    @click="value = item"
                >
                    <text class="segmented-text">{{ item }}</text>
                </view>
            </view>

            <!-- 两点测距面板 -->
            <view v-if='value == "两点测距"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>直线距离：</text>
                    <text>{{ pointDistance }}m</text>
                </view>
                <view class="setting-item" style="color: #b31e00; font-size: 14px;">
                    <text>X轴距离：</text>
                    <text>{{ xDistance }}m</text>
                </view>
                <view class="setting-item" style="color: #2ec619; font-size: 14px; ">
                    <text>Y轴距离：</text>
                    <text>{{ yDistance }}m</text>
                </view>
                <view class="setting-item" style="color: yellow; font-size: 14px;">
                    <text>Z轴距离：</text>
                    <text>{{ zDistance }}m</text>
                </view>
            </view>

            <!-- 多段测距面板 -->
            <view v-if='value == "多段测距"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>测距总长：</text>
                    <text>{{ pointDistance }}m</text>
                </view>
            </view>

            <!-- 角度测量面板 -->
            <view v-if='value == "角度测量"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>测量角度：</text>
                    <text>{{ pointDistance }}°</text>
                </view>
            </view>

            <!-- 表面积测量面板 -->
            <view v-if='value == "表面积测量"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>表面积：</text>
                    <text>{{ pointDistance }}m²</text>
                </view>
            </view>

            <!-- 闭合面积测量面板 -->
            <view v-if='value == "闭合面积测量"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>闭合面积：</text>
                    <text>{{ pointDistance }}m²</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { reactive, ref, watch } from 'vue';
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from '@/store';
import { AppEvent } from '@/api/engine/AppEvent';

// 全局状态
const toolState = useToolPlaneStore();
// 拖拽容器ref
const settingRoot = ref<HTMLElement | null>(null);
// 拖拽实例 - 保留原有拖拽逻辑
const dragHelper = new DragHelper(settingRoot);

// 纯中文选项数组 替代原有多语言的$t数组
const data = reactive([
    "两点测距",
    "多段测距",
    "角度测量",
    "表面积测量",
    "闭合面积测量"
]);
// 默认选中第一项
const value = ref(data[0]);

// 测量数值变量
const pointDistance = ref<string>("0");
const xDistance = ref<string>("0");
const yDistance = ref<string>("0");
const zDistance = ref<string>("0");

// 监听测量面板显隐，修改层级 - 原逻辑不变
watch(() => toolState.Measure, (newVal) => {
    if (newVal && settingRoot.value) {
        settingRoot.value.style.zIndex = toolState.DivIndex++ + "";
    }
})

// 重置测量数据 - 原逻辑不变
function ResetData() {
    pointDistance.value = "0";
    xDistance.value = "0";
    yDistance.value = "0"; 
}

// 监听测量结果回调 - 原逻辑完全不变
AppEvent.addEventListener("OnMeasureResult", (e) => {
    switch (e.MeasureType) {
        case "dis":
            {
                pointDistance.value = Number(e.data[0]).toFixed(3);
                xDistance.value = Number(e.data[1]).toFixed(3);
                yDistance.value = Number(e.data[2]).toFixed(3);
                zDistance.value = Number(e.data[3]).toFixed(3);
            }
            break;
        case "angle":
            {
                pointDistance.value = Number(e.data).toFixed(3);
            }
            break;
        case "area":
            {
                pointDistance.value = Number(e.data).toFixed(3);
            };
            break;
        case "closedArea":
            {
                pointDistance.value = Number(e.data).toFixed(3);
            }
            break;
        case "polyline":
            {
                pointDistance.value = Number(e.data).toFixed(3);
            }
    }
})

// 根据选中项启动对应测量 - 替换中文判断，逻辑不变
function startMeasureByValue(measureValue: string) {
    ResetData();
    switch (measureValue) {
        case "两点测距":
            Medusa.StartMeasure(1);
            break;
        case "多段测距":
            Medusa.StartMeasure(4);
            break;
        case "角度测量":
            Medusa.StartMeasure(2);
            break;
        case "表面积测量":
            Medusa.StartMeasure(3);
            break;
        case "闭合面积测量":
            Medusa.StartMeasure(5);
            break;
    }
}

// 监听测量状态，启动/停止测量 - 原逻辑不变
watch(() => toolState.Measure, (newValue) => {
    if (newValue) {
        startMeasureByValue(value.value);
    } else {
        Medusa.StopMeasure();
    }
});

// 监听选中项切换，切换测量类型 - 原逻辑不变
watch(value, (newValue) => {
    Medusa.StopClip();
    setTimeout(() => {
        startMeasureByValue(newValue);
    }, 100)
});
</script>

<style scoped>
/* 根容器样式 - 原样式不变，仅适配view标签 */
.setting-root {
    color: #FFF;
    width: fit-content;
    background-color: #324985;
    position: fixed;
    height: 270px;
    top: 30%;
    right: 300px;
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

/* 原生头部样式 - 替代原TPlaneHeader组件样式 */
.header-root {
    width: 100%;
    height: 36px;
    line-height: 36px;
    background-color: #3471cb;
    padding: 0 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
}
.header-title {
    font-size: 16px;
    font-weight: 500;
}
.header-close {
    font-size: 20px;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
}

/* 内容区域样式 - 原样式不变 */
.setting-content {
    background-color: #324985;
    margin: 10px;
}

/* 原生分段选择器样式 - 纯手写替代a-segmented */
.segmented-root {
    display: flex;
    width: 100%;
    border: 1px solid #3471cb;
    border-radius: 4px;
    overflow: hidden;
}
.segmented-item {
    flex: 1;
    text-align: center;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    cursor: pointer;
    background-color: #293c70;
}
.segmented-item.active {
    background-color: #3471cb;
    color: #ffffff;
}
.segmented-text {
    display: block;
    width: 100%;
    height: 100%;
}

/* 面板样式 - 原样式不变 */
.setting-tab-plane {
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: #324985;
}

/* 测量项样式 - 原样式不变 */
.setting-item {
    font-size: 14px;
    padding-top: 5px;
	padding-left: 10px;
	padding-right: 50px;
	padding-bottom: 1px;
	height: 38px;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
    box-sizing: border-box;
}
</style>