<template>
    <!-- 纯原生view，无任何自定义组件，替换原外层容器 -->
    <view class="tool-button-root" @click="toolState.Marker = !toolState.Marker">
        <!-- 原生悬浮提示容器 - 纯view+text实现，替代uni-tooltip，位置完全对应原top-left -->
        <view class="tooltip-box">
            <!-- 原生img标签，保留原图标路径和属性 -->
            <img src="@/static/icons/icon_title_file@3x.png" alt="标记" style="height: 35px;width: 35px;">
            <!-- 原生text标签承载中文提示文案，纯原生无任何封装 -->
            <text class="tooltip-text">模型标注</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
// 保留原有业务逻辑，无任何修改
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();
</script>

<style lang="css" scoped>
/* 按钮根容器样式 - 纯原生css */
.tool-button-root {
    cursor: pointer; /* H5端鼠标手型，小程序/App端无影响 */
}
/* 悬浮提示外层容器 - 核心：相对定位，保证提示文案绝对定位不偏移 */
.tooltip-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
/* 原生悬浮提示文案样式 - 完美替代 uni-tooltip 的 top-left 左上悬浮效果 */
.tooltip-text {
    /* 绝对定位实现左上悬浮，和原uni-tooltip的top-left完全一致 */
    position: absolute;
    top: -36rpx;
    left: -20rpx;
    /* 提示框样式美化，和原生tooltip一致的视觉效果 */
    padding: 8rpx 16rpx;
    background-color: rgba(0, 0, 0, 0.8);
    color: #ffffff;
    font-size: 24rpx;
    border-radius: 6rpx;
    white-space: nowrap;
    /* 默认隐藏，悬浮显示 */
    opacity: 0;
    visibility: hidden;
    /* 过渡动画，显示隐藏更顺滑 */
    transition: all 0.2s ease-in-out;
    /* 提高层级防止被遮挡 */
    z-index: 999;
    /* 纯原生样式，无任何deep穿透 */
}
/* 鼠标悬浮时显示提示文案 - 原生css hover事件，替代uni-tooltip的触发逻辑 */
.tooltip-box:hover .tooltip-text {
    opacity: 1;
    visibility: visible;
}
/* 图标本身样式，可选优化，保持原大小 */
.tooltip-box img {
    width: auto;
    height: 48rpx;
}
</style>