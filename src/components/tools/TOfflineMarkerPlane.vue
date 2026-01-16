<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 原生模拟【重复添加确认弹窗】- 替代原a-modal confirmAdd -->
        <view class="modal-mask" v-show="confirmAdd" @click="confirmAdd = false">
            <view class="modal-box" @click.stop>
                <view class="modal-title">提示</view>
                <view class="modal-footer">
                    <view class="modal-btn" @click="open = true; confirmAdd = false">确定</view>
                </view>
            </view>
        </view>

        <!-- 原生模拟【新增/编辑批注弹窗】- 替代原a-modal open -->
        <view class="modal-mask" v-show="open" @click="open = false">
            <view class="modal-box modal-box-lg" @click.stop>
                <view class="modal-title">批注标记</view>
                <view class="modal-content">
                    <!-- 原生textarea 替代原a-textarea -->
                    <textarea 
                        v-model="inputName" 
                        class="native-textarea"
                        auto-height
                        min-height="200rpx"
                    ></textarea>
                </view>
                <view class="modal-footer">
                    <view class="modal-btn" @click="AddMarker">确定</view>
                </view>
            </view>
        </view>

        <!-- 原生模拟【删除确认弹窗】- 替代原a-popconfirm 无任何第三方组件 -->
        <view class="modal-mask" v-show="deleteConfirmShow" @click="deleteConfirmShow = false">
            <view class="modal-box" @click.stop>
                <view class="modal-title">提示</view>
                <view class="modal-tip">确定要删除吗？</view>
                <view class="modal-footer flex-row">
                    <view class="modal-btn cancel-btn" @click="deleteConfirmShow = false">取消</view>
                    <view class="modal-btn confirm-btn" @click="handleDeleteSure">确定</view>
                </view>
            </view>
        </view>

        <!-- 头部组件 保留原事件，多语言替换为中文 -->
        <TPlaneHeader 
            @mousedown="dragHelper.startDrag" 
            @close="() => { ToolStore.Marker = false }"
            :title="`批注标记`" 
        />
        
        <view class="setting-content">
            <!-- 新增按钮 替换图标为纯文字+样式，多语言替换中文 -->
            <view class="item-title" @click="AddMarkerPre">
                <text>+</text>
                <span style="margin-left: 10px;">新增批注</span>
            </view>

            <!-- 批注列表循环 所有标签替换为原生view -->
            <view 
                :class="item.isShow? 'setting-item-selected': 'setting-item'" 
                v-for="(item, index) in markerList" 
                :key="index"
            >
                <image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)"></image>
                <view style="margin-top: 10px; margin-left: 10px;">
                    {{ item.name }}
                </view>
                <view class="item-bottom">
                    <!-- 原生时间格式化 替代moment -->
                    {{ formatDate(item.createdTimDate) }}
                    <view style="width: 80px; display: flex; flex-direction: row; justify-content: space-between;">
                        <!-- 原生模拟悬浮提示 替代a-tooltip + 编辑图标 -->
                        <view class="tooltip-box" @click="EditMarker(item)">
                            <text class="icon-select">编辑</text>
                            <view class="tooltip-text">编辑</view>
                        </view>
                        <!-- 原生模拟悬浮提示 替代a-tooltip + 删除按钮（点击触发删除弹窗） -->
                        <view class="tooltip-box" @click="showDeleteConfirm(item)">
                            <text class="icon-select del-icon">删除</text>
                            <view class="tooltip-text">删除</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import TPlaneHeader from './TPlaneHeader.vue';
import { ref, onMounted, watch } from 'vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { Medusa } from '@/static/engine.sdk';

// ✅ 移除所有多语言、AntD图标、AntD message相关引入
// ✅ 移除moment依赖，使用原生时间格式化函数

// 全局状态管理
const ToolStore = useToolPlaneStore();

// 响应式变量 - 保留所有原变量
const inputName = ref<string>("");
const open = ref<boolean>(false);
const confirmAdd = ref<boolean>(false);
const modelIds = ref<string[]>([]);
const markerList = ref<IMarker[]>([]);
const settingRoot = ref<HTMLElement | null>(null);
const dragHelper = new DragHelper(settingRoot);
const deleteConfirmShow = ref<boolean>(false); // 原生删除弹窗显隐
const deleteCurrentItem = ref<IMarker | null>(null); // 当前待删除的批注项

// 样式相关变量 - 保留原配置
const markStyle = ref({
    frameColor: "blue",
    frameStyle: "1",
    fontColor: ""
});
const color_rbg = ref([255,255,0]);

// 编辑的批注项 - 保留原变量
let editMarker:IMarker|null = null;

// 批注数据接口 - 保留原定义
interface IMarker {
    id: number,
    projectId: string,
    position: string,
    elementId:string,
    image: string,
    view: string,
    name: string,
    style: string,
    createdTimDate: string,
    isShow: boolean,
}

// ✅ 原生时间格式化函数 替代 moment，纯JS无依赖，格式：YYYY-MM-DD HH:mm:ss
const formatDate = (timeStamp: string) => {
    const date = new Date(Number(timeStamp));
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

// ✅ 显示删除确认弹窗 - 替代原a-popconfirm的触发逻辑
const showDeleteConfirm = (item:IMarker) => {
    deleteCurrentItem.value = item;
    deleteConfirmShow.value = true;
};

// ✅ 确认删除操作 - 原生弹窗确认后的回调
const handleDeleteSure = () => {
    if(deleteCurrentItem.value) {
        deleteView(deleteCurrentItem.value);
        deleteConfirmShow.value = false;
        deleteCurrentItem.value = null;
    }
};

// 前置新增批注 - 保留原逻辑，多语言替换中文提示
function AddMarkerPre() {
    editMarker = null;
    if (ToolStore.annotation.elementId) {
        let marker = markerList.value.find((x) => x.position == ToolStore.annotation.position);
        if (marker) {
            confirmAdd.value = true;
        } else {
            open.value = true;
        }
    } else {
        // ✅ UniApp原生提示 替代 AntD message.info
        uni.showToast({
            title: "请点击选择批注的构件",
            icon: "none",
            duration: 2000
        });
    }
}

// 编辑批注 - 保留原逻辑不变
function EditMarker(item:IMarker) {
    editMarker = item;
    open.value = true;
    inputName.value = item.name;
}

// 新增/保存批注 - 保留原所有业务逻辑不变
function AddMarker() { 
    if(editMarker) {
        editMarker.name = inputName.value;
        let result:IMarker = editMarker;
        result.isShow = true;
        Medusa.RemoveMarker(result.id);
        Medusa.AddMarker(
            result.id,
            result.position.split(","),
            result.name,
            markStyle.value.frameStyle,
            markStyle.value.frameColor,
            color_rbg.value
        );
        editMarker = null;
    } else {
        Medusa.GetCameraView((view: any) => {
            let img = Medusa.GetCameraImg();
            let marker = { 
                name: inputName.value, 
                projectId: modelIds.value[0], 
                view: view, 
                image: img,
                style: JSON.stringify({markStyle:markStyle.value,color_rbg:color_rbg.value}),
                position: ToolStore.annotation.position,
                elementId: ToolStore.annotation.elementId,
                createdTimDate: Date.now().toString(),
                id: 0,
                isShow: false
            };
            let result:IMarker = marker;
            result.isShow = true;
            markerList.value.push(result);
            Medusa.ClearMarker();
            Medusa.AddMarker(
                result.id,
                result.position.split(","),
                result.name,
                markStyle.value.frameStyle,
                markStyle.value.frameColor,
                color_rbg.value
            );
            inputName.value = "";
        });
    }
    open.value = false;
}

// 缩放查看批注 - 保留原所有业务逻辑不变
function ZoomView(item:IMarker) {
    let style = JSON.parse(item.style);
    if(item.isShow) {
        Medusa.RemoveMarker(item.id);
        item.isShow = false;
    } else {
        item.isShow = true;
        Medusa.AddMarker(
            item.id,
            item.position.split(','),
            item.name,
            style.markStyle.frameStyle,
            style.markStyle.frameColor,
            style.color_rbg
        );
        Medusa.SetCameraView(item.view);
    }
}

// 删除批注 - 保留原逻辑，多语言替换中文提示
function deleteView(item:IMarker) {
    postAction("/maker/DeleteMarker", { value: item.id }).then((res: any) => {
        // ✅ UniApp原生成功提示 替代 AntD message.success
        uni.showToast({
            title: "删除成功",
            icon: "success",
            duration: 1500
        });
        markerList.value = markerList.value.filter((view) => view.id != item.id);
        Medusa.RemoveMarker(item.id);
    });
}

// 监听状态变化 - 保留原逻辑不变
watch(() => ToolStore.Marker, (newVal, oldVal) => {
    if (newVal) {
        Medusa.GetModelListAsync().then((res: any) => {
            initData(res);	
        });
    } else {
        Medusa.ClearMarker(); 
    }
});

// 初始化数据 - 保留原逻辑不变
function initData(modelId: string[]) {
    modelIds.value = modelId;
    markerList.value = [];
}
</script>

<style scoped>
/* 保留原所有样式 + 新增原生弹窗/悬浮提示的样式，无任何第三方样式依赖 */
.setting-root {
    color: #FFF;
    width: 20%;
    height: calc(100vh - 10%);
    background-color: #324985;
    position: fixed;
    top: 0px;
    right:0px;
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
.setting-item-selected{
    background-color: #082665;
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
    height: calc(100vh - 10% - 80px);
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
    width: calc(100% - 10px);
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
    font-size: 12px;
}
.del-icon {
    color: red;
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
.item-title text {
    font-size: 16px;
}

/* ✅ 原生弹窗遮罩层样式 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}
/* ✅ 弹窗主体样式 */
.modal-box {
    width: 280px;
    background-color: #324985;
    border: 1px solid #3471cb;
    border-radius: 4px;
    padding: 20px;
    color: #fff;
}
.modal-box-lg {
    width: 320px;
}
.modal-title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
}
.modal-tip {
    text-align: center;
    margin-bottom: 20px;
    font-size: 14px;
}
.modal-content {
    width: 100%;
}
.modal-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
}
.flex-row {
    justify-content: space-between;
}
.modal-btn {
    padding: 6px 16px;
    background-color: #355ea8;
    border-radius: 4px;
    cursor: pointer;
}
.modal-btn:hover {
    background-color: #3b5997;
}
.cancel-btn {
    background-color: #3b5997;
}
.confirm-btn {
    background-color: #082665;
}

/* ✅ 原生textarea样式重置，模拟原a-textarea效果 */
.native-textarea {
    width: 100%;
    min-height: 200rpx;
    background-color: #3b5997;
    color: #fff;
    border: 1px solid #3471cb;
    border-radius: 4px;
    padding: 10px;
    font-size: 14px;
    resize: none;
}

/* ✅ 原生悬浮提示样式 替代a-tooltip */
.tooltip-box {
    position: relative;
    cursor: pointer;
}
.tooltip-text {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0,0,0,0.8);
    color: #fff;
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 2px;
    display: none;
    white-space: nowrap;
    z-index: 10;
}
.tooltip-box:hover .tooltip-text {
    display: block;
}
</style>