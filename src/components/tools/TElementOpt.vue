<template>
  <!-- div 替换为 uni-app 原生view组件，点击事件逻辑完全不变 -->
  <view class="took-button-root" @click="()=>{toolState.ElementOpt = !toolState.ElementOpt; }">
    <!-- a-tooltip 替换为 uni-app 原生提示组件uni-tooltip -->
    <!-- 移除多语言$t，直接写中文提示文本，placement原生值为top-left -->
    <uni-tooltip placement="top-left" title="元素操作">
      <!-- img 替换为 uni-app 原生图片组件image，路径不变，原生适配 -->
      <image src="@/static/icons/icon_title_attribute@3x.png" mode="widthFix"></image>
    </uni-tooltip>
  </view>
</template>

<script lang="ts" setup>
// 只保留业务核心依赖，完全移除 vue-i18n 所有相关代码和引用
import { useToolPlaneStore } from "@/store";
const toolState = useToolPlaneStore();
</script>