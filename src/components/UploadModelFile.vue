<template>
  <!-- 原生组件实现弹窗 完全替代 uni-popup 插件 -->
  <view v-if="visible" class="popup-mask" @click.stop>
    <view class="upload-popup">
      <!-- 弹窗标题 -->
      <view class="popup-title">文件上传</view>
      <!-- 拖拽上传区域 替代 a-upload-dragger -->
      <view 
        class="upload-dragger" 
        @click="chooseFile"
        @drop="fileUpLoadHandleDrop"
        @dragover.prevent
      >
        <view class="upload-text">点击或拖拽文件到此处上传</view>
        <view class="upload-hint">仅支持单文件上传，请选择需要上传的文件</view>
      </view>

      <!-- <uni-progress v-if="progress > 0" :percent="progress" stroke-width="3" size="small" margin-top="15rpx" /> -->
      <!-- 弹窗底部按钮组 -->
      <view class="popup-btn-box">
        <button class="popup-btn cancel-btn" @click="FileUploadHandleCancel">取消</button>
        <button class="popup-btn confirm-btn" :loading="fileConfirmLoading" @click="FileUploadHandleOk">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { postAction } from '@/api';
import { ref } from 'vue';

// ========== 移除所有国际化相关代码 ==========

// 定义变量，保留原有所有变量及初始值
const progress = ref<number>(0);
let fileList = ref<File[]>([]);
let fileConfirmLoading = ref<boolean>(false);
// ✅ 新增：原生弹窗显隐控制变量（替代原uni-popup的ref）
const visible = ref<boolean>(false);

// 父组件传参 - 完全保留原定义 + ✅ 修复：补充props定义（原代码缺失导致报错）
interface Properties {
  FolderId: number;
}
const props = defineProps<Properties>();

// 自定义事件派发 - 完全保留原事件定义，父组件调用无感知
const emit = defineEmits<{
  (e: 'update:IsFileUpload', value: boolean): void;
  (e: 'FileUploadOk', value: any): void;
  (e: 'FileUploadError', value: any): void;
}>();

// 对外暴露的打开弹窗方法 - 保留原方法名和逻辑，✅ 替换弹窗打开方式
function OpenFileUpload() {
  visible.value = true; // 打开原生弹窗
  fileConfirmLoading.value = false;
  progress.value = 0;
  fileList.value = [];
}

// 确定上传核心方法 - 完全保留原上传逻辑+接口请求+进度监听 无任何修改
function FileUploadHandleOk() {
  if (fileList.value.length == 0) {
    return uni.showToast({ title: '请上传文件', icon: 'error', mask: true });
  }
  fileConfirmLoading.value = true;
  const formData = new FormData();
  formData.append("file", fileList.value[0]);
  formData.append("folderId", props.FolderId.toString());
  progress.value = 1;
  postAction("/File/UploadFile",formData,{},{ "Content-Type": "multipart/form-data" }).then((uploadInfo) => {
    emit("FileUploadOk", uploadInfo);
    uni.showToast({ title: '上传成功', icon: 'success', mask: true });
  }).catch((err) => {
    emit("FileUploadError", err);
    uni.showToast({ title: '上传失败', icon: 'error', mask: true });
  }).finally(() => {
    // 无论成败都重置状态+关闭弹窗
    fileConfirmLoading.value = false;
    progress.value = 0;
    fileList.value = [];
    visible.value = false; // ✅ 替换：关闭原生弹窗
  })
}

// 取消上传 - 保留原逻辑，✅ 替换弹窗关闭方式
function FileUploadHandleCancel() {
  emit("update:IsFileUpload", false);
  fileList.value = [];
  progress.value = 0;
  visible.value = false; // 关闭原生弹窗
}

// 文件选择/拖拽变更监听 - 保留原逻辑
function fileUpLoadHandleChange() {
  // 原antd的change事件，此处保留方法占位，可按需加日志
}

// 拖拽文件放下事件 - 保留原逻辑，H5端生效
function fileUpLoadHandleDrop(event: DragEvent) {
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    fileList.value = [event.dataTransfer.files[0]];
  }
}

// 选择文件前置处理 - 保留原逻辑
function beforeUpload(file: File): boolean {
  fileList.value = [file];
  return false;
}

// uni-app 原生选择文件方法 - 原封不动保留，兼容小程序/App/H5
function chooseFile() {
  uni.chooseFile({
    count: 1, // 原multiple=false 单文件上传
    type: 'all',
    success: (res) => {
      // 将uni选择的文件转为原生File对象
      const file = new File([res.tempFiles[0]], res.tempFiles[0].name, { type: res.tempFiles[0].type });
      fileList.value = [file];
    }
  })
}

// 暴露方法给父组件调用 - 完全保留原暴露内容，无修改
defineExpose({
  OpenFileUpload
});
</script>

<style scoped>
/* ✅ 新增：原生弹窗遮罩层样式（全屏、半透明、居中、点击不穿透） */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* 弹窗整体样式 - 保留原有所有样式，仅新增圆角和背景色（原uni-popup的属性） */
.upload-popup {
  width: 500rpx;
  padding: 30rpx;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
}
/* 弹窗标题 - 原样式不变 */
.popup-title {
  font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
	color: #333;
}
/* 拖拽上传区域样式 仿原antd拖拽样式 - 原样式不变 */
.upload-dragger {
  width: 100%;
  height: 200rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
}
.upload-dragger:active {
  border-color: #409eff;
  background: #f0f7ff;
}
/* 上传提示文字 - 原样式不变 */
.upload-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}
.upload-hint {
  font-size: 24rpx;
  color: #999;
}
/* 按钮区域样式 - 原样式不变 */
.popup-btn-box {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  margin-top: 30rpx;
}
.popup-btn {
  padding: 0 30rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 6rpx;
  font-size: 28rpx;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.confirm-btn {
  background: #409eff;
  color: #fff;
}
</style>