<template>
    <div class="setting-root" ref="settingRoot">
        <!-- 原生实现头部替代 TPlaneHeader 组件 带拖拽+关闭按钮+标题 -->
        <div class="setting-header" @mousedown="dragHelper.startDrag">
            <span class="header-title">截面设置</span>
            <button class="close-btn" @click="toolState.Section = false">×</button>
        </div>
        
        <div class="setting-content">
            <!-- 原生实现分段选项卡 替代 a-segmented 组件 -->
            <div class="native-segmented">
                <div 
                    class="segmented-item" 
                    :class="{active: value === item}"
                    @click="value = item"
                    v-for="item in data" :key="item"
                >{{item}}</div>
            </div>
            
            <!-- 标准截面面板 -->
            <div v-show='value == "标准截面"' class="setting-tab-plane">
                <div class="setting-item">
                    <span>X轴区间</span>
                    <!-- 原生实现 双区间滑块 替代 a-slider range -->
                    <div class="native-slider native-slider-range">
                        <input 
                            type="range" 
                            class="slider-min"
                            :min="0" :max="100" :step="1"
                            :value="Standard.x[0]"
                            @input="e => Standard.x[0] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardX, [Number(e.target.value), Standard.x[1]])"
                        >
                        <input 
                            type="range" 
                            class="slider-max"
                            :min="0" :max="100" :step="1"
                            :value="Standard.x[1]"
                            @input="e => Standard.x[1] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardX, [Standard.x[0], Number(e.target.value)])"
                        >
                        <div class="slider-value">{{Standard.x[0]}} - {{Standard.x[1]}}</div>
                    </div>
                </div>
                <div class="setting-item">
                    <span>Y轴区间</span>
                    <div class="native-slider native-slider-range">
                        <input type="range" class="slider-min" :min="0" :max="100" :step="1" :value="Standard.x[0]"
                            @input="e => Standard.y[0] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardY, [Number(e.target.value), Standard.y[1]])">
                        <input type="range" class="slider-max" :min="0" :max="100" :step="1" :value="Standard.y[1]"
                            @input="e => Standard.y[1] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardY, [Standard.y[0], Number(e.target.value)])">
                        <div class="slider-value">{{Standard.y[0]}} - {{Standard.y[1]}}</div>
                    </div>
                </div>
                <div class="setting-item">
                    <span>Z轴区间</span>
                    <div class="native-slider native-slider-range">
                        <input type="range" class="slider-min" :min="0" :max="100" :step="1" :value="Standard.z[0]"
                            @input="e => Standard.z[0] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardZ, [Number(e.target.value), Standard.z[1]])">
                        <input type="range" class="slider-max" :min="0" :max="100" :step="1" :value="Standard.z[1]"
                            @input="e => Standard.z[1] = Number(e.target.value)"
                            @change="e => handleSplitChange(SectionValueType.StandardZ, [Standard.z[0], Number(e.target.value)])">
                        <div class="slider-value">{{Standard.z[0]}} - {{Standard.z[1]}}</div>
                    </div>
                </div>
            </div>

            <!-- 盒子截面面板 -->
            <div v-show='value == "盒子截面"' class="setting-tab-plane">
                <div class="setting-item"><span>X轴移动</span><native-slider v-model="Box.x" min="-0.5" max="0.5" step="0.01" @change="val=>handleSplitChange(SectionValueType.BoxX, val)"/></div>
                <div class="setting-item"><span>Y轴移动</span><native-slider v-model="Box.y" min="-0.5" max="0.5" step="0.01" @change="val=>handleSplitChange(SectionValueType.BoxY, val)"/></div>
                <div class="setting-item"><span>Z轴移动</span><native-slider v-model="Box.z" min="-0.5" max="0.5" step="0.01" @change="val=>handleSplitChange(SectionValueType.BoxZ, val)"/></div>
                <div class="setting-item"><span>X轴旋转</span><native-slider v-model="Box.xRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.BoxXRotate, val)"/></div>
                <div class="setting-item"><span>Y轴旋转</span><native-slider v-model="Box.yRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.BoxYRotate, val)"/></div>
                <div class="setting-item"><span>Z轴旋转</span><native-slider v-model="Box.zRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.BoxZRotate, val)"/></div>
                <div class="setting-item"><span>X轴缩放</span><native-slider v-model="Box.xScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.BoxXScale, val)"/></div>
                <div class="setting-item"><span>Y轴缩放</span><native-slider v-model="Box.yScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.BoxYScale, val)"/></div>
                <div class="setting-item"><span>Z轴缩放</span><native-slider v-model="Box.zScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.BoxZScale, val)"/></div>
            </div>

            <!-- 平面截面面板 -->
            <div v-show='value == "平面截面"' class="setting-tab-plane">
                <div class="setting-item"><span>X轴移动</span><native-slider v-model="Plane.x" min="-0.5" max="0.5" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneX, val)"/></div>
                <div class="setting-item"><span>Y轴移动</span><native-slider v-model="Plane.y" min="-0.5" max="0.5" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneY, val)"/></div>
                <div class="setting-item"><span>Z轴移动</span><native-slider v-model="Plane.z" min="-0.5" max="0.5" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneZ, val)"/></div>
                <div class="setting-item"><span>X轴旋转</span><native-slider v-model="Plane.xRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.PlaneXRotate, val)"/></div>
                <div class="setting-item"><span>Y轴旋转</span><native-slider v-model="Plane.yRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.PlaneYRotate, val)"/></div>
                <div class="setting-item"><span>Z轴旋转</span><native-slider v-model="Plane.zRotate" min="0" max="360" step="1" @change="val=>handleSplitChange(SectionValueType.PlaneZRotate, val)"/></div>
                <div class="setting-item"><span>X轴缩放</span><native-slider v-model="Plane.xScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneXScale, val)"/></div>
                <div class="setting-item"><span>Y轴缩放</span><native-slider v-model="Plane.yScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneYScale, val)"/></div>
                <div class="setting-item"><span>Z轴缩放</span><native-slider v-model="Plane.zScale" min="0.1" max="10" step="0.1" @change="val=>handleSplitChange(SectionValueType.PlaneZScale, val)"/></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { reactive, ref, watch } from 'vue';
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from '@/store';

