<template>
    <!-- 根容器用uni原生view替代div，纯原生标签 -->
    <view class="took-button-root" @click="handleClick">
        <!-- 原生悬浮提示容器 纯view+css实现原a-tooltip的topLeft效果 -->
        <view class="native-tooltip-box">
            <!-- uni原生图片标签替代img，纯原生无封装 -->
            <image src="@/static/icons/icon_title_structure@2x.png" mode="widthFix"></image>
            <!-- 移除多语言，直接固化中文提示文案 -->
            <view class="tooltip-text">结构树</view>
        </view>
    </view>
</template>

<script lang="ts" setup>
// 只保留核心业务逻辑，彻底删除所有i18n多语言相关代码
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();

// 原点击逻辑完全保留，功能不变
function handleClick() {
    toolState.structTree = !toolState.structTree;
}
</script>

<style lang="css" scoped>
/* 原生实现hover悬浮提示 无任何js，纯css控制显示隐藏，位置和原topLeft一致 */
.took-button-root {
    cursor: pointer;
    display: inline-block;
}
.native-tooltip-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
/* 原生悬浮提示文案样式，完全复刻原tooltip的左上悬浮效果 */
.tooltip-text {
    position: absolute;
    top: -30px;
    left: -10px;
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    display: none;
    z-index: 99;
}
/* hover触发显示，纯原生css原生事件，无任何uni-api */
.native-tooltip-box:hover .tooltip-text {
    display: block;
}
</style>