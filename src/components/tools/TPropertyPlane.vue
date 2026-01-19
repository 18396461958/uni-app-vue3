<template>
    <div class="setting-root" ref="settingRoot">
        <!-- 原生头部替代 TPlaneHeader 组件，保留拖拽+关闭+标题，纯原生实现 -->
        <div class="setting-header" @mousedown="startDrag">
            <span class="header-title">属性</span>
            <span class="header-close" @click.stop="OnClose">×</span>
        </div>
        <!-- 原有内容区不变 -->
        <div class="setting-content">
            <!-- 纯原生实现折叠面板，替代 a-collapse/a-collapse-panel 无任何第三方组件 -->
            <div class="setting-group" v-for="(property, index) in Properties" :key="index">
                <!-- 折叠面板头部 - 原生点击展开收起 -->
                <div class="collapse-header" @click="toggleCollapse(index)">
                    {{ property.name }}
                    <span class="collapse-icon">{{ activeKey.includes(index) ? '▼' : '▶' }}</span>
                </div>
                <!-- 折叠面板内容 - 根据activeKey控制显示隐藏 -->
                <div class="collapse-content" v-show="activeKey.includes(index)">
                    <div v-for="(item, itemIndex) in property.children" :key="itemIndex" class="setting-item">
                        <span :title="item.name" class="line-limit-length">{{ item.name }}</span>
                        <span :title="item.value.toString()" class="line-limit-length">{{ item.value}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { ref, watch } from 'vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { AppEvent } from '@/api/engine/AppEvent';

// ========== 类型定义 保留原有TS语法 ==========
interface Property {
    name: string;
    value: string | number | boolean;
}
interface PropertyGroup {
    name: string;
    children: Property[];
}

// ========== 响应式数据 保留原有逻辑 ==========
const activeKey = ref<number[]>([]);
const Properties = ref<PropertyGroup[]>([]);
const settingRoot = ref<HTMLElement | null>(null);

// ========== 拖拽实例 保留原有拖拽逻辑 ==========
const dragHelper = new DragHelper(settingRoot);
// 封装拖拽触发方法 供模板原生调用
const startDrag = () => {
    dragHelper.startDrag();
};

// ========== 原生折叠面板 展开/收起切换方法 ==========
const toggleCollapse = (index: number) => {
    const keyIndex = activeKey.value.indexOf(index);
    if (keyIndex > -1) {
        activeKey.value.splice(keyIndex, 1);
    } else {
        activeKey.value.push(index);
    }
};

// ========== 原有事件监听逻辑 完全保留 ==========
AppEvent.addEventListener('OnTreeSelected', (event) => {
    initProperty(event.ModelId, event.ElementId);
});

AppEvent.addEventListener("OnElementSelected", (event) => {
    initProperty(event.ModelId, event.ElementId);
});

// ========== 原有Store相关 完全保留 ==========
const ToolStore = useToolPlaneStore();
function OnClose() {
    ToolStore.Property = false;
}

// ========== 原有监听逻辑 完全保留 ==========
watch(() => ToolStore.Property, (newVal) => {
    if (newVal && settingRoot.value) {
        settingRoot.value.style.zIndex = ToolStore.DivIndex++ + "";
    }
})
   
// ========== 原有接口请求逻辑 完全保留 ==========
function initProperty(modelId: string, elementId: string) {
    postAction("/ModelStruct/GetProperty", { modelId: modelId, componentId: elementId }).then((res: any) => {
        const ps: { [key: string]: Property[] } = {};
        res.Data.forEach((item: any) => {
            if (!ps[item.groupName]) {
                ps[item.groupName] = [];
            }
            let val = item.value;
            if(val === null || val === undefined){
                val = "";
            }
            if(typeof val === "string"){
                val = val.replace("nwd", "");
            }
            ps[item.groupName].push({
                name: item.propertyname,
                value: val,
            });
        });
        Properties.value = Object.keys(ps).map((key) => ({
            name: (key == null || key == "" || key == "null") ? "基本属性" : key,
            children: ps[key],
        }));
        // 默认展开第一个面板 保留原有逻辑
        activeKey.value = [0];
    })
}
</script>

<style scoped>
.setting-root {
    color: #FFF;
    width: 25vw;
    height: calc(100vh - 10%);
    background-color: #324985;
    position: fixed;
    top: 0px;
    right: 0px;
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    box-sizing: border-box;
}

/* ✅ 头部 高度压缩40→28 极致紧凑 保留拖拽功能 */
.setting-header {
    height: 28px;
    line-height: 28px;
    background-color: #3b5997;
    padding: 0 8px; /* ✅ 内边距减半 左右紧凑 */
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: #3471cb solid 1px;
    cursor: move;
}
.header-title {
    font-size: 12px; /* ✅ 标题字体缩小 18→12 */
    font-weight: 500;
}
.header-close {
    font-size: 14px; /* ✅ 关闭按钮缩小 20→14 */
    cursor: pointer;
    width: 22px; /* ✅ 按钮尺寸缩小 30→22 */
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
}
.header-close:hover {
    background-color: #324985;
}

/* ✅ 分组容器 字体缩小16→11 间距更紧凑 */
.setting-group {
    background-color: #3b5997;
    font-size: 11px;
    padding-left: 1px;
	padding-right: 1px;
	margin-bottom: 1px;
	border-radius: 0px;
	border: none;
}

/* ✅ 折叠面板头部 高度压缩40→26 核心紧凑项 */
.collapse-header {
    height: 26px;
    line-height: 26px;
    padding: 0 6px; /* ✅ 内边距减半 10→6 */
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}
.collapse-icon {
    font-size: 10px; /* ✅ 折叠图标缩小14→10 */
    color: #c9d1e8;
}

/* ✅ 属性项 重中之重！高度40→24 字体14→10 左侧缩进40→20 省巨量空间 */
.setting-item {
    background-color: #324985;
    font-size: 10px;
    padding-left: 20px;
	padding-right: 4px;
	height: 24px;
	margin-bottom: 1px;
	display: flex;
	flex-direction: row;
	align-content: center;
	align-items: center;
	justify-content: space-between;
}

.setting-item-switch {
    width: 60px;
}

/* ✅ 内容区 高度自适应头部压缩后的尺寸 + 滚动条窄化 8→4px 移动端友好 */
.setting-content {
    background-color: #324985;
    height: calc(100vh - 10% - 40px);
    margin-left: 0px;
	margin-right: 0px;
    overflow-y: auto;
	scrollbar-width: thin;
	scrollbar-color: #3b5997 #324985;
	box-sizing: border-box;
}
.setting-content::-webkit-scrollbar {
    width: 4px; /* ✅ 滚动条宽度减半 省横向空间 */
	background-color: #324985;
}
.setting-content::-webkit-scrollbar-thumb {
    background-color: #3b5997;
	border-radius: 2px;
}
.setting-content::-webkit-scrollbar-track {
    background-color: #324985;
}

/* ✅ 单行省略 适配紧凑宽度 最大宽度缩小 防溢出 */
.line-limit-length{
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>