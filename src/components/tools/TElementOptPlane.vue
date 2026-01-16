<template>
    <!-- div全部替换为uni原生view，移除无用的onfocus事件 -->
    <view class="setting-root" ref="settingRoot">
        <view class="setting-content">
            <!-- v-for循环保留，点击事件不变，span替换为uni原生text -->
            <view v-for="(item, index) in optAction" class="setting-item" @click="OnMenuClick(item)">
                <text>{{ item }}</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 保留业务相关导入，移除 无用的DragHelper、TPlaneHeader、useI18n 等无效导入
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from '@/store';
import { watch } from 'vue';
import { AppEvent } from '@/api/engine/AppEvent';
import { onMounted } from 'vue';

// 移除多语言实例化 👇 核心删除
// const { t: $t } = useI18n();

const toolState = useToolPlaneStore();

// uni-app 中移除HTMLElement强类型，替换为any兼容跨端，保留ref引用
const settingRoot = ref<any>(null);

// ✅ 核心修改：移除所有$t多语言，替换为纯中文数组，文案与原语义一一对应
const optAction = ref([
    "重置",
    "显示全部",
    "半透明",
    "隔离显示",
    "高亮显示",
    "隐藏",
    "显示",
    "定位到该元素",
    "添加标记",
    "移除标记",
    "属性面板"
]);

// 元素选中事件监听 - 逻辑不变
AppEvent.addEventListener("OnElementSelected", ()=>{
    toolState.ElementOpt = false;
})

// 初始化事件监听 - 逻辑不变，仅兼容uni获取节点方式
AppEvent.addEventListener("OnInit", (data)=>{
    const div = document.getElementById("cloud_render_player");
    if(div){
        div.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            toolState.ElementOpt = true;
            if(settingRoot.value){
                settingRoot.value.style.left = `${e.clientX + 5}px`;
                settingRoot.value.style.top = `${e.clientY + 5}px`;
            }
        });
        div.addEventListener("mousedown", (e) => {
            toolState.ElementOpt = false;
        });
    } 
})

// 子元素判断方法 - 逻辑不变
function isTargetInChildren(parent: any, target: EventTarget|null): boolean {
    for (let i = 0; i < parent.childElementCount; i++) {
        const child = parent.children[i];
        if (child === target) {
            return true;
        }
        if (isTargetInChildren(child, target)) {
            return true;
        }
    }
    return false;
}

// 全局点击收起菜单 - 逻辑不变
document.addEventListener("mousedown", (e) => {
    if (e.target !== settingRoot.value) {
        if (settingRoot.value && !isTargetInChildren(settingRoot.value, e.target)) {
            toolState.ElementOpt = false;
        }
    }
});

// 标记颜色常量 - 逻辑不变
const markerColor = ref([255, 0, 0]);

// ✅ 核心修改：所有case中的$t多语言替换为上面对应的中文文案，方法调用逻辑完全不变
function OnMenuClick(index: string) {
    switch (index) {
        case "重置": 
            Medusa.ResetAllElement();
            break;
        case "显示全部":
            Medusa.ShowAllElement();
            break;
        case "半透明": 
            Medusa.SetElementColor(toolState.annotation.elementId, markerColor.value[0], markerColor.value[1], markerColor.value[2], 0.3);
            break;
        case "隔离显示":
            Medusa.LeaveElement(toolState.annotation.elementId);
            break;
        case "高亮显示":
            Medusa.HighLightElement(toolState.annotation.elementId, markerColor.value[0], markerColor.value[1], markerColor.value[2], 0.9);
            break;
        case "隐藏":
            Medusa.SetElementVisible(toolState.annotation.elementId, false);
            break;
        case "显示":
            Medusa.SetElementVisible(toolState.annotation.elementId, true);
            break;
        case "定位到该元素":
            Medusa.FlyToElementNoAction(toolState.annotation.elementId);
            break;
        case "添加标记":
            Medusa.ClearHighlightElement();
            Medusa.AddPointMarker(toolState.annotation.elementId, toolState.annotation.elementId, markerColor.value);
            break;
        case "移除标记":
            Medusa.ClearPointMarker();
            break;
        case "属性面板":
            toolState.Property = true;
            break;
    } 
    toolState.ElementOpt = false;
}

// 测量监听 - 逻辑不变
watch(() => toolState.Measure, (newValue) => {
    if (!newValue) {
        Medusa.StopMeasure();
    }
});

</script>

<style scoped>
.setting-root {
    color: #FFF;
    width: auto; /* uni兼容修改：替换H5的fit-content，小程序不支持 */
    background-color: #324985;
    position: fixed;
    top: 30%;
    right: 300px;
    border: #3471cb solid 1px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
}

.setting-content {
    background-color: #3471cb;
}

.setting-item {
    font-size: 14px;
    padding-top: 5px;
    padding-left: 10px;
    padding-right: 10px;
    height: 38px;
    width: 150px;
    background-color: #324985;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.setting-item:hover {
    background-color: #3471cb;
}
</style>