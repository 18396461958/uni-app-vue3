<template>
  <!-- 原生view替代div，uni核心原生块元素，无任何封装 -->
  <view class="took-button-root" @click="toolState.Section = !toolState.Section">
    <!-- 原生图片容器，做hover悬浮定位基准 -->
    <view class="tooltip-wrap">
      <!-- 原生image替代img，uni原生图片标签，无任何封装 -->
      <image src="@/static/icons/selection.png" mode="widthFix" alt="选区工具"></image>
      <!-- 纯原生手写悬浮提示层 替代 a-tooltip，topLeft 原位置，中文文案替换多语言 -->
      <view class="native-tooltip top-left">选区工具</view>
    </view>
  </view>
</template>

<script>
// 纯原生js写法 去掉ts和setup语法糖，无任何ts依赖，uni原生标准写法
import { useToolPlaneStore } from "@/store";
// 获取原有的工具状态仓库，保留原业务逻辑不变
const toolState = useToolPlaneStore();

export default {
  data() {
    return {
      toolState // 挂载仓库状态，保留原逻辑
    }
  }
}
</script>

<style scoped>
/* 原容器样式保留，可根据你的需求调整宽高 */
.took-button-root {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  box-sizing: border-box;
}
/* 图片容器 - 核心：做悬浮提示的相对定位基准，保证提示层位置准确 */
.tooltip-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 原生图片样式，防止拉伸变形，可根据你的图标尺寸调整宽高 */
.tooltip-wrap image {
  width: 24px;
  height: 24px;
}
/* 纯原生悬浮提示层 核心样式 - 完全替代 a-tooltip 第三方组件 */
.native-tooltip {
  /* 初始隐藏 */
  display: none;
  /* 绝对定位 不影响原有布局 */
  position: absolute;
  /* 提示层样式优化，和原a-tooltip视觉一致 */
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 999;
  pointer-events: none;
  box-sizing: border-box;
}
/* 核心定位：topLeft 顶部左侧 严格还原原a-tooltip的placement="topLeft"位置 */
.native-tooltip.top-left {
  bottom: calc(100% + 6px);
  right: 0;
  transform: translateX(0);
}
/* 原生hover触发显示 - 纯css原生实现，无任何js逻辑，性能最优 */
.tooltip-wrap:hover .native-tooltip {
  display: block;
}
</style>