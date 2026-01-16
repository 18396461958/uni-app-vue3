<template>
	<view class="setting-root" ref="settingRoot">
		<!-- ✅ 纯原生实现【重复标注确认弹窗】 替代 uni-modal 无任何封装组件 -->
		<view v-if="confirmAdd" class="modal-mask" @tap="confirmAdd = false">
			<view class="modal-box" @tap.stop>
				<view class="modal-title">标注</view>
				<view class="modal-content">当前位置已存在标注，是否继续添加？</view>
				<view class="modal-btn-group">
					<view class="modal-btn cancel-btn" @tap="confirmAdd = false">取消</view>
					<view class="modal-btn confirm-btn" @tap="open = true; confirmAdd = false">确认</view>
				</view>
			</view>
		</view>

		<!-- ✅ 纯原生实现【新增/编辑标注弹窗】 替代 uni-modal 无任何封装组件 -->
		<view v-if="open" class="modal-mask" @tap="open = false">
			<view class="modal-box modal-box-lg" @tap.stop>
				<view class="modal-title">标注</view>
				<view class="modal-content">
					<!-- ✅ 纯原生textarea 替代 uni-textarea 原生基础标签 无封装 -->
					<textarea v-model="inputName" class="native-textarea" auto-height :min-height="180"></textarea>
				</view>
				<view class="modal-btn-group">
					<view class="modal-btn cancel-btn" @tap="open = false">取消</view>
					<view class="modal-btn confirm-btn" @tap="AddMarker">确认</view>
				</view>
			</view>
		</view>

		<!-- 头部组件 触摸事件保留 适配多端 -->
		<TPlaneHeader @touchstart="dragHelper.startDrag" @close="() => { ToolStore.Marker = false }" title="标注" />
		
		<view class="setting-content">
			<!-- 添加标注按钮 -->
			<view class="item-title" @click="AddMarkerPre">
				<text class="icon-btn">+</text>
				<text style="margin-left: 10px;">添加标注</text>
			</view>
			
			<!-- 标注列表循环 原有逻辑完全不变 -->
			<view :id="item.elementId" :class="item.isShow? 'setting-item-selected': 'setting-item'" v-for="(item, index) in markerList" :key="index">
				<image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)"></image>
				<view class="item-text-title">
					<view style="margin-top: 10px; margin-left: 10px;">
						<text>{{ item.name }}</text>
					</view>
					<view style="margin-top: 10px; margin-left: 10px;">
						<!-- ✅ 纯原生实现开关 替代 uni-switch 无任何封装 手写实现 -->
						<view class="native-switch" :class="item.isShow ? 'active' : ''" @tap="ShowChange(!item.isShow, item)">
							<view class="switch-slider"></view>
						</view>
					</view>
				</view>
				<view class="item-bottom">
					<text>{{ formatDate(item.createdTimDate) }}</text>
					<view style="width: 40px; display: flex; flex-direction: row; justify-content: space-between;">
						<text class="icon-select" @click="EditMarker(item)" title="编辑">✏️</text>
						<text class="icon-select del-icon" @click="handleDelConfirm(item)" title="删除">🗑️</text>
					</view>
				</view>
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
import { AppEvent } from '@/api/engine/AppEvent';

// 纯中文 无任何i18n相关代码
const inputName = ref<string>("");

// 标注数据结构 完全不变
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

const ToolStore = useToolPlaneStore();
const open = ref<boolean>(false);
const confirmAdd = ref<boolean>(false);
const modelIds = ref<string[]>([]);

const markStyle = ref({
	frameColor: "blue",
	frameStyle: "1",
	fontColor: ""
});
const color_rbg = ref([255,255,0]);

// 监听标注面板显隐 逻辑不变
watch(() => ToolStore.Marker, (newVal, oldVal) => {
	if (newVal) {
		settingRoot.value!.style.zIndex=ToolStore.DivIndex+++"";
	}
})

