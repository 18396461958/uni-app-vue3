<template>
    <!-- 原div替换为uni-app原生view组件 -->
    <view class="took-button-root" @click="handleClick">
        <!-- 原antd的a-tooltip替换为uni-app原生tooltip组件 -->
        <!-- 移除多语言$t('tool.home')，直接替换为中文“首页” -->
        <uni-tooltip placement="top-left" title="重置视角">
            <!-- 图片标签保留，uni-app完全兼容，路径不变 -->
            <img src="@/static/img/home36x36.png" alt="">
        </uni-tooltip>
    </view>
</template>

<script setup>
// 1. 移除 lang="ts" ts语法（uni-app原生组件推荐纯js）
// 2. 清理所有冗余导入：getCurrentInstance、ref、onBeforeMount、onMounted 均未使用
// 3. 仅保留实际用到的核心方法，代码极简无冗余


// 定义点击事件派发，逻辑和原代码一致，完全保留
const emit = defineEmits(["click"]);

// 点击事件处理函数，逻辑不变
function handleClick() {
    emit("click"); // 向父组件抛出 click 事件
}
</script>

<style lang="css" scoped>

</style>