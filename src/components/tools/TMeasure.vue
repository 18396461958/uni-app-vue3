<template>
  <!-- div 替换为 uni-app 原生块级标签 view -->
  <view class="took-button-root" @click="toolState.Measure = !toolState.Measure">
    <!-- 纯原生实现悬浮提示：替代第三方a-tooltip，无任何组件依赖 -->
    <view class="tooltip-box">
      <!-- img 替换为 uni-app 原生图片标签 image -->
      <image src="@/static/icons/icon_title_measure@3x.png" style="height: 35px;width: 35px;"></image>
      <!-- 原生悬浮提示文字 - 直接写死中文 测量 -->
      <view class="tooltip-text">测量</view>
    </view>
  </view>
</template>

<script>
// 移除ts语法、移除vue-i18n多语言所有相关代码
import { useToolPlaneStore } from "@/store";

export default {
  setup() {
    const toolState = useToolPlaneStore();
    return {
      toolState
    }
  }
}
</script>

<style scoped>
/* 根容器样式 - 保留原类名 */
.took-button-root {
  cursor: pointer;
  display: inline-block;
}
/* 悬浮提示外层容器 - 核心：相对定位，用于内部提示文字绝对定位 */
.tooltip-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 原生悬浮提示核心：默认隐藏，鼠标悬浮显示 */
.tooltip-text {
  /* 提示文字默认隐藏 */
  display: none;
  /* 绝对定位 - 对应原a-tooltip的placement="topLeft" 左上悬浮效果 */
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 99;
  /* 提示文字原生样式优化 */
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
}
/* 原生hover悬浮触发 - 鼠标移入显示提示文字，纯css原生实现无js */
.tooltip-box:hover .tooltip-text {
  display: block;
}
</style>