// 构件选中事件 逻辑不变
AppEvent.addEventListener("OnElementSelected", (e) => {
	if (ToolStore.Marker) {
		markerList.value.forEach((marker) => {
			if (marker.elementId == `${e.ModelId}*${e.ElementId}`) {
				marker.isShow = true;
				ShowChange(true, marker);
				const htmlElement = uni.createSelectorQuery().select(`#${marker.elementId}`);
				htmlElement.boundingClientRect(res => {
					if(res) uni.pageScrollTo({ scrollTop: res.top, duration: 300 });
				}).exec();
			}
		});
	}
});

// 新增前置校验 逻辑不变
function AddMarkerPre() {
	editMarker = null;
	if (ToolStore.annotation.elementId) {
		const marker = markerList.value.find((x) => x.position == ToolStore.annotation.position);
		if (marker) {
			confirmAdd.value = true;
		} else {
			open.value = true;
		}
	} else {
		uni.showToast({ title: '请点击选择批注的构件', icon: 'none', duration: 2000 });
	}
}

let editMarker:IMarker|null = null;

// 编辑标注 逻辑不变
function EditMarker(item:IMarker) {
	editMarker = item;
	open.value = true;
	inputName.value = item.name;
}

// 新增/编辑标注提交 业务逻辑完全不变
function AddMarker() { 
	if(editMarker) {
		editMarker.name = inputName.value;
		postAction("/maker/UpdateMarker", editMarker).then((res: any) => {
			const result:IMarker = res;
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
			res.isShow = true;
			editMarker = null;
		});
	} else {
		Medusa.GetCameraView((view: any) => {
			const img = Medusa.GetCameraImg();
			const marker = { 
				name: inputName.value, 
				projectId: modelIds.value[0], 
				view: view, 
				image: img,
				style: JSON.stringify({markStyle:markStyle.value,color_rbg:color_rbg.value}),
				position: ToolStore.annotation.position,
				elementId: ToolStore.annotation.elementId,
			};
			postAction("/maker/AddMarker", marker).then((res: any) => {
				const result:IMarker = res;
				res.isShow = true;
				markerList.value.push(res);
				Medusa.AddMarker(
					result.id,
					result.position.split(","),
					result.name,
					markStyle.value.frameStyle,
					markStyle.value.frameColor,
					color_rbg.value
				);
			});
			inputName.value = "";
		});
	}
	open.value = false;
}

// 显示/隐藏标注切换 逻辑不变
function ShowChange(checked:boolean, item:IMarker) {
	item.isShow = checked;
	if(checked) {
		Medusa.AddMarker(
			item.id,
			item.position.split(','),
			item.name,
			markStyle.value.frameStyle,
			markStyle.value.frameColor,
			color_rbg.value
		);
	} else {
		Medusa.RemoveMarker(item.id);
	}
}

// 点击图片跳转视角 逻辑不变
function ZoomView(item:IMarker) {
	const style = JSON.parse(item.style);
	if(!item.isShow) {
		item.isShow = true;
		Medusa.AddMarker(
			item.id,
			item.position.split(','),
			item.name,
			style.markStyle.frameStyle,
			style.markStyle.frameColor,
			style.color_rbg
		);
	}
	Medusa.SetCameraView(item.view);
}

// 删除确认弹窗 逻辑不变
function handleDelConfirm(item:IMarker) {
	uni.showModal({
		title: '确认删除',
		content: '是否确定删除该标注？',
		confirmText: '确定',
		cancelText: '取消',
		success: (res) => {
			if(res.confirm) deleteView(item);
		}
	})
}

// 删除标注逻辑 不变
function deleteView(item:IMarker) {
	postAction("/maker/DeleteMarker", { value: item.id }).then((res: any) => {
		uni.showToast({ title: '删除成功', icon: 'success', duration: 1500 });
		markerList.value = markerList.value.filter((view) => view.id != item.id);
		Medusa.RemoveMarker(item.id);
	});
}

// 标注列表数据源 不变
const markerList = ref<IMarker[]>([]);

