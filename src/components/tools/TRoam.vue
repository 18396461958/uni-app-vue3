<template>
  <!-- 原生块级容器替代div，uni-app原生根标签 -->
  <view class="took-button-root" @click="handleClick">
    <!-- 纯原生CSS实现 左上悬浮提示（替代a-tooltip） -->
    <text class="roam-tooltip">漫游</text>
    <!-- 原生图片标签替代img，uni-app唯一原生图片组件 -->
    <image src="@/static/icons/icon_title_roam@3x.png" mode="aspectFit" style="height: 30px;width: 30px;"></image>
  </view>
</template>

<script lang="ts" setup>
// 只保留业务核心代码，已删除所有多语言i18n相关导入+代码
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();

// 原有点击逻辑完全不变，保留原功能
function handleClick() {
    toolState.Roam = !toolState.Roam;
}
</script>

<style lang="css" scoped>
/* 根容器样式 - 移除无用的:deep穿透，纯原生无需穿透 */
.took-button-root {
  cursor: pointer; /* 鼠标悬停手型，H5端生效 */
  position: relative; /* 为悬浮提示做定位，核心必备 */
  display: inline-block;
}

/* 纯原生CSS实现 左上悬浮提示（替代第三方a-tooltip）原生悬浮效果 */
.roam-tooltip {
  position: absolute;
  left: 0;
  top: -30px; /* 向上偏移，左上位置贴合原需求placement="topLeft" */
  z-index: 99;
  padding: 4px 8px;
  background-color: #ffffff;
  color: #333333;
  font-size: 24rpx;
  border-radius: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
  white-space: nowrap;
  opacity: 0; /* 默认隐藏 */
  pointer-events: none;
  transition: opacity 0.2s linear;
}

/* 鼠标悬浮时显示提示文字，纯原生hover触发，无任何JS */
.took-button-root:hover .roam-tooltip {
  opacity: 1; /* 悬浮显示 */
}

/* uni-app原生图片样式：防止图片拉伸，保持原有图标大小 */
.took-button-root image {
  width: auto;
  height: auto;
}
</style>