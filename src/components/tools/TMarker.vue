<template>
    <!-- div 替换为 uni-app 原生view组件 -->
    <view class="took-button-root" @click="toolState.Marker = !toolState.Marker">
        <!-- 第三方a-tooltip 替换为 uni-app原生悬浮提示组件 uni-tooltip -->
        <!-- 移除多语言$t，直接写死中文文案，原topLeft对应uni的top-left -->
        <uni-tooltip placement="top-left" title="标记文件">
            <!-- img标签保留，uni-app中img/uni-image都支持，此处保留原路径不变 -->
            <img src="@/static/icons/icon_title_file@3x.png" alt="标记文件">
        </uni-tooltip>
    </view>
</template>

<script lang="ts" setup>
// 保留原有的仓库引入，业务逻辑不变
import { useToolPlaneStore } from "@/store";
// ✅ 彻底删除：多语言useI18n的引入+解构代码
// import { useI18n } from "vue-i18n";
// const { t: $t } = useI18n();

const toolState = useToolPlaneStore();
</script>

<style lang="css" scoped>
/* ✅ 优化：去掉无效的:deep()深度选择器（当前类就是本组件的，不需要穿透） */
.took-button-root {
    cursor: pointer; /* 鼠标悬停时显示手型 - H5端有效 */
}
</style>