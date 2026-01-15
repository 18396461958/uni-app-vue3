<template>
  <view class="not-found">
    <!-- 原生自定义导航栏 返回按钮 -->
    <view class="custom-nav" @click="handleBack">
     < 返回
    </view>
    
    <!-- 原生替代 u-empty 404 空页面展示 -->
    <view class="empty-box">
      <image class="empty-icon" src="/static/images/404.png" mode="widthFix"></image>
      <text class="empty-text">页面不存在</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { HOME_PATH } from '@/router';

/**
 * 返回首页逻辑 完全等效原 uni.$u.route({type:'switchTab',url:xxx})
 */
const handleBack = () => {
  uni.reLaunch({
    url: HOME_PATH
  })
};
</script>

<style lang="scss" scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding-top: 88rpx;
}

// 原生自定义导航栏样式 还原u-navbar左侧按钮尺寸/点击区域
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 88rpx;
  padding-left: 30rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

// 404空页面样式 完全还原u-empty的参数(width/height=380、text-size=20)
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.empty-icon {
  width: 380rpx;
  height: 380rpx;
}
.empty-text {
  font-size: 20rpx;
  color: #999;
  margin-top: 30rpx;
}
</style>