<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 原生替代 TPlaneHeader 头部组件，保留拖拽+关闭功能 -->
        <view class="setting-header" @touchstart="dragHelper.startDrag" @mousedown="dragHelper.startDrag">
            <view class="header-title">截面设置</view>
            <view class="header-close" @click="toolState.Section = false">×</view>
        </view>
        
        <view class="setting-content">
            <!-- ✅ 纯原生手写分段切换器 替代 a-segmented -->
            <view class="native-segmented">
                <view 
                    class="segmented-item" 
                    :class="{active: value === item}"
                    v-for="(item, index) in data" 
                    :key="index"
                    @click="value = item"
                >
                    {{ item }}
                </view>
            </view>

            <!-- 标准面板 -->
            <view v-show='value == "标准"' class="setting-tab-plane">
                <view class="setting-item">
                    <text>X轴</text>
                    <!-- ✅ 纯原生双区间滑块 替代 range=true的a-slider -->
                    <view class="native-slider native-slider-double" ref="sliderX">
                        <view class="slider-rail"></view>
                        <view class="slider-track" :style="{left: Standard.x[0]+'%', right: 100 - Standard.x[1]+'%'}"></view>
                        <view 
                            class="slider-handle left-handle" 
                            :style="{left: Standard.x[0]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'x', 0)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'x', 0)"
                            @touchend="handleSliderEnd(SectionValueType.StandardX)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardX)"
                        ></view>
                        <view 
                            class="slider-handle right-handle" 
                            :style="{left: Standard.x[1]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'x', 1)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'x', 1)"
                            @touchend="handleSliderEnd(SectionValueType.StandardX)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardX)"
                        ></view>
                    </view>
                </view>
                <view class="setting-item">
                    <text>Y轴</text>
                    <view class="native-slider native-slider-double">
                        <view class="slider-rail"></view>
                        <view class="slider-track" :style="{left: Standard.y[0]+'%', right: 100 - Standard.y[1]+'%'}"></view>
                        <view 
                            class="slider-handle left-handle" 
                            :style="{left: Standard.y[0]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'y', 0)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'y', 0)"
                            @touchend="handleSliderEnd(SectionValueType.StandardY)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardY)"
                        ></view>
                        <view 
                            class="slider-handle right-handle" 
                            :style="{left: Standard.y[1]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'y', 1)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'y', 1)"
                            @touchend="handleSliderEnd(SectionValueType.StandardY)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardY)"
                        ></view>
                    </view>
                </view>
                <view class="setting-item">
                    <text>Z轴</text>
                    <view class="native-slider native-slider-double">
                        <view class="slider-rail"></view>
                        <view class="slider-track" :style="{left: Standard.z[0]+'%', right: 100 - Standard.z[1]+'%'}"></view>
                        <view 
                            class="slider-handle left-handle" 
                            :style="{left: Standard.z[0]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'z', 0)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'z', 0)"
                            @touchend="handleSliderEnd(SectionValueType.StandardZ)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardZ)"
                        ></view>
                        <view 
                            class="slider-handle right-handle" 
                            :style="{left: Standard.z[1]+'%'}"
                            @touchmove="(e)=>handleDoubleSliderMove(e, 'z', 1)"
                            @mousemove="(e)=>handleDoubleSliderMove(e, 'z', 1)"
                            @touchend="handleSliderEnd(SectionValueType.StandardZ)"
                            @mouseup="handleSliderEnd(SectionValueType.StandardZ)"
                        ></view>
                    </view>
                </view>
            </view>

            <!-- 立方体面板 -->
            <view v-show='value == "立方体"' class="setting-tab-plane">
                <view class="setting-item"><text>X轴平移</text><single-slider v-model="Box.x" min="-0.5" max="0.5" step="0.01" @change="(val)=>handleSplitChange(SectionValueType.BoxX, val)"/></view>
                <view class="setting-item"><text>Y轴平移</text><single-slider v-model="Box.y" min="-0.5" max="0.5" step="0.01" @change="(val)=>handleSplitChange(SectionValueType.BoxY, val)"/></view>
                <view class="setting-item"><text>Z轴平移</text><single-slider v-model="Box.z" min="-0.5" max="0.5" step="0.01" @change="(val)=>handleSplitChange(SectionValueType.BoxZ, val)"/></view>
                <view class="setting-item"><text>X轴旋转</text><single-slider v-model="Box.xRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.BoxXRotate, val)"/></view>
                <view class="setting-item"><text>Y轴旋转</text><single-slider v-model="Box.yRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.BoxYRotate, val)"/></view>
                <view class="setting-item"><text>Z轴旋转</text><single-slider v-model="Box.zRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.BoxZRotate, val)"/></view>
                <view class="setting-item"><text>X轴缩放</text><single-slider v-model="Box.xScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.BoxXScale, val)"/></view>
                <view class="setting-item"><text>Y轴缩放</text><single-slider v-model="Box.yScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.BoxYScale, val)"/></view>
                <view class="setting-item"><text>Z轴缩放</text><single-slider v-model="Box.zScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.BoxZScale, val)"/></view>
            </view>

            <!-- 平面面板 -->
            <view v-show='value == "平面"' class="setting-tab-plane">
                <view class="setting-item"><text>X轴平移</text><single-slider v-model="Plane.x" min="-0.5" max="0.5" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneX, val)"/></view>
                <view class="setting-item"><text>Y轴平移</text><single-slider v-model="Plane.y" min="-0.5" max="0.5" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneY, val)"/></view>
                <view class="setting-item"><text>Z轴平移</text><single-slider v-model="Plane.z" min="-0.5" max="0.5" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneZ, val)"/></view>
                <view class="setting-item"><text>X轴旋转</text><single-slider v-model="Plane.xRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.PlaneXRotate, val)"/></view>
                <view class="setting-item"><text>Y轴旋转</text><single-slider v-model="Plane.yRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.PlaneYRotate, val)"/></view>
                <view class="setting-item"><text>Z轴旋转</text><single-slider v-model="Plane.zRotate" min="0" max="360" step="1" @change="(val)=>handleSplitChange(SectionValueType.PlaneZRotate, val)"/></view>
                <view class="setting-item"><text>X轴缩放</text><single-slider v-model="Plane.xScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneXScale, val)"/></view>
                <view class="setting-item"><text>Y轴缩放</text><single-slider v-model="Plane.yScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneYScale, val)"/></view>
                <view class="setting-item"><text>Z轴缩放</text><single-slider v-model="Plane.zScale" min="0.1" max="10" step="0.1" @change="(val)=>handleSplitChange(SectionValueType.PlaneZScale, val)"/></view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { reactive, ref, watch } from 'vue';
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from '@/store';

