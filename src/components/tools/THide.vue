<template>
    <!-- div 替换为 uni-app 原生view组件 -->
    <view class="took-button-root" @click="handleClick">
        <!-- a-tooltip 替换为 uni-app 原生提示组件 uni-tooltip -->
        <!-- 移除多语言，直接写中文提示文本，placement驼峰改短横线（uni规范） -->
        <uni-tooltip placement="top-left" title="隐藏">
            <!-- img 替换为 uni-app 原生图片组件 image -->
            <image src="@/static/icons/icon_title_close@3x.png" mode="widthFix"></image>
        </uni-tooltip>
    </view>
</template>

<script lang="ts" setup>
// 保留vue3的组合式API，uni-app完美兼容

// 1. 彻底移除 useI18n 所有相关导入和变量定义
// 2. 保留原有的点击事件派发逻辑不变
const emit = defineEmits(["click"]);

// 处理点击事件，抛出click事件给父组件
function handleClick() {
    emit("click");
}
</script>

<style lang="css" scoped>
.took-button-root {
    /* 核心修改：移除 cursor: pointer; 
       原因：该属性是H5专属，小程序/APP端完全无效，uni-app中不要写 */
}
/* 给图片加基础样式，适配图标正常显示，可根据你的图标尺寸微调 */
.took-button-root image {
    width: 24rpx;
    height: 24rpx;
}
/* 补充uni-app跨端的点击反馈效果，替代原cursor手型，提升交互体验 */
.took-button-root:active {
    opacity: 0.8;
}
</style>