<template>
  <!-- uni原生块级容器，替代H5的div，完全等价 -->
  <view class="took-button-root">
    <!-- uni原生图片组件，替代H5的img，添加自适应模式防止变形 -->
    <image :src="resolvedImgSrc" mode="widthFix"></image>
  </view>
</template>

<script setup>
// uni-app 完全原生支持 vue3 setup 语法，这部分无需改动
import { defineProps, computed } from "vue";

// 定义属性 保持原逻辑 + 增加容错性
const props = defineProps({
  imgSrc: {
    type: String,
    required: true, // 必填属性保留
    default: ''     // 增加默认值，提升健壮性
  },
});

// ✅ 核心修改：uni-app 专用的图片路径解析（替代不兼容的 import.meta.url 写法）
// 兼容 uni 所有端（小程序、APP、H5、快应用等全平台）
const resolvedImgSrc = computed(() => {
  // uni-app 中本地图片/网络图片 统一这样解析即可，全平台兼容
  return props.imgSrc;
});
</script>

<!-- scoped 样式 uni-app 原生支持，lang="css" 可省略 -->
<style scoped>
.took-button-root {
  /* 可根据需求添加样式，比如宽高、居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>