// 保留原枚举 无任何修改
enum SectionValueType {
    StandardX = 0,StandardY = 1,StandardZ = 2,
    BoxX = 3,BoxY = 4,BoxZ =5,BoxXRotate=6,BoxYRotate=7,BoxZRotate=8,BoxXScale=9,BoxYScale=10,BoxZScale=11,
    PlaneX=12,PlaneY=13,PlaneZ=14,PlaneXRotate=15,PlaneYRotate=16,PlaneZRotate=17,PlaneXScale=18,PlaneYScale=19,PlaneZScale=20,
}

const toolState = useToolPlaneStore();
const settingRoot = ref<HTMLElement | null>(null);
const dragHelper = new DragHelper(settingRoot);

// ✅ 移除多语言 替换为纯中文数组
const data = reactive(["标准", "立方体", "平面"]);
const value = ref(data[0]);

// 保留原数据结构+初始值 无任何修改
const Standard = ref({ x: [0, 100], y: [0, 100], z: [0, 100] });
const Box = ref({ x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1.0, yScale: 1.0, zScale: 1.0 });
const Plane = ref({ x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1, yScale: 1, zScale: 1 });

// ✅ 纯原生双滑块拖动事件处理 (标准页专用)
const handleDoubleSliderMove = (e: any, axis: 'x'|'y'|'z', type: 0|1) => {
    e.preventDefault();
    const slider = e.currentTarget.parentElement;
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let percent = ((clientX - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));
    const arr = Standard.value[axis];
    
    if(type === 0) arr[0] = Math.min(percent, arr[1] - 1);
    if(type === 1) arr[1] = Math.max(percent, arr[0] + 1);
    
    Standard.value[axis] = [...arr];
}

// ✅ 双滑块拖动结束触发原方法
const handleSliderEnd = (type: SectionValueType) => {
    switch(type){
        case SectionValueType.StandardX: handleSplitChange(type, Standard.value.x); break;
        case SectionValueType.StandardY: handleSplitChange(type, Standard.value.y); break;
        case SectionValueType.StandardZ: handleSplitChange(type, Standard.value.z); break;
    }
}

// 保留原监听逻辑 仅移除多语言$t语法
watch(() => toolState.Section, (newValue) => {
    if (newValue) {
        Medusa.StopClip();
        setTimeout(() => {
            switch (value.value) {
                case "标准": Medusa.StartClip("normal"); break;
                case "立方体": Medusa.StartClip("box"); break;
                case "平面": Medusa.StartClip("plane"); break;
            }
        }, 100);
        Medusa.StartClip("normal");
    } else {
        Medusa.StopClip();
    }
});

// 保留原监听逻辑 仅移除多语言$t语法
watch(value, (newValue) => {
    Medusa.StopClip();
    setTimeout(() => {
        switch (newValue) {
            case "标准": Medusa.StartClip("normal"); break;
            case "立方体": Medusa.StartClip("box"); break;
            case "平面": Medusa.StartClip("plane"); break;
        }
        Standard.value = { x: [0, 100], y: [0, 100], z: [0, 100] };
        Box.value = { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1.0, yScale: 1.0, zScale: 1.0 };
        Plane.value = { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1, yScale: 1, zScale: 1 };
    }, 100)
});

