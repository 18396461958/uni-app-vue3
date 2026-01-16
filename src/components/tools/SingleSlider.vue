<template>
    <view class="native-slider native-slider-double" ref="sliderElement">
        <view class="slider-rail"></view>
        <view class="slider-track" :style="trackStyle"></view>
        <view 
        v-if="left"
            class="slider-handle left-handle" 
            :style="{left: leftPosition+'%'}"
            @touchstart="startDrag('left')"
            @mousedown="startDrag('left')"
        ></view>
        <view 
        v-else
            class="slider-handle right-handle" 
            :style="{left: rightPosition+'%'}"
            @touchstart="startDrag('right')"
            @mousedown="startDrag('right')"
        ></view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'

interface Props {
    modelValue: [number, number]
    min?: number
    max?: number
    left?:boolean,
    step?: number
}

const props = withDefaults(defineProps<Props>(), {
    min: 0,
    left:false,
    max: 100,
    step: 1
})

const emit = defineEmits<{
    'update:modelValue': [value: [number, number]]
    change: [value: [number, number]]
}>()

// 修复1: 明确指定ref类型为HTMLElement或null
const sliderElement = ref<HTMLElement | null>(null)
const leftPosition = ref(props.modelValue[0])
const rightPosition = ref(props.modelValue[1])
const activeHandle = ref<'left' | 'right' | null>(null)

const trackStyle = computed(() => ({
    left: leftPosition.value + '%',
    right: (100 - rightPosition.value) + '%'
}))

const startDrag = (handle: 'left' | 'right') => {
    // 修复2: 添加元素存在性检查
    if (!sliderElement.value) {
        console.warn('Slider element not found')
        return
    }
    
    activeHandle.value = handle
    document.addEventListener('touchmove', handleDrag)
    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('touchend', stopDrag)
    document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e: TouchEvent | MouseEvent) => {
    // 修复3: 添加详细的元素检查[1,3](@ref)
    if (!activeHandle.value || !sliderElement.value) return
    

    try {
        const rect = sliderElement.value.$el.getBoundingClientRect()
        const clientX = e instanceof TouchEvent ? e.touches[0].clientX : e.clientX
        let percent = ((clientX - rect.left) / rect.width) * 100
        percent = Math.max(0, Math.min(100, percent))
        
        if (activeHandle.value === 'left') {
            leftPosition.value = Math.min(percent, rightPosition.value - 1)
        } else {
            rightPosition.value = Math.max(percent, leftPosition.value + 1)
        }
        
        const newValue: [number, number] = [leftPosition.value, rightPosition.value]
        emit('update:modelValue', newValue)
    } catch (error) {
        console.error('Error in handleDrag:', error)
    }
}

const stopDrag = () => {
    activeHandle.value = null
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('touchend', stopDrag)
    document.removeEventListener('mouseup', stopDrag)
    
    // 只在有有效值时触发change事件
    if (leftPosition.value !== undefined && rightPosition.value !== undefined) {
        emit('change', [leftPosition.value, rightPosition.value])
    }
}

// 修复4: 使用watch监听外部值变化，添加防护
import { watch } from 'vue'
watch(() => props.modelValue, (newValue) => {
    if (newValue && Array.isArray(newValue) && newValue.length === 2) {
        leftPosition.value = newValue[0]
        rightPosition.value = newValue[1]
    }
}, { immediate: true })


onUnmounted(() => {
    stopDrag()
})
</script>

<style scoped>
.native-slider-double {
    width: 100%;
    height: 6px;
    background: transparent;
    position: relative;
    cursor: pointer;
}
.slider-rail {
    position: absolute;
    width: 100%;
    height: 6px;
    background-color: #F0F0F0;
    border-radius: 3px;
}
.slider-track {
    position: absolute;
    height: 6px;
    background-color: #6BFF6B !important;
    border-radius: 3px;
}
.slider-handle {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #6BFF6B;
    background-color: #fff;
    z-index: 2;
}
</style>