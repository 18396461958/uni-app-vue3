<template>
    <view class="setting-header" @touchstart="handleTouchStart" @mousedown="handleMouseStart">
        <view class="header-title">{{ title }}</view>
        <view class="header-close" @click="handleClose">×</view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
    title?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: '截面设置'
})

const emit = defineEmits<{
    close: []
    dragStart: [event: TouchEvent | MouseEvent]
}>()

const handleClose = () => {
    emit('close')
}

const handleTouchStart = (e: TouchEvent) => {
    emit('dragStart', e)
}

const handleMouseStart = (e: MouseEvent) => {
    emit('dragStart', e)
}
</script>

<style scoped>
.setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #3471cb;
    cursor: move;
}
.header-title {
    font-size: 16px;
    font-weight: 500;
}
.header-close {
    font-size: 20px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
}
</style>