// 保留原枚举 完全不变
enum SectionValueType {
    StandardX = 0,
    StandardY = 1,
    StandardZ = 2,
    BoxX = 3,
    BoxY = 4,
    BoxZ = 5,
    BoxXRotate = 6,
    BoxYRotate = 7,
    BoxZRotate = 8,
    BoxXScale = 9,
    BoxYScale = 10,
    BoxZScale = 11,
    PlaneX = 12,
    PlaneY = 13,
    PlaneZ = 14,
    PlaneXRotate = 15,
    PlaneYRotate = 16,
    PlaneZRotate = 17,
    PlaneXScale = 18,
    PlaneYScale = 19,
    PlaneZScale = 20,
}

const toolState = useToolPlaneStore();
const settingRoot = ref<HTMLElement | null>(null);
const dragHelper = new DragHelper(settingRoot);

// ✅ 移除多语言 直接中文数组 替代原$t的国际化数据
const data = reactive(["标准截面", "盒子截面", "平面截面"]);
const value = ref(data[0]);

// 保留原数据结构 完全不变
const Standard = ref({ x: [0, 100], y: [0, 100], z: [0, 100] });
const Box = ref({ x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1.0, yScale: 1.0, zScale: 1.0 });
const Plane = ref({ x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1, yScale: 1, zScale: 1 });

