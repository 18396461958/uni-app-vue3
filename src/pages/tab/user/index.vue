<template>
  <view class="page-wrap">
    <!-- 原生实现 原u-navbar 导航栏：无左侧图标、右侧相机图标、无标题、占位适配状态栏 -->
    <view class="native-navbar">
      <view class="navbar-right">
        <uni-icons type="camera-filled" size="24" color="#333"></uni-icons>
      </view>
    </view>

    <!-- 顶部头像+信息区域 原布局不变 -->
    <view class="flex items-center pb-30rpx pl-30rpx pr-20rpx">
      <view class="mr-10rpx">
        <!-- 原生实现 u-avatar 头像组件 -->
        <view class="native-avatar">
          <image src="/static/images/logo.png" mode="widthFix"></image>
        </view>
      </view>
      <view class="flex-1">
        <view class="pb-20rpx text-36rpx">
          uni-app
        </view>
        <view class="tips-color text-28rpx" @click="toCopy">
          微信号:uni-app
        </view>
      </view>
      <view class="ml-10rpx p-10rpx">
        <!-- 原生实现 u-icon 扫码图标 -->
        <uni-icons type="scan" size="22" color="#969799"></uni-icons>
      </view>
      <view class="ml-10rpx p-10rpx">
        <!-- 原生实现 u-icon 右箭头图标 -->
        <uni-icons type="arrowright" size="22" color="#969799"></uni-icons>
      </view>
    </view>

    <!-- 原生实现 原u-cell-group + u-cell 支付模块 -->
    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="moneybag" size="22" color="#666"></uni-icons>
          <view class="cell-title">支付</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 原生实现 原u-cell-group + u-cell 收藏/相册等模块 -->
    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="star" size="22" color="#666"></uni-icons>
          <view class="cell-title">收藏</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="image" size="22" color="#666"></uni-icons>
          <view class="cell-title">相册</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="ticket" size="22" color="#666"></uni-icons>
          <view class="cell-title">卡券</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="heart" size="22" color="#666"></uni-icons>
          <view class="cell-title">关注</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 原生实现 原u-cell-group + u-cell 设置模块 -->
    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick">
          <uni-icons class="cell-icon" type="setting" size="22" color="#666"></uni-icons>
          <view class="cell-title">设置</view>
          <uni-icons class="cell-arrow" type="arrowright" size="20" color="#969799"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useClipboard, usePermission } from '@/hooks';

const { setClipboardData, getClipboardData } = useClipboard();

// 复制微信号 原逻辑不变
const toCopy = async () => {
  await setClipboardData({ data: '1234567890' });
  const data = await getClipboardData();
  console.log('[ data ] >', data);
};

// 单元格点击事件（原is-link的跳转逻辑，可根据业务自行补充路由跳转）
const handleCellClick = () => {
  // 示例：uni.navigateTo({ url: '/pages/xxx/xxx' })
  console.log('单元格被点击');
};

// 登录鉴权 原逻辑不变
onShow(async () => {
  const hasPermission = await usePermission();
  console.log(hasPermission ? '已登录' : '未登录，拦截跳转');
});
</script>

<style lang="scss" scoped>
.page-wrap {
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
}

// flex布局公共样式 还原原代码的flex/items-center
.flex {
  display: flex;
  align-items: center;
}
.items-center {
  align-items: center;
}
.flex-1 {
  flex: 1;
}
.mr-10rpx {
  margin-right: 10rpx;
}
.ml-10rpx {
  margin-left: 10rpx;
}
.p-10rpx {
  padding: 10rpx;
}
.pb-30rpx {
  padding-bottom: 30rpx;
}
.pl-30rpx {
  padding-left: 30rpx;
}
.pr-20rpx {
  padding-right: 20rpx;
}
.mt-20rpx {
  margin-top: 20rpx;
}
.text-36rpx {
  font-size: 36rpx;
  color: #333;
}
.text-28rpx {
  font-size: 28rpx;
}
// 还原原u-tips-color样式
.tips-color {
  color: #969799;
}

// 原生导航栏样式 还原u-navbar的占位+右侧相机图标
.native-navbar {
  width: 100%;
  height: var(--status-bar-height);
  box-sizing: border-box;
  padding: 0 20rpx;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .navbar-right {
    padding: 10rpx;
  }
}

// 原生头像样式 1:1还原u-avatar size=70的圆形头像
.native-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  overflow: hidden;
  image {
    width: 100%;
    height: 100%;
  }
}

// 原生单元格组样式 还原u-cell-group的容器样式
.native-cell-group {
  background-color: #fff;
  border-radius: 16rpx;
  margin: 0 20rpx;
  overflow: hidden;
}

// 原生单元格样式 1:1还原u-cell的样式+点击态+图标+标题+箭头
.native-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 24rpx;
  box-sizing: border-box;
  position: relative;
  // 单元格分割线 还原u-cell的下划线
  &::after {
    content: '';
    position: absolute;
    left: 24rpx;
    bottom: 0;
    width: calc(100% - 48rpx);
    height: 1rpx;
    background-color: #f0f0f0;
  }
  // 最后一个单元格去掉分割线
  &:last-child::after {
    display: none;
  }
  // 点击态 还原u-cell的is-link点击效果
  &:active {
    background-color: #f8f8f8;
  }
  // 单元格左侧图标
  .cell-icon {
    margin-right: 20rpx;
  }
  // 单元格标题
  .cell-title {
    font-size: 30rpx;
    color: #333;
    flex: 1;
    text-align: left;
  }
  // 单元格右侧箭头
  .cell-arrow {
    flex-shrink: 0;
  }
}
</style>