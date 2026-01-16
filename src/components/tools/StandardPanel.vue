<template>
    <view class="setting-tab-plane">
        <view class="setting-item" v-for="axis in axes" :key="axis">
            <text>{{ axisLabel[axis] }}</text>
            <DoubleSlider 
                v-model="sliderValues[axis]" 
                @change="(val) => handleChange(axis, val)"
            />
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

interface Props {
    modelValue: { x: [number, number]; y: [number, number]; z: [number, number] }
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: Props['modelValue']]
    change: [axis: string, value: [number, number]]
}>()

const axes = ['x', 'y', 'z'] as const
const axisLabel = { x: 'X轴', y: 'Y轴', z: 'Z轴' }

const sliderValues = reactive({ ...props.modelValue })

const handleChange = (axis: 'x' | 'y' | 'z', value: [number, number]) => {
    emit('update:modelValue', { ...sliderValues })
    emit('change', axis, value)
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
    Object.assign(sliderValues, newValue)
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