// ✅ 纯原生滑块组件 - 全局注册 无任何依赖 替代a-slider
const nativeSlider = {
    props: ['modelValue', 'min', 'max', 'step'],
    emits: ['update:modelValue', 'change'],
    template: `
        <div class="native-slider">
            <input 
                type="range" 
                :min="min" 
                :max="max" 
                :step="step"
                :value="modelValue"
                @input="e => $emit('update:modelValue', Number(e.target.value))"
                @change="e => $emit('change', Number(e.target.value))"
            >
            <span class="slider-num">{{modelValue}}</span>
        </div>
    `
};
// 注册原生滑块组件
import { getCurrentInstance } from 'vue';
const instance = getCurrentInstance();
instance?.appContext.app.component('native-slider', nativeSlider);

// ✅ 保留原监听逻辑 100%不变 仅移除$t相关判断
watch(() => toolState.Section, (newValue) => {
    if (newValue) {
        Medusa.StopClip();
        setTimeout(() => {
            switch (value.value) {
                case "标准截面":
                    Medusa.StartClip("normal");
                    break;
                case "盒子截面":
                    Medusa.StartClip("box");
                    break;
                case "平面截面":
                    Medusa.StartClip("plane");
                    break;
            }
        }, 100);
        Medusa.StartClip("normal");

    } else {
        switch (value.value) {
            case "标准截面":
                handleSplitChange(SectionValueType.StandardX, [0,100])
                handleSplitChange(SectionValueType.StandardY, [0,100])
                handleSplitChange(SectionValueType.StandardZ, [0,100])
                break;
            case "盒子截面":
                handleSplitChange(SectionValueType.BoxX, 0)
                handleSplitChange(SectionValueType.BoxY, 0)
                handleSplitChange(SectionValueType.BoxZ, 0)
                handleSplitChange(SectionValueType.BoxXRotate, 0)
                handleSplitChange(SectionValueType.BoxYRotate, 0)
                handleSplitChange(SectionValueType.BoxZRotate, 0)
                handleSplitChange(SectionValueType.BoxXScale, 1.0)
                handleSplitChange(SectionValueType.BoxYScale, 1.0)
                handleSplitChange(SectionValueType.BoxZScale, 1.0)
                break;
            case "平面截面":
                // ✅ 修复原代码BUG：原代码此处调用了Box的枚举 已修正为Plane枚举
                handleSplitChange(SectionValueType.PlaneX, 0)
                handleSplitChange(SectionValueType.PlaneY, 0)
                handleSplitChange(SectionValueType.PlaneZ, -0.5)
                handleSplitChange(SectionValueType.PlaneXRotate, 0)
                handleSplitChange(SectionValueType.PlaneYRotate, 0)
                handleSplitChange(SectionValueType.PlaneZRotate, 0)
                handleSplitChange(SectionValueType.PlaneXScale, 1.0)
                handleSplitChange(SectionValueType.PlaneYScale, 1.0)
                handleSplitChange(SectionValueType.PlaneZScale, 1.0)
                break;
        }
        setTimeout(() => {
            Medusa.StopClip();
        }, 100);
    }

    if (newValue) {
        settingRoot.value!.style.zIndex=toolState.DivIndex+++"";
    }
});

// ✅ 保留原监听逻辑 100%不变 仅移除$t相关判断
watch(value, (newValue) => {
    Medusa.StopClip();
    setTimeout(() => {
        switch (newValue) {
            case "标准截面":
                Medusa.StartClip("normal");
                break;
            case "盒子截面":
                Medusa.StartClip("box");
                break;
            case "平面截面":
                Medusa.StartClip("plane");
                break;
        }
        Standard.value = { x: [0, 100], y: [0, 100], z: [0, 100] };
        Box.value = { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1.0, yScale: 1.0, zScale: 1.0 };
        Plane.value = { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1, yScale: 1, zScale: 1 };
    }, 100)
});

