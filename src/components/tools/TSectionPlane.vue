<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 使用拆分后的组件 -->
        <SettingHeader title="截面设置" @close="toolState.Section = false" @drag-start="dragHelper.startDrag" />

        <view class="setting-content">
            <NativeSegmented v-model="activeTab" :options="tabs" @change="handleTabChange" />

            <!-- 动态面板渲染 -->
            <component :is="activePanelComponent" v-model="panelData[activeTab]" @change="handlePanelChange" />
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue'
import { DragHelper } from '@/utils/DragHelper'
import { Medusa } from "@/static/engine.sdk"
import { useToolPlaneStore } from '@/store'

// 导入组件
import SettingHeader from '@/components/tools/SettingHeader.vue'
import NativeSegmented from '@/components/tools/NativeSegmented.vue'
import StandardPanel from '@/components/tools/StandardPanel.vue'
import BoxPanel from '@/components/tools/BoxPanel.vue'
import PlanePanel from '@/components/tools/PlanePanel.vue'

const toolState = useToolPlaneStore()
const settingRoot = ref<HTMLElement | null>(null)
const dragHelper = new DragHelper(settingRoot)

// 响应式数据
const tabs = ['标准', '立方体', '平面']
const activeTab = ref(tabs[0])

const panelData = ref({
    '标准': { x: [0, 100], y: [0, 100], z: [0, 100] },
    '立方体': { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1.0, yScale: 1.0, zScale: 1.0 },
    '平面': { x: 0, y: 0, z: 0, xRotate: 0, yRotate: 0, zRotate: 0, xScale: 1, yScale: 1, zScale: 1 }
})

// 计算属性
const activePanelComponent = computed(() => {
    const components = {
        '标准': StandardPanel,
        '立方体': BoxPanel,
        '平面': PlanePanel
    }
    return components[activeTab.value]
})

// 方法
const handleTabChange = (tab: string) => {
    Medusa.StopClip()
    setTimeout(() => {
        const clipType = tab === '标准' ? 'normal' : tab === '立方体' ? 'box' : 'plane'
        Medusa.StartClip(clipType)
        // 重置数据
        panelData.value[tab] = JSON.parse(JSON.stringify(panelData.value[tab]))
    }, 100)
}
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

const handlePanelChange = (axis: string, value: any) => {
    // 处理面板变化逻辑，根据activeTab和axis调用对应的Medusa方法
    // 这里需要根据你的具体业务逻辑实现

    if (activeTab.value == "标准") {
        handleSplitChange(SectionValueType["Standard"+axis.toUpperCase()], value)
    } else if (activeTab.value == "立方体") {
        handleSplitChange(axis, value)

    } else {
        handleSplitChange(axis, value)
    }
    console.log("axis: string, value", axis, value);

}

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


// 监听Section状态
watch(() => toolState.Section, (newValue) => {
    if (newValue) {
        Medusa.StopClip()
        setTimeout(() => {
            const clipType = activeTab.value === '标准' ? 'normal' : activeTab.value === '立方体' ? 'box' : 'plane'
            Medusa.StartClip(clipType)
        }, 100)
    } else {
        Medusa.StopClip()
    }
})
</script>

<style scoped>
/* 主容器样式保持不变 */
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

.setting-content {
    background-color: #324985;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>