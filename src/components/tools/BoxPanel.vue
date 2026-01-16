<template>
    <view class="setting-tab-plane">
        <view class="setting-item">
            <text>X轴平移</text>
            <SingleSlider 
                v-model="modelValue.x" 
                :min="-0.5" 
                :max="0.5" 
                :step="0.01" 
                @change="(val) => handleChange('x', val)"
            />
        </view>
        <view class="setting-item">
            <text>Y轴平移</text>
            <SingleSlider 
                v-model="modelValue.y" 
                :min="-0.5" 
                :max="0.5" 
                :step="0.01" 
                @change="(val) => handleChange('y', val)"
            />
        </view>
        <view class="setting-item">
            <text>Z轴平移</text>
            <SingleSlider 
                v-model="modelValue.z" 
                :min="-0.5" 
                :max="0.5" 
                :step="0.01" 
                @change="(val) => handleChange('z', val)"
            />
        </view>
        <view class="setting-item">
            <text>X轴旋转</text>
            <SingleSlider 
                v-model="modelValue.xRotate" 
                :min="0" 
								left
                :max="360" 
                :step="1" 
                @change="(val) => handleChange('xRotate', val)"
            />
        </view>
        <view class="setting-item">
            <text>Y轴旋转</text>
            <SingleSlider 
                v-model="modelValue.yRotate" 
                :min="0" 
								left
                :max="360" 
                :step="1" 
                @change="(val) => handleChange('yRotate', val)"
            />
        </view>
        <view class="setting-item">
            <text>Z轴旋转</text>
            <SingleSlider 
                v-model="modelValue.zRotate" 
                :min="0" 
                :max="360" 
								left
                :step="1" 
                @change="(val) => handleChange('zRotate', val)"
            />
        </view>
        <view class="setting-item">
            <text>X轴缩放</text>
            <SingleSlider 
                v-model="modelValue.xScale" 
                :min="0.1" 
                :max="10" 
								left
                :step="0.1" 
                @change="(val) => handleChange('xScale', val)"
            />
        </view>
        <view class="setting-item">
            <text>Y轴缩放</text>
            <SingleSlider 
                v-model="modelValue.yScale" 
                :min="0.1" 
                :max="10" 
								left
                :step="0.1" 
                @change="(val) => handleChange('yScale', val)"
            />
        </view>
        <view class="setting-item">
            <text>Z轴缩放</text>
            <SingleSlider 
						left
                v-model="modelValue.zScale" 
                :min="0.1" 
                :max="10" 
                :step="0.1" 
                @change="(val) => handleChange('zScale', val)"
            />
        </view>
    </view>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import SingleSlider from "./SingleSlider.vue"

// 定义Props接口
interface BoxData {
    x: number
    y: number
    z: number
    xRotate: number
    yRotate: number
    zRotate: number
    xScale: number
    yScale: number
    zScale: number
}

interface Props {
    modelValue: BoxData
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: BoxData]
    change: [type: string, value: number]
}>()

// 处理滑块变化
const handleChange = (type: string, value: number) => {
    // 更新本地数据
    const newData = { ...props.modelValue, [type]: value }
    emit('update:modelValue', newData)
    emit('change', type, value)
}

// 监听外部数据变化，确保内部数据同步
watch(() => props.modelValue, (newValue) => {
    // 这里可以添加数据同步逻辑，如果需要的话
}, { deep: true })
</script>

<style scoped>
.setting-tab-plane {
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: #324985;
}
.setting-item {
    font-size: 14px;
    padding: 5px 10px 8px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.setting-item text {
    display: block;
    width: 100%;
}
</style>