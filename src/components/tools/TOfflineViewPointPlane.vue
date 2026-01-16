<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 纯原生手写弹窗 替代 a-modal 无任何组件库/uni-xxx -->
        <view v-if="open" class="native-modal-mask" @click="open = false"></view>
        <view v-if="open" class="native-modal">
            <view class="modal-title">输入视角名称</view>
            <input 
                class="modal-input" 
                type="text" 
                :value="inputName" 
                @input="e => inputName = e.target.value"
                placeholder="请输入视角名称"
            />
            <view class="modal-btn-group">
                <view class="modal-btn cancel-btn" @click="open = false">取消</view>
                <view class="modal-btn confirm-btn" @click="AddViewPoint">确定</view>
            </view>
        </view>

        <!-- 原有头部组件保留 拖拽/关闭逻辑不变 -->
        <TPlaneHeader 
            @mousedown="dragHelper.startDrag" 
            @close="() => { ToolStore.ViewPoint = false }"
            title="视角管理" 
        />
        
        <view class="setting-content">
            <!-- 添加视角按钮 原生替代图标+多语言 -->
            <view class="item-title" @click="()=>{open = true}">
                <text class="add-icon">⊕</text>
                <text style="margin-left: 10px;">添加视角</text>
            </view>

            <!-- 视角列表循环项 -->
            <view class="setting-item" v-for="(item, index) in viewPoints" :key="index">
                <view style="margin-top: 10px; margin-left: 10px;">
                    {{ item.name }}
                </view>
                <img class="item-img" :src="item.image" alt="视角截图" @click="ZoomView(item)"/>
                <view class="item-bottom">
                    <!-- 原生JS格式化时间 替代 moment -->
                    {{ formatTime(item.createdTimDate) }}
                    <!-- 纯原生删除确认 替代 a-popconfirm 无任何组件库 -->
                    <view 
                        class="icon-select del-icon" 
                        style="color: red;"
                        @click="showDelConfirm(item)"
                    >🗑️</view>
                </view>
            </view>
        </view>

        <!-- 纯原生手写删除确认弹窗 替代 a-popconfirm -->
        <view v-if="delConfirmShow" class="del-mask" @click="delConfirmShow = false"></view>
        <view v-if="delConfirmShow" class="del-confirm-box">
            <view class="del-text">确定要删除吗？</view>
            <view class="del-btn-group">
                <view class="del-btn cancel" @click="delConfirmShow = false">取消</view>
                <view class="del-btn confirm" @click="handleDelSure">确定</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import TPlaneHeader from './TPlaneHeader.vue';
import { ref, watch, onMounted } from 'vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { Medusa } from '@/static/engine.sdk';

// ✅ 彻底移除 i18n 多语言相关所有代码
// ✅ 彻底移除 antd 图标、moment 依赖

// 定义变量
const inputName = ref<string>("");
const open = ref<boolean>(false);
const modelIds = ref<string[]>([]);
const viewPoints = ref<IViewPoint[]>([]);
const settingRoot = ref<HTMLElement | null>(null);
// 删除确认弹窗相关
const delConfirmShow = ref<boolean>(false);
const curDelItem = ref<IViewPoint | null>(null);

// 拖拽实例 原有逻辑不变
const dragHelper = new DragHelper(settingRoot);
// store仓库 原有逻辑不变
const ToolStore = useToolPlaneStore();

// 视角数据类型接口 不变
interface IViewPoint {
    id: number,
    modelId: string,
    image: string,
    name: string,
    view: string,
    createdTimDate: number,
}

// ✅ 核心：原生JS实现时间格式化 替代 moment.js (YYYY-MM-DD HH:mm:ss)
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 显示删除确认弹窗
const showDelConfirm = (item: IViewPoint) => {
    curDelItem.value = item;
    delConfirmShow.value = true;
};

// 确认删除执行逻辑
const handleDelSure = () => {
    if(curDelItem.value) {
        deleteView(curDelItem.value);
    }
    delConfirmShow.value = false;
    curDelItem.value = null;
};

