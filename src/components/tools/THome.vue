<template>
    <!-- 纯原生view标签 替代原div，无任何uni-组件，保留原类名+点击事件 -->
    <view class="took-button-root" @click="handleClick">
        <!-- 核心：删除uni-tooltip，用纯原生view手写悬浮提示框（左上定位，原提示文字：重置视角） -->
        <view class="tooltip-box">重置视角</view>
        <!-- 纯原生image标签 替代img标签（uni-app原生推荐，多端兼容性远高于img，纯原生无封装） -->
        <image class="home-icon" src="@/static/img/home36x36.png" mode="widthFix" alt="重置视角"></image>
    </view>
</template>

<script setup>
// 纯原生js、无TS、无任何冗余导入、无多余逻辑，只保留核心点击派发功能
// 完全保留原逻辑：点击向父组件抛出 click 事件
const emit = defineEmits(["click"]);

function handleClick() {
    emit("click");
}
</script>

<style lang="css" scoped>
/* 外层容器样式 - 核心：开启相对定位，让内部悬浮提示框基于当前按钮定位 */
.took-button-root {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    box-sizing: border-box;
}

/* 图标样式 - 原尺寸36x36，和你图片尺寸一致，纯原生样式 */
.home-icon {
    width: 36px;
    height: 36px;
}

/* 纯原生手写 悬浮提示框 核心样式（原uni-tooltip的top-left左上定位效果） */
.tooltip-box {
    /* 左上定位：完全还原原uni-tooltip的placement="top-left"效果 */
    position: absolute;
    top: -32px;
    left: 0;
    /* 提示框样式美化，和原tooltip视觉一致 */
    padding: 4px 8px;
    background-color: #333333;
    color: #ffffff;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    /* 默认隐藏提示框 */
    opacity: 0;
    visibility: hidden;
    /* 过渡动画，悬浮显示更顺滑 */
    transition: all 0.2s ease;
    z-index: 99;
}

/* 核心悬浮触发：鼠标/手指悬浮按钮时，显示原生提示框 */
.took-button-root:hover .tooltip-box {
    opacity: 1;
    visibility: visible;
}
</style>