// ✅ 保留原业务核心方法 无任何修改
function handleSplitChange(type: SectionValueType, value: any) {
    switch (type) {
        case SectionValueType.StandardX:
            Medusa.PlateClip("x", "min", value[0] / 100.0);
            Medusa.PlateClip("x", "max", 1.0 - value[1] / 100.0);
            break;
        case SectionValueType.StandardY:
            Medusa.PlateClip("y", "min", value[0] / 100.0);
            Medusa.PlateClip("y", "max", 1.0 - value[1] / 100.0);
            break;
        case SectionValueType.StandardZ:
            Medusa.PlateClip("z", "min", value[0] / 100.0);
            Medusa.PlateClip("z", "max", 1.0 - value[1] / 100.0);
            break;
        case SectionValueType.BoxX: case SectionValueType.PlaneX:
            Medusa.TransformClip("move", "x", value); break;
        case SectionValueType.BoxY: case SectionValueType.PlaneY:
            Medusa.TransformClip("move", "y", value); break;
        case SectionValueType.BoxZ: case SectionValueType.PlaneZ:
            Medusa.TransformClip("move", "z", value); break;
        case SectionValueType.BoxXRotate: case SectionValueType.PlaneXRotate:
            Medusa.TransformClip("rotate", "x", value); break;
        case SectionValueType.BoxYRotate: case SectionValueType.PlaneYRotate:
            Medusa.TransformClip("rotate", "y", value); break;
        case SectionValueType.BoxZRotate: case SectionValueType.PlaneZRotate:
            Medusa.TransformClip("rotate", "z", value); break;
        case SectionValueType.BoxXScale: case SectionValueType.PlaneXScale:
            Medusa.TransformClip("scale", "x", value); break;
        case SectionValueType.BoxYScale: case SectionValueType.PlaneYScale:
            Medusa.TransformClip("scale", "y", value); break;
        case SectionValueType.BoxZScale: case SectionValueType.PlaneZScale:
            Medusa.TransformClip("scale", "z", value); break;
    }
}

// ✅ 纯原生单滑块组件(全局注册，无依赖，复用所有单滑块场景)
const singleSlider = {
    props: ['modelValue','min','max','step'],
    emits: ['update:modelValue','change'],
    setup(props, { emit }) {
        const val = ref(props.modelValue);
        const percent = ref( ((val.value - props.min)/(props.max - props.min)) * 100 );
        
        const handleMove = (e:any) => {
            e.preventDefault();
            const slider = e.currentTarget.parentElement;
            const rect = slider.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let p = ((clientX - rect.left) / rect.width) * 100;
            p = Math.max(0, Math.min(100, p));
            percent.value = p;
            
            // 按步长精准计算值
            const step = Number(props.step);
            const min = Number(props.min);
            const max = Number(props.max);
            let newValue = min + (p / 100) * (max - min);
            newValue = Math.round(newValue / step) * step;
            val.value = newValue;
            emit('update:modelValue', newValue);
        }
        
        const handleEnd = () => emit('change', val.value);
        
        return () => (
            <view class="native-slider">
                <view class="slider-rail"></view>
                <view class="slider-track" :style="{width: percent.value+'%'}"></view>
                <view class="slider-handle" :style="{left: percent.value+'%'}"
                    @touchmove={handleMove} @mousemove={handleMove}
                    @touchend={handleEnd} @mouseup={handleEnd}
                ></view>
            </view>
        )
    }
};
// 注册原生滑块组件
import { getCurrentInstance } from 'vue';
const instance = getCurrentInstance();
instance?.appContext.app.component('single-slider', singleSlider);
</script>

<style scoped>
/* 保留原样式+原生组件样式，无任何第三方样式依赖，配色完全一致 */
.setting-root {
    color: #FFF;
    width: fit-content;
    min-width: 330px;
    background-color: #324985;
    position: fixed;
    top: 30%;
    right: 300px;
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    border-radius: 2px;
}
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
.setting-content {
    background-color: #324985;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
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

/* 原生分段器样式 */
.native-segmented {
    display: flex;
    width: 100%;
    margin-top: 10px;
    border-radius: 4px;
    background-color: #283a6e;
}
.segmented-item {
    flex: 1;
    text-align: center;
    padding: 6px 0;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}
.segmented-item.active {
    background-color: #6BFF6B;
    color: #324985;
    font-weight: bold;
}

/* 原生滑块样式 (单/双通用) */
.native-slider {
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
.native-slider-double .slider-track {
    left: 0;
    right: 0;
    width: auto !important;
}
</style>