// ✅ 保留原核心业务方法 完全不变
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
        case SectionValueType.BoxX:
            Medusa.TransformClip("move", "x", value);
            break;
        case SectionValueType.BoxY:
            Medusa.TransformClip("move", "y", value);
            break;
        case SectionValueType.BoxZ:
            Medusa.TransformClip("move", "z", value);
            break;
        case SectionValueType.BoxXRotate:
            Medusa.TransformClip("rotate", "x", value);
            break;
        case SectionValueType.BoxYRotate:
            Medusa.TransformClip("rotate", "y", value);
            break;
        case SectionValueType.BoxZRotate:
            Medusa.TransformClip("rotate", "z", value);
            break;
        case SectionValueType.BoxXScale:
            Medusa.TransformClip("scale", "x", value);
            break;
        case SectionValueType.BoxYScale:
            Medusa.TransformClip("scale", "y", value);
            break;
        case SectionValueType.BoxZScale:
            Medusa.TransformClip("scale", "z", value);
            break;
        case SectionValueType.PlaneX:
            Medusa.TransformClip("move", "x", value);
            break;
        case SectionValueType.PlaneY:
            Medusa.TransformClip("move", "y", value);
            break;
        case SectionValueType.PlaneZ:
            Medusa.TransformClip("move", "z", value);
            break;
        case SectionValueType.PlaneXRotate:
            Medusa.TransformClip("rotate", "x", value);
            break;
        case SectionValueType.PlaneYRotate:
            Medusa.TransformClip("rotate", "y", value);
            break;
        case SectionValueType.PlaneZRotate:
            Medusa.TransformClip("rotate", "z", value);
            break;
        case SectionValueType.PlaneXScale:
            Medusa.TransformClip("scale", "x", value);
            break;
        case SectionValueType.PlaneYScale:
            Medusa.TransformClip("scale", "y", value);
            break;
        case SectionValueType.PlaneZScale:
            Medusa.TransformClip("scale", "z", value);
            break;
    }
}
</script>

<style scoped>
/* 保留原样式+纯原生滑块/分段器样式 无任何第三方样式类 */
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

/* 原生头部样式 替代TPlaneHeader */
.setting-header {
    width: 100%;
    height: 36px;
    line-height: 36px;
    background-color: #283b70;
    padding: 0 10px;
    box-sizing: border-box;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3471cb;
}
.header-title {
    font-size: 16px;
    font-weight: 500;
}
.close-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    line-height: 30px;
    padding: 0;
    margin: 0;
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
    padding-top: 8px;
	padding-bottom: 8px;
    padding-left: 10px;
    padding-right: 10px;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.setting-item span {
    width: 80px;
    display: inline-block;
}

/* 原生分段器样式 替代a-segmented */
.native-segmented {
    width: 100%;
    display: flex;
    background-color: #283b70;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
}
.segmented-item {
    flex: 1;
    text-align: center;
    height: 34px;
    line-height: 34px;
    cursor: pointer;
    font-size: 14px;
}
.segmented-item.active {
    background-color: #3471cb;
    color: #fff;
}

/* 纯原生滑块样式 替代a-slider 完美还原原样式配色 */
.native-slider {
    width: calc(100% - 90px);
    display: flex;
    align-items: center;
    gap: 8px;
}
.native-slider input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    background: #F0F0F0;
    border-radius: 3px;
    outline: none;
}
.native-slider input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6BFF6B;
    border: 2px solid #6BFF6B;
    cursor: pointer;
}
.native-slider input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    background: #F0F0F0;
}
.native-slider input[type="range"]:active::-webkit-slider-thumb {
    background: #5ad85a;
    border-color: #5ad85a;
}
.slider-num {
    width: 50px;
    text-align: right;
    font-size: 12px;
    color: #fff;
}

/* 双区间滑块样式 */
.native-slider-range {
    width: calc(100% - 90px);
    position: relative;
    height: 30px;
    display: flex;
    align-items: center;
}
.native-slider-range .slider-min, .native-slider-range .slider-max {
    position: absolute;
    width: 100%;
}
.slider-value {
    position: absolute;
    right: 0;
    font-size: 12px;
    color: #fff;
}
</style>