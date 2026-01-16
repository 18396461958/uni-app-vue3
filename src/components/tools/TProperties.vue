<template>
    <!-- 原生根容器view替换div，纯原生无封装 -->
    <view class="took-button-root" @click="handleClick">
        <!-- 原生实现 左上角悬浮提示 纯view+css+原生鼠标事件，无任何组件 -->
        <view class="tooltip-box" v-show="showTooltip">属性</view>
        <!-- uni-app原生图片标签替换img，纯原生 -->
        <image src="@/static/icons/icon_title_attribute@3x.png" class="btn-icon" 
        @mouseenter="showTooltip = true" @mouseleave="showTooltip = false" ></image>
    </view>
</template>

<script lang="ts" setup>
// 保留原有store引入和核心逻辑，无任何多余引入
import { useToolPlaneStore } from "@/store";
// 原生响应式变量，控制悬浮提示显隐，纯vue原生api无封装
import { ref } from 'vue'
const showTooltip = ref(false)

const toolState = useToolPlaneStore();

// 保留原有的点击切换逻辑，功能不变
function handleClick() {
    toolState.Property = !toolState.Property;
}
</script>

<style lang="css" scoped>
/* 纯原生css，无任何uni-前缀、无任何封装语法 */
.took-button-root {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}
/* 按钮图标样式，保证图片正常展示 */
.btn-icon {
    width: 35px !important;
    height: 35px !important;
}
/* 原生悬浮提示样式 - 精准对应原topLeft左上角位置 */
.tooltip-box {
    position: absolute;
    top: -120%;
    left: 0;
    background-color: #333333;
    color: #ffffff;
    font-size: 22rpx;
    padding: 4rpx 8rpx;
    border-radius: 4rpx;
    white-space: nowrap;
    z-index: 99;
}
</style>