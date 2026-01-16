<template>
  <!-- uni原生视图容器 替代原div，纯原生核心标签 -->
  <view class="took-button-root" @click="handleClick">
    <!-- 原生图标容器 - 用于定位提示框 -->
    <view class="icon-box">
      <!-- uni原生图片组件 替代原img标签，纯原生，多端适配最优 -->
      <image src="@/static/icons/icon_title_set@3x.png" mode="widthFix"></image>
      <!-- 纯原生CSS实现的tooltip提示框 替代原a-tooltip第三方组件，居左上topLeft，默认隐藏 -->
      <view class="native-tooltip">设置</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 只保留原业务核心逻辑，全部删除多语言相关的引入和变量
import { useToolPlaneStore } from "@/store";

const toolState = useToolPlaneStore();

// 原点击事件逻辑完全保留，功能不变
function handleClick() {
  toolState.test = !toolState.test;
}
</script>

<style lang="css" scoped>
/* uni原生支持scoped，原:deep()深度选择器 替换为 uni原生兼容的 /deep/ 语法，无任何vue专属语法 */
/deep/ .took-button-root {
  /* 鼠标手型 H5端生效 */
  cursor: pointer;
  /* 小程序/APP端 鼠标悬浮反馈（弥补无cursor的问题）纯原生css */
  transition: all 0.2s ease;
}

/* 点击根容器样式 - 原逻辑保留+多端适配 */
.took-button-root {
  width: 20px;
  height: 20px;
  background-color: #0A2772;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图标容器 - 相对定位，用于承载原生tooltip */
.icon-box {
  position: relative;
  width: 100%;
  height: 100%;
}

/* uni原生图片组件样式 自适应容器 */
.icon-box image {
  width: 100%;
  height: 100%;
}

/* ✅ 纯原生CSS实现的tooltip提示框 替代原a-tooltip，完全无组件，居左上（完美匹配原topLeft） */
.native-tooltip {
  position: absolute;
  top: -30px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1001;
  /* 默认隐藏 */
  display: none;
  pointer-events: none;
}

/* 原生hover悬浮触发tooltip显示，纯css无任何js，性能最优 */
.icon-box:hover .native-tooltip {
  display: block;
}

/* 原样式类保留，无任何修改 */
.setting-plane{
  width: 20px;
  height: 20px;
  background-color: #0A2772;
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}
</style>