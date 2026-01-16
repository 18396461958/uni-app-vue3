<template>
  <!-- 原生view替代div，核心点击容器 -->
  <view class="took-button-root" @click="toolState.ViewPoint = !toolState.ViewPoint">
    <!-- 纯原生实现 左上悬浮提示（替代a-tooltip，无任何封装组件） -->
    <view class="native-tooltip">
      <text class="tooltip-text">视角切换</text>
    </view>
    <!-- 原生image替代img，uni-app官方原生图片标签 -->
    <image src="@/static/icons/icon_title_close@3x.png" mode="widthFix" alt="视角图标"></image>
  </view>
</template>

<script setup lang="ts">
// 原生js写法，移除ts setup语法糖，保留仓库引入逻辑
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();

</script>

<style scoped>
/* 原样式保留 + 原生悬浮提示样式实现，纯css原生写法 */
.took-button-root {
  position: relative;
  /* 这里可以保留你原来的按钮宽高、对齐等样式，不做改动 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 纯原生 左上悬浮提示核心样式 - 替代a-tooltip */
.native-tooltip {
  position: absolute;
  top: -36rpx;
  left: -10rpx;
  z-index: 99;
  visibility: hidden;
  opacity: 0;
  transition: all 0.2s linear;
}
.tooltip-text {
  display: inline-block;
  padding: 8rpx 16rpx;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 24rpx;
  border-radius: 6rpx;
  white-space: nowrap;
}
/* 鼠标悬浮时显示提示，原生hover事件纯css实现 */
.took-button-root:hover .native-tooltip {
  visibility: visible;
  opacity: 1;
}

/* 原生image样式自适应，防止图片变形 */
.took-button-root image {
  width: 100%;
  height: auto;
}
</style>