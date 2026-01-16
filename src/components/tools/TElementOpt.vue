<template>
  <!-- 根容器 原生view 原点击逻辑完全不变 -->
  <view class="took-button-root" @click="()=>{toolState.ElementOpt = !toolState.ElementOpt; }">
    <!-- 包裹层：图片 + 纯原生手写的悬浮提示层 -->
    <view class="tooltip-wrap">
      <!-- 原生image组件 路径/模式不变 纯原生 -->
      <image src="@/static/icons/icon_title_attribute@3x.png" mode="widthFix"></image>
      <!-- 纯原生实现的悬浮提示文本 替代uni-tooltip 位置top-left 中文固定文本 -->
      <view class="native-tooltip">元素操作</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 业务核心逻辑完全不变 无任何多余依赖
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();
</script>

<style lang="scss" scoped>
/* 根容器样式 保持点击区域可点击 */
.took-button-root {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* 包裹层 核心：实现鼠标悬浮触发提示，相对定位承载提示层 */
.tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* 原生图片默认样式 可选 */
  image {
    width: auto;
    height: 24px;
    display: block;
  }

  /* 纯原生悬浮提示层 核心替代uni-tooltip的样式 精准实现top-left左上位置 */
  .native-tooltip {
    /* 固定文本 不可选中 */
    user-select: none;
    pointer-events: none;
    /* 核心定位：左上悬浮 top-left 完美匹配原uni-tooltip的placement值 */
    position: absolute;
    top: -30px;
    left: 0;
    /* 提示层样式 贴合原生tooltip风格 */
    background-color: #333;
    color: #fff;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    /* 默认隐藏 */
    opacity: 0;
    visibility: hidden;
    /* 原生过渡动画 悬浮显示更顺滑 */
    transition: all 0.2s ease-in-out;
    z-index: 999;
  }

  /* 鼠标悬浮时 显示提示层 纯原生hover触发 */
  &:hover .native-tooltip {
    opacity: 1;
    visibility: visible;
  }
}
</style>