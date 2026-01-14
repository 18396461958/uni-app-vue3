<template>
    <view class="page-container">
        <!-- 标题区域 - 简洁置顶 -->
        <view class="page-title">最近打开
            <image src="/static/images/icon_nav_full@2x.png" alt="" style="height: 30px;width: 30px;border-radius: 40px; z-index: 9999;
            position: absolute;
            right: 20px;
            cursor: pointer;background-color: rgb(0 122 255 / 75%);" @click="fullScreen" />
        </view>

        <!-- 文件列表主体 - 无外边框 极简容器 -->
        <view class="file-table">
            <!-- 列表表头 - 含刷新按钮 -->
            <view class="table-header">
                <view class="header-item name-col">模型名称(点击预览)</view>
                <view class="header-item size-col">大小</view>
                <button class="refresh-btn" @click="Refresh" size="mini">刷新</button>
            </view>

            <!-- 滚动列表区域 - 核心内容区 -->
            <scroll-view class="table-body" scroll-y>
                <view class="file-item" v-for="record in data" :key="record.id" @click="OpenFile(record)">
                    <view class="file-info">
                        <text class="file-name">{{ record.name }}</text>
                        <!-- 状态存在才显示，无状态不占位，极致简洁 -->
                        <text class="file-status" v-if="record.status">{{ record.status }}</text>
                    </view>
                    <view class="file-size">{{ record.size }}</view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { postAction, engineApi } from "@/api";
import moment from "moment";

// 表格列定义(保留原定义，兼容后续扩展)
const columns = [
    { title: "模型名称(点击预览)", dataIndex: "name", key: "name" },
    { title: "大小", dataIndex: "size", key: "size" }
];

// TS接口 - 完善字段定义，给可选字段默认值，避免undefined
interface Record {
    id: number;
    userId: number;
    name: string;
    uuid: string;
    extension: string;
    path: string;
    size: number;
    createdTimeDate: string;
    updatedTimeDate: string;
    accessTimeDate: string;
    status?: string; // 可选状态字段
}
const screenFullState = ref("no_full");
function fullScreen() {
    let doc = document.querySelector("#app");
    if (doc && !document.fullscreenElement) {
        doc.requestFullscreen();
        screenFullState.value = "full";
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
        screenFullState.value = "no_full";
    }
}
// 表格数据响应式定义
const data = ref<Record[]>([]);

/**
 * 获取最近打开文件列表 - 逻辑优化：async+await 替代then链式，更优雅，加异常捕获
 */
async function getRecentFiles() {
    try {
        const res: any = await postAction(engineApi.FileRecentFiles);
        if (res && res.Data) {
            return res.Data.map((item: any) => {
                // 时间格式化+容错
                item.accessTimeDate = item.accessTimeDate ? moment(item.accessTimeDate).format('YYYY-MM-DD HH:mm:ss') : '';
                // 文件大小格式化 转MB，保留2位小数更简洁，加0值容错
                item.size = item.size ? (item.size / 1024 / 1024).toFixed(2) + "MB" : "0MB";
                // 状态字段容错：无状态则赋值空，避免渲染undefined
                item.status = item.status || '';
                return item as Record;
            });
        }
        return [];
    } catch (error) {
        console.error('获取最近文件失败：', error);
        return [];
    }
}

/**
 * 打开文件预览 - 保留原跳转逻辑+日志，无修改
 */
function OpenFile(record: Record) {
    uni.navigateTo({
        url: `/pages/Engine/ModelView?fileId=${record.uuid}`,
        success: () => console.log('导航成功'),
        fail: (err) => console.error('导航失败:', err)
    });
}

/**
 * 刷新列表 - 整合逻辑，简洁调用
 */
async function Refresh() {
    const files = await getRecentFiles();
    data.value = files;
}

// 页面挂载时加载数据
onMounted(() => Refresh());
</script>

<style scoped>
/* 全局容器 - 页面级间距控制，左右留白，呼吸感十足 核心简洁点 */
.page-container {
    width: 100%;
    padding: 16rpx 24rpx;
    box-sizing: border-box;
}

/* 页面标题 - 居中加粗，字号适中，主次分明 */
.page-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
}

/* 文件列表主体 - 无外边框！无背景色！极致通透，去掉所有冗余装饰 */
.file-table {
    width: 100%;
    border-radius: 12rpx;
    overflow: hidden;
}

/* 表头区域 - 极简浅灰背景，无生硬边框，内边距适中，flex完美布局 */
.table-header {
    display: flex;
    align-items: center;
    padding: 12rpx 24rpx;
    background-color: #f7f8fa;
    font-weight: 600;
    color: #333;
}

/* 名称列 - 占比2/3，左对齐 */
.header-item.name-col {
    flex: 2;
    text-align: left;
}

/* 大小列 - 占比1/3，右对齐 */
.header-item.size-col {
    flex: 1;
    text-align: right;
}

/* 刷新按钮 - 极致精简！无背景/无边框/无内边距，纯文字按钮，不突兀 核心优化 */
.refresh-btn {
    color: #007aff;
    font-size: 22rpx;
    margin-left: 8rpx;
    /* padding: 4rpx;
  min-width: auto;
  width: 60rpx;
  margin-left: 20rpx; */
    background: transparent;
    border: none;
}

.refresh-btn:active {
    color: #0066cc;
    background: #f0f7ff;
    border-radius: 6rpx;
}

/* 滚动列表区域 - 高度适中，滚动顺滑，无生硬限制 */
.table-body {
    width: 100%;
    height: calc(100vh - 120px);
}

/* 文件列表项 - 核心样式！hover反馈+底部细分割线，无其他装饰，极简通透 */
.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    border-bottom: 1px solid #f0f0f0;
    box-sizing: border-box;
}

/* 点击/悬浮反馈 - 轻量背景色，提升交互体验，不破坏简洁 */
.file-item:active {
    background-color: #f5f9ff;
}

/* 文件信息区：名称+状态 组合 */
.file-info {
    display: flex;
    align-items: center;
}

/* 文件名 - 主色调，醒目但不刺眼，字号适中 */
.file-name {
    font-size: 28rpx;
    color: #007aff;
}

/* 文件状态 - 弱化处理，小字浅灰，不抢主体视觉，间距适中 */
.file-status {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
    line-height: 1;
}

/* 文件大小 - 右对齐，浅灰，辅助信息弱化展示 */
.file-size {
    font-size: 26rpx;
    color: #666;
    text-align: right;
}

/* 通用重置 - 去掉所有冗余的默认样式 */
image {
    display: inline-block;
    vertical-align: middle;
}
</style>