// 监听面板显隐加载/清空数据 不变
watch(() => ToolStore.Marker, (newVal, oldVal) => {
	if (newVal) {
		Medusa.GetModelListAsync().then((res: any) => {
			initData(res);	
		});
	} else {
		Medusa.ClearMarker(); 
	}
})

// 初始化标注数据 不变
function initData(modelId: string[]) {
	modelIds.value = modelId;
	postAction("/maker/GetMarkersByModels", { value: modelId }).then((res: any) => {
		markerList.value = [];
		markerList.value.push(...res);
	})
}

// 核心ref绑定 不变
const settingRoot = ref<HTMLElement | null>(null);
const dragHelper = new DragHelper(settingRoot);

// 原生日期格式化函数 无第三方依赖 不变
function formatDate(dateStr: string) {
	if(!dateStr) return '';
	const date = new Date(dateStr);
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
</script>

<style scoped>
.setting-root {
	color: #FFF;
	width: 340px;
	height: calc(100vh - 10%);
	background-color: #324985;
	position: fixed;
	top: 74px;
	right: 10px;
	border: #3471cb solid 1px;
	box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
	z-index: 1000;
	box-sizing: border-box;
}

.setting-group {
	background-color: #3b5997;
	font-size: 16px;
	padding-left: 1px;
	padding-right: 1px;
	margin-bottom: 1px;
	display: flex;
	flex-direction: row;
	align-content: center;
	align-items: center;
	justify-content: space-between;
	border-radius: 0px;
	border: none;
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
	box-sizing: content-box;
}

.item-text-title{
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.item-img {
	margin-top: 10px;
	margin-left: 10px;
	margin-right: 10px;
	width: calc(100% - 20px);
	height: 200px;
	object-fit: cover;
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
	font-size: 20px;
	line-height: 20px;
}
.del-icon{
	color: red;
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
.icon-btn{
	font-size: 18px;
}

/* ✅ 新增：纯原生弹窗遮罩样式 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.6);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}
/* ✅ 新增：原生弹窗主体样式 */
.modal-box {
	width: 280px;
	background-color: #fff;
	border-radius: 8px;
	overflow: hidden;
	color: #333;
}
/* ✅ 新增：大尺寸弹窗适配编辑页 */
.modal-box-lg {
	width: 320px;
}
/* ✅ 新增：弹窗标题样式 */
.modal-title {
	font-size: 16px;
	font-weight: bold;
	padding: 15px;
	border-bottom: 1px solid #e5e5e5;
	text-align: center;
}
/* ✅ 新增：弹窗内容样式 */
.modal-content {
	padding: 20px 15px;
	font-size: 14px;
	line-height: 1.5;
}
/* ✅ 新增：弹窗按钮组样式 */
.modal-btn-group {
	display: flex;
	border-top: 1px solid #e5e5e5;
}
.modal-btn {
	flex: 1;
	text-align: center;
	padding: 12px 0;
	font-size: 14px;
}
.cancel-btn {
	border-right: 1px solid #e5e5e5;
	color: #666;
}
.confirm-btn {
	color: #007aff;
}

/* ✅ 新增：纯原生textarea样式 替代 uni-textarea */
.native-textarea {
	width: 100%;
	min-height: 180px;
	background-color: #fff;
	color: #333;
	padding: 8px;
	border-radius: 4px;
	font-size: 14px;
	line-height: 1.5;
	box-sizing: border-box;
}

/* ✅ 新增：纯原生开关样式 替代 uni-switch 完全手写无封装 */
.native-switch {
	width: 40px;
	height: 22px;
	border-radius: 11px;
	background-color: #ccc;
	position: relative;
	transition: background-color 0.3s ease;
}
.native-switch.active {
	background-color: #007aff;
}
.switch-slider {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background-color: #fff;
	position: absolute;
	top: 1px;
	left: 1px;
	transition: left 0.3s ease;
}
.native-switch.active .switch-slider {
	left: 19px;
}
</style>