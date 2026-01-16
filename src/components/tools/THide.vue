<template>
  <!-- 根容器 纯原生view标签，保留点击事件 -->
  <view class="took-button-root" @click="handleClick">
    <!-- 关闭图标 纯原生image标签，保留原有图片地址和适配模式 -->
    <image src="@/static/icons/icon_title_close@3x.png" mode="widthFix" class="close-icon" />
    <!-- ✅ 纯原生手写提示框 替代 uni-tooltip 组件，无任何封装，纯view+text实现 -->
    <view class="native-tooltip">隐藏</view>
  </view>
</template>

<script lang="ts" setup>
// 保留vue3组合式API，纯原生逻辑，无任何多余导入
const emit = defineEmits(["click"]);

// 原有点击事件逻辑不变，点击向外派发click事件给父组件
function handleClick() {
  emit("click");
}
</script>

<style lang="css" scoped>
/* 根容器样式 */
.took-button-root {
  position: relative; /* 给原生提示框做定位父级，必加 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 关闭图标样式，保留原尺寸，可自行微调rpx数值 */
.close-icon {
  width: 24rpx;
  height: 24rpx;
}

/* ✅ 核心：纯原生tooltip提示框样式 完全复刻原top-left的显示位置 */
.native-tooltip {
  /* 定位：左上方，和原uni-tooltip的placement="top-left"完全一致 */
  position: absolute;
  top: -30rpx;
  left: -60rpx;
  /* 提示框样式 */
  background-color: #333333;
  color: #ffffff;
  font-size: 20rpx;
  padding: 8rpx 12rpx;
  border-radius: 6rpx;
  white-space: nowrap;
  /* 默认隐藏提示框 */
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none; /* 不遮挡点击事件，必加 */
  z-index: 999;
}

/* 鼠标悬浮/手指长按 显示提示框 纯原生css触发，兼容H5 */
.took-button-root:hover .native-tooltip {
  opacity: 1;
  visibility: visible;
}

/* ✅ 补充全端兼容的点击反馈效果 替代H5的cursor:pointer */
/* 小程序/App/H5都生效，点击图标时的透明反馈，提升交互体验 */
.took-button-root:active {
  opacity: 0.8;
}
</style>