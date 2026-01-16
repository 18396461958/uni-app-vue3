<template>
  <view class="setting-root" ref="settingRoot">
    <!-- 原生手写【新增视角】弹窗 - 替代原a-modal，纯原生实现 -->
    <view class="modal-mask" v-if="open" @click="open = false"></view>
    <view class="modal-box" v-if="open">
      <view class="modal-title">视角名称</view>
      <view class="modal-input-wrap">
        <!-- 原生输入框 替代原a-input -->
        <input type="text" class="native-input" v-model="inputName" placeholder="请输入视角名称" />
      </view>
      <view class="modal-btn-group">
        <view class="modal-btn cancel-btn" @click="open = false">取消</view>
        <view class="modal-btn confirm-btn" @click="AddViewPoint">确定</view>
      </view>
    </view>

    <!-- 头部组件 保留原引用，无改动 -->
    <TPlaneHeader @mousedown="dragHelper.startDrag" @close="() => { ToolStore.ViewPoint = false }" :title="'视角管理'" />

    <view class="setting-content">
      <!-- 新增视角按钮 原生替代原PlusOutlined图标 -->
      <view class="item-title" @click="()=>{open = true}">
        <text class="icon-plus">+</text>
        <span style="margin-left: 10px;">新增视角</span>
      </view>

      <!-- 视角列表循环项 -->
      <view class="setting-item" v-for="(item, index) in viewPoints" :key="index">
        <view style="margin-top: 10px; margin-left: 10px;">
          {{ item.name }}
        </view>
        <image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)"></image>
        <view class="item-bottom">
          {{ formatDate(item.createdTimDate) }}
          <!-- 原生删除按钮 替代原DeleteOutlined + a-popconfirm，纯原生确认删除弹窗 -->
          <view class="icon-select" style="color: red;" @click="()=>{ delItem = item; delShow = true }">✕</view>
        </view>
      </view>
    </view>

    <!-- 原生手写【删除确认】弹窗 - 替代原a-popconfirm，纯原生实现，无任何组件库 -->
    <view class="pop-mask" v-if="delShow" @click="delShow = false"></view>
    <view class="pop-box" v-if="delShow">
      <view class="pop-title">确定要删除吗？</view>
      <view class="pop-btn-group">
        <view class="pop-btn cancel-pop-btn" @click="delShow = false">取消</view>
        <view class="pop-btn confirm-pop-btn" @click="handleDelConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { DragHelper } from '@/utils/DragHelper';
import TPlaneHeader from './TPlaneHeader.vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { Medusa } from '@/static/engine.sdk';

export default {
  components: { TPlaneHeader },
  data() {
    return {
      inputName: "", // 新增视角的名称输入值
      open: false, // 新增弹窗显隐
      delShow: false, // 删除确认弹窗显隐
      delItem: null, // 当前要删除的视角项
      viewPoints: [], // 视角列表数据
      modelIds: [], // 模型ID数组
      settingRoot: null, // 根节点ref
      dragHelper: null, // 拖拽实例
      ToolStore: useToolPlaneStore() // 全局仓库
    }
  },
  created() {
    this.initDrag();
  },
  watch: {
    // 监听仓库的显示状态，和原代码逻辑一致
    'ToolStore.ViewPoint'(newVal) {
      if (newVal) {
        Medusa.GetModelListAsync().then((res) => {
          this.initData(res);	
        });
        this.settingRoot.style.zIndex = this.ToolStore.DivIndex++ + "";
      }
    }
  },
  methods: {
    // 初始化拖拽实例
    initDrag() {
      this.settingRoot = this.$refs.settingRoot;
      this.dragHelper = new DragHelper(this.settingRoot);
    },
    // 新增视角 原逻辑完全保留
    AddViewPoint() { 
      this.open = false;
      Medusa.GetCameraView((view) => {
        let img = Medusa.GetCameraImg();
        postAction("/ViewPoint/AddViewPoint",  { 
          name: this.inputName, 
          modelId: this.modelIds[0], 
          view: view, 
          image: img 
        }).then((res) => {
          this.viewPoints.push(res);
          this.inputName = ""; // 清空输入框
        });
      });
    },
    // 视角缩放/跳转 原逻辑完全保留
    ZoomView(item) {
      Medusa.SetCameraView(item.view);
    },
    // 删除视角 原逻辑完全保留
    deleteView(item) {
      postAction("/ViewPoint/DeleteViewPoint", { value: item.id }).then(() => {
        // 原生提示 替代antd的message.success
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500,
          mask: false
        });
        this.viewPoints = this.viewPoints.filter((view) => view.id != item.id);
      });
    },
    // 确认删除的回调
    handleDelConfirm() {
      this.deleteView(this.delItem);
      this.delShow = false;
      this.delItem = null;
    },
    // 初始化视角数据 原逻辑完全保留
    initData(modelId) {
      this.modelIds = modelId;
      postAction("/ViewPoint/GetViewPointByModels", { value: modelId }).then((res) => {
        this.viewPoints = [];
        this.viewPoints.push(...res);
      })
    },
    // 原生日期格式化方法【替代moment】，纯JS实现，无任何依赖
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
  }
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
  font-size: 18px;
  line-height: 1;
}

.icon-select:hover {
  background-color: #355ea8;
}

.icon-plus {
  font-size: 16px;
  font-weight: bold;
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

/* 新增弹窗-纯原生样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
}
.modal-box {
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
  font-weight: 500;
}
.native-input {
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
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.modal-btn {
  padding: 6px 12px;
  cursor: pointer;
  background: #355ea8;
  border-radius: 2px;
}
.confirm-btn {
  background: #3471cb;
}

/* 删除确认弹窗-纯原生样式 */
.pop-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
	background: rgba(0,0,0,0.3);
  z-index: 9999;
}
.pop-box {
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
.pop-title {
  font-size: 14px;
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
}
.pop-btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.pop-btn {
  padding: 6px 20px;
  cursor: pointer;
  background: #355ea8;
  border-radius: 2px;
}
.confirm-pop-btn {
  color: #ff4d4f;
}
</style>