// 添加视角 原有业务逻辑完全不变
function AddViewPoint() { 
    open.value = false;
    Medusa.GetCameraView((view: any) => {
        let img = Medusa.GetCameraImg();
        viewPoints.value.push( { 
            name: inputName.value, 
            modelId: modelIds.value[0], 
            view: view, 
            image: img, 
            createdTimDate: Date.now(), 
            id: 0 
        });
    });
    // 清空输入框
    inputName.value = '';
}

// 视角预览/缩放 原有逻辑不变
function ZoomView(item:IViewPoint) {
    Medusa.SetCameraView(item.view);
}

// 删除视角 原有逻辑不变
function deleteView(item:IViewPoint) {
    viewPoints.value = viewPoints.value.filter((view) => view.id != item.id);
}

// 监听store状态 原有逻辑不变
watch(() => ToolStore.ViewPoint, (newVal) => {
    if (newVal) {
        Medusa.GetModelListAsync().then((res: any) => {
            initData(res);	
        });
    }
})

// 初始化数据 原有逻辑不变
function initData(modelId: string[]) {
    modelIds.value = modelId;
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

.setting-item {
    background-color: #3b5997;
    font-size: 14px;
    margin: 10px 10px 0px 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-content: space-around;
    align-items: stretch;
    justify-content: flex-start;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
}

.setting-content {
    background-color: #324985;
    height: calc(100vh - 148px - 80px);
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

.item-img {
    margin-top: 10px;
    margin-left: 10px;
    margin-right: 10px;
    width: calc(100% - 20px);
    height: 200px;
    object-fit: cover;
}

.setting-content::-webkit-scrollbar-thumb {
    background-color: #3b5997;
    border-radius: 4px;
}

.setting-content::-webkit-scrollbar-track {
    background-color: #324985;
}

.item-bottom {
    margin-left: 10px;
    margin-top: 10px;
    margin-right: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
}

.icon-select {
    cursor: pointer;
    font-size: 18px;
}

.icon-select:hover {
    background-color: #355ea8;
    padding: 2px 4px;
    border-radius: 2px;
}

.item-title:hover {
    background-color: #3b5997;
}

.item-title {
    padding: 5px 10px;
    margin-left: 10px;
    background-color: #355ea8;
    cursor: pointer;
    width: fit-content;
    display: flex;
    align-items: center;
}
.add-icon {
    font-size: 16px;
}

/* ✅ 纯原生弹窗样式 - 替代a-modal */
.native-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
}
.native-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: #324985;
    border: 1px solid #3471cb;
    border-radius: 4px;
    z-index: 10000;
    padding: 20px;
}
.modal-title {
    font-size: 16px;
    color: #fff;
    margin-bottom: 15px;
    text-align: center;
}
.modal-input {
    width: 100%;
    height: 36px;
    background: #3b5997;
    border: 1px solid #3471cb;
    color: #fff;
    padding: 0 10px;
    box-sizing: border-box;
    border-radius: 2px;
}
.modal-btn-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}
.modal-btn {
    width: 45%;
    height: 32px;
    line-height: 32px;
    text-align: center;
    border-radius: 2px;
    cursor: pointer;
}
.cancel-btn {
    background: #3b5997;
}
.confirm-btn {
    background: #3471cb;
}

/* ✅ 纯原生删除确认弹窗样式 - 替代a-popconfirm */
.del-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    z-index: 9999;
}
.del-confirm-box {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    background: #324985;
    border: 1px solid #3471cb;
    border-radius: 4px;
    z-index: 10000;
    padding: 20px;
}
.del-text {
    font-size: 14px;
    color: #fff;
    margin-bottom: 15px;
    text-align: center;
}
.del-btn-group {
    display: flex;
    justify-content: space-between;
}
.del-btn {
    width: 45%;
    height: 30px;
	line-height:30px;
    text-align: center;
    border-radius: 2px;
    cursor: pointer;
    font-size:14px;
}
.del-btn.cancel {
    background: #3b5997;
}
.del-btn.confirm {
    background: #d9363e;
    color: #fff;
}
</style>