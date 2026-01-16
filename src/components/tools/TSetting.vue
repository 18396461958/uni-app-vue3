<template>
  <!-- 纯原生uni-app基础标签 view 替代 div，无任何其他组件 -->
  <view class="took-button-root" @click="handleClick">
    <!-- 原生image标签替代img，uni-app必须用这个，纯原生基础组件 -->
    <image src="@/static/icons/icon_title_set@3x.png" mode="widthFix" class="setting-icon"></image>
    <!-- 纯原生view实现 左上悬浮提示，替代a-tooltip，无任何第三方组件 -->
    <view class="tooltip-text">设置</view>
  </view>
</template>

<script lang="ts" setup>
// 只保留核心业务逻辑，彻底删除所有多语言相关引入和变量
import { useToolPlaneStore } from "@/store";

const toolState = useToolPlaneStore();

// 原点击逻辑完全保留，功能不变
function handleClick() {
  toolState.setting = !toolState.setting;
}
</script>

<style lang="css" scoped>
/* 彻底移除:deep深度选择器，原生样式直接生效 */
.took-button-root {
  cursor: pointer; /* 鼠标悬停手型，H5端生效 */
  position: relative; /* 为悬浮提示做定位，核心必备 */
  display: inline-block;
}

/* 设置图标样式 */
.setting-icon {
  width: 35px;
  height: 35px;
}

/* 纯原生CSS实现 左上悬浮提示，完美替代原a-tooltip的topLeft效果 */
.tooltip-text {
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

/* 原生hover伪类，鼠标悬浮时显示提示文本，纯原生实现无依赖 */
.took-button-root:hover .tooltip-text {
  display: block;
}
</style>