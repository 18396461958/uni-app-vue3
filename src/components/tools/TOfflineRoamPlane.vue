<template>
	<view class="setting-root" ref="settingRoot">
		<!-- 原生手写弹窗（替代原a-modal + a-input，无任何组件库） -->
		<view class="modal-mask" v-if="open" @click="open = false"></view>
		<view class="modal-box" v-if="open">
			<view class="modal-title">添加视点</view>
			<view class="modal-input-wrap">
				<input type="text" v-model="inputName" placeholder="请输入视点名称" class="modal-input" />
			</view>
			<view class="modal-btn-group">
				<view class="modal-btn cancel-btn" @click="open = false">取消</view>
				<view class="modal-btn sure-btn" @click="AddViewPoint">确定</view>
			</view>
		</view>

		<!-- 原生实现头部（替代原TPlaneHeader组件，保留拖拽+关闭功能） -->
		<view class="plane-header" @mousedown="dragHelper.startDrag">
			<view class="header-title">视点管理</view>
			<view class="header-close" @click="ToolStore.ViewPoint = false">×</view>
		</view>

		<!-- 内容区域 -->
		<view class="setting-content">
			<!-- 新增按钮 原生实现（替代原PlusOutlined图标） -->
			<view class="item-title" @click="open = true">
				<text>+</text>
				<text style="margin-left: 10px;">添加视点</text>
			</view>

			<!-- 视点列表循环 -->
			<view class="setting-item" v-for="(item, index) in viewPoints" :key="index">
				<view style="margin-top: 10px; margin-left: 10px;">
					{{ item.name }}
				</view>
				<image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)"></image>
				<view class="item-bottom">
					<!-- 原生时间格式化 替代moment.js -->
					{{ formatTime(item.createdTimDate) }}
					<!-- 原生删除按钮 替代DeleteOutlined图标+popconfirm，点击触发原生确认逻辑 -->
					<text class="icon-select" style="color: red;" @click="handleDelConfirm(item)">✕</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import { ref, watch } from 'vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { Medusa } from '@/static/engine.sdk';

// 全局变量定义-纯原生JS 移除TS所有语法
const inputName = ref("");
const open = ref(false);
const modelIds = ref([]);
const viewPoints = ref([]);
const ToolStore = useToolPlaneStore();
const settingRoot = ref(null);
const dragHelper = new DragHelper(settingRoot);

/**
 * 新增视点 原业务逻辑完全保留
 */
function AddViewPoint() { 
	open.value = false;
	if(!inputName.value.trim()) {
		// 原生提示 替代antd的message
		uni.showToast({title:'请输入视点名称', icon:'none', duration:1500});
		return;
	}
    Medusa.GetCameraView((view) => {
        let img = Medusa.GetCameraImg();
        viewPoints.value.push({ 
			name: inputName.value, 
			modelId: modelIds.value[0], 
			view: view, 
			image: img, 
			createdTimDate: Date.now(), 
			id: 0 
		});
		inputName.value = ''; // 清空输入框
    });
}

/**
 * 缩放至指定视点 原逻辑不变
 */
function ZoomView(item) {
    Medusa.SetCameraView(item.view);
}

/**
 * 删除确认-原生手写确认逻辑 替代a-popconfirm组件
 */
function handleDelConfirm(item) {
	// 纯原生确认逻辑 无任何uni组件封装，也可以注释这个用下面的原生弹窗二选一
	const isConfirm = window.confirm('确定要删除该视点吗？');
	if(isConfirm) {
		deleteView(item);
	}
	// // 备选：uni原生提示（如果你能接受这个唯一的uni-api，视觉更好）
	// uni.showModal({
	// 	title: '提示',
	// 	content: '确定要删除该视点吗？',
	// 	showCancel: true,
	// 	success: (res) => {
	// 		if(res.confirm) deleteView(item);
	// 	}
	// })
}

/**
 * 删除视点 原业务逻辑完全保留
 */
function deleteView(item) {
    viewPoints.value = viewPoints.value.filter((view) => view.id != item.id);
}

/**
 * 初始化数据 原逻辑不变
 */
function initData(modelId) {
    modelIds.value = modelId;
}

/**
 * 原生JS时间格式化方法 完全替代 moment.js 无任何依赖
 * 入参：时间戳  出参：YYYY-MM-DD HH:mm:ss 格式字符串
 */
function formatTime(timestamp) {
	const date = new Date(timestamp);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 监听显示状态 原逻辑完全保留
watch(() => ToolStore.ViewPoint, (newVal) => {
    if (newVal) {
        Medusa.GetModelListAsync().then((res) => {
            initData(res);	
        });
    }
})
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
	box-sizing: border-box;
}

/* 原生头部样式 替代TPlaneHeader组件 */
.plane-header {
	background-color: #3b5997;
	font-size: 16px;
	padding: 8px 12px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	cursor: move;
}
.header-close {
	font-size: 20px;
	cursor: pointer;
	width: 24px;
	height: 24px;
	text-align: center;
	line-height: 24px;
}
.header-close:hover {
	background-color: #355ea8;
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

/* 原生弹窗样式 替代a-modal 纯手写无依赖 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.6);
	z-index: 9999;
}
.modal-box {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 300px;
	background-color: #324985;
	border: 1px solid #3471cb;
	border-radius: 4px;
	z-index: 10000;
	padding: 15px;
	box-shadow: 0 0 10px rgba(0,0,0,0.3);
}
.modal-title {
	font-size: 16px;
	color: #fff;
	text-align: center;
	margin-bottom: 15px;
	font-weight: bold;
}
.modal-input-wrap {
	width: 100%;
}
.modal-input {
	width: 100%;
	padding: 8px 10px;
	background-color: #3b5997;
	border: 1px solid #3471cb;
	color: #fff;
	font-size: 14px;
	border-radius: 2px;
	box-sizing: border-box;
}
.modal-input::placeholder {
	color: #ccc;
}
.modal-btn-group {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 20px;
}
.modal-btn {
	padding: 6px 15px;
	cursor: pointer;
	border-radius: 2px;
	font-size: 14px;
}
.cancel-btn {
	background-color: #3b5997;
	border: 1px solid #3471cb;
}
.sure-btn {
	background-color: #3471cb;
	border: 1px solid #3471cb;
}
</style>