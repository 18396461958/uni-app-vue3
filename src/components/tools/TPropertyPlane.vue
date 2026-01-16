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

// ========== 移除所有i18n多语言相关代码 ==========
// 移除 import { useI18n } from 'vue-i18n'
// 移除 const { t: $t } = useI18n();

// ========== 拖拽实例 保留原有拖拽逻辑 ==========
const dragHelper = new DragHelper(settingRoot);
// 封装拖拽触发方法 供模板原生调用
const startDrag = () => {
    dragHelper.startDrag();
};

// ========== 原生折叠面板 展开/收起切换方法 (替代原a-collapse的v-model:activeKey逻辑) ==========
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
   
// ========== 原有接口请求逻辑 仅移除多语言，替换为中文 ==========
function initProperty(modelId: string, elementId: string) {
    postAction("/ModelStruct/GetProperty", { modelId: modelId, componentId: elementId }).then((res: any) => {
        const ps: { [key: string]: Property[] } = {};
        res.forEach((item: any) => {
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
        // ✅ 移除多语言 $t 替换为纯中文「基本属性」
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
    width: 340px;
    height: calc(100vh - 148px);
    background-color: #324985;
    position: fixed;
    top: 74px;
    right: 10px;
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

/* 新增：原生头部样式 完全匹配原TPlaneHeader视觉+布局 */
.setting-header {
    height: 40px;
    line-height: 40px;
    background-color: #3b5997;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: #3471cb solid 1px;
    cursor: move;
}
.header-title {
    font-size: 18px;
    font-weight: 500;
}
.header-close {
    font-size: 20px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    border-radius: 50%;
}
.header-close:hover {
    background-color: #324985;
}

.setting-group {
    background-color: #3b5997;
    font-size: 16px;
    padding-left: 1px;
	padding-right: 1px;
	margin-bottom: 1px;
	border-radius: 0px;
	border: none;
}

/* 新增：原生折叠面板头部样式 视觉和交互匹配原组件 */
.collapse-header {
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}
.collapse-icon {
    font-size: 14px;
    color: #c9d1e8;
}

.setting-item {
    background-color: #324985;
    font-size: 14px;
    padding-left: 40px;
	padding-right: 10px;
	height: 40px;
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

.setting-content {
    background-color: #324985;
    height: calc(100vh - 148px - 40px);
    margin-left: 10px;
	margin-right: 10px;
	overflow-y: auto;
	overflow: auto;
	scrollbar-width: thin;
	scrollbar-color: #3b5997 #324985;
	box-sizing: content-box;
}
.setting-content::-webkit-scrollbar {
    width: 8px;
	padding-right: 10px;
	box-sizing: content-box;
	background-color: #324985;
}
.setting-content::-webkit-scrollbar-thumb {
    background-color: #3b5997;
	border-radius: 4px;
}
.setting-content::-webkit-scrollbar-track {
    background-color: #324985;
}

.line-limit-length{
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>