<template>
  <view class="page-wrap">
    <!-- 原生实现 导航栏：无左侧图标、右侧相机图标(引擎日志截图)、无标题、占位适配状态栏 -->
    <view class="native-navbar">
      <view class="navbar-right">
        <view class="icon camera-filled" style="font-size:24px;color:#333;"></view>
      </view>
    </view>

    <!-- 顶部头像+引擎信息区域 原布局不变 内容改为引擎专属 -->
    <view class="flex items-center pb-30rpx pl-30rpx pr-20rpx" style="margin-top: 35rpx;">
      <view class="mr-10rpx">
        <!-- 原生实现 头像组件 - 引擎LOGO -->
        <view class="native-avatar">
          <image src="/static/images/logo.png" mode="widthFix"></image>
        </view>
      </view>
      <view class="flex-1">
        <view class="pb-6rpx text-36rpx font-bold">
          Medusa引擎
        </view>
        <view class="text-24rpx tips-color">
          v3.8.2 稳定运行中
        </view>
      </view>
      <view class="ml-10rpx p-10rpx" @click="handleEngineRefresh">
        <!-- 原生替代 刷新图标 - 引擎刷新/重载 -->
        <view class="icon reload" style="font-size:22px;color:#969799;"></view>
      </view>
      <view class="ml-10rpx p-10rpx" @click="handleEngineMenu">
        <!-- 原生替代 右箭头图标 - 引擎更多菜单 -->
        <view class="icon arrowright" style="font-size:22px;color:#969799;"></view>
      </view>
    </view>

    <!-- 原生实现 引擎核心操作模块 -->

    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick('engineStart')">
          <view class="cell-icon icon play-circle" style="font-size:22px;color:#19be6b;"></view>
          <view class="cell-title">启动引擎</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <view class="native-cell" @click="handleCellClick('engineStop')">
          <view class="cell-icon icon pause-circle" style="font-size:22px;color:#ed4014;"></view>
          <view class="cell-title">停止引擎</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <view class="native-cell" @click="handleCellClick('engineRestart')">
          <view class="cell-icon icon refresh" style="font-size:22px;color:#0088ff;"></view>
          <view class="cell-title">重启引擎</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
      </view>
    </view>

    <!-- 原生实现 引擎配置与数据模块 -->
    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick('engineConfig')">
          <view class="cell-icon icon gear" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">引擎配置</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <view class="native-cell" @click="handleCellClick('cacheClear')">
          <view class="cell-icon icon trash" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">缓存清理</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <!-- <view class="native-cell" @click="handleCellClick('engineLog')">
          <view class="cell-icon icon file-text" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">运行日志</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view> -->
        <!-- <view class="native-cell" @click="handleCellClick('dataBackup')">
          <view class="cell-icon icon download" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">数据备份</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view> -->
      </view>
    </view>

    <!-- 原生实现 引擎插件与服务模块 -->
    <!-- <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick('pluginManage')">
          <view class="cell-icon icon layers" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">插件管理</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <view class="native-cell" @click="handleCellClick('versionUpdate')">
          <view class="cell-icon icon cloud-download" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">版本更新</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
        <view class="native-cell" @click="handleCellClick('engineMonitor')">
          <view class="cell-icon icon bar-chart" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">运行监控</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
      </view>
    </view> -->

    <!-- 原生实现 引擎系统设置模块 -->
    <view class="mt-20rpx">
      <view class="native-cell-group">
        <view class="native-cell" @click="handleCellClick('systemSetting')">
          <view class="cell-icon icon setting" style="font-size:22px;color:#666;"></view>
          <view class="cell-title">系统设置</view>
          <view class="cell-arrow icon arrowright" style="font-size:20px;color:#969799;"></view>
        </view>
      </view>
    </view>

    <!-- ✅ 新增：底部全屏红色退出登录大按钮 -->
    <view class="logout-btn-wrap mt-60rpx mb-40rpx">
      <view class="logout-btn" @click="handleLogout">
        <view class="icon logout" style="font-size:26px;color:#fff;margin-right:12rpx;"></view>
        <view class="logout-text">退出登录</view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { usePermission } from '@/hooks';
import { clearToken } from '@/utils';

// 引擎刷新/重载事件
const handleEngineRefresh = () => {
  uni.showToast({ title: '引擎刷新中...', icon: 'loading', duration: 1500 });
  console.log('执行引擎刷新、配置重载操作');
};

// 引擎更多菜单事件
const handleEngineMenu = () => {
  console.log('打开引擎更多操作菜单');
};

// 引擎核心操作方法 - 可根据实际业务补充完整逻辑
const engineStart = async () => {
  uni.showLoading({ title: '启动引擎中' });
  try {
    // 真实业务：调用引擎启动接口/执行启动脚本
    await new Promise(resolve => setTimeout(resolve, 1200));
    uni.hideLoading();
    uni.showToast({ title: '引擎启动成功', icon: 'success' });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: '引擎启动失败', icon: 'error' });
  }
};
const engineStop = async () => {
  uni.showLoading({ title: '停止引擎中' });
  try {
    await new Promise(resolve => setTimeout(resolve, 1200));
    uni.hideLoading();
    uni.showToast({ title: '引擎已停止', icon: 'success' });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: '引擎停止失败', icon: 'error' });
  }
};
const engineRestart = async () => {
  uni.showLoading({ title: '重启引擎中' });
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    uni.hideLoading();
    uni.showToast({ title: '引擎重启成功', icon: 'success' });
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: '引擎重启失败', icon: 'error' });
  }
};

// 单元格点击事件 - 引擎功能路由/操作分发（精准匹配各功能）
const handleCellClick = (type: string) => {
  console.log(`触发引擎操作：${type}`);
  switch (type) {
    case 'engineStart': engineStart(); break;
    case 'engineStop': engineStop(); break;
    case 'engineRestart': engineRestart(); break;
    case 'engineConfig': uni.navigateTo({ url: '/pages/engine/config/config' }); break;
    case 'cacheClear': uni.showToast({ title: '缓存清理完成', icon: 'success' }); break;
    case 'engineLog': uni.navigateTo({ url: '/pages/engine/log/log' }); break;
    case 'dataBackup': uni.navigateTo({ url: '/pages/engine/backup/backup' }); break;
    case 'pluginManage': uni.navigateTo({ url: '/pages/engine/plugin/plugin' }); break;
    case 'versionUpdate': uni.navigateTo({ url: '/pages/engine/update/update' }); break;
    case 'engineMonitor': uni.navigateTo({ url: '/pages/engine/monitor/monitor' }); break;
    case 'systemSetting': uni.navigateTo({ url: '/pages/engine/setting/setting' }); break;
    default: uni.showToast({ title: '功能开发中', icon: 'none' }); break;
  }
};

// ✅ 新增：退出登录核心事件【完整保留、可直接扩展业务】
const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmColor: '#ed4014',
    async success(res) {
      if (res.confirm) {
        // 点击【确定】执行退出逻辑
        uni.showLoading({ title: '退出中...' });
        try {
          clearToken();
          
          uni.hideLoading();
          uni.showToast({ title: '退出成功', icon: 'success', duration: 1500 });
          // 退出后跳转登录页，禁止返回上一页
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/login' });
          }, 1500);
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: '退出失败，请重试', icon: 'error' });
          console.error('退出登录异常：', error);
        }
      }
    }
  })
};

// 引擎鉴权+状态检测 页面展示时执行
onShow(async () => {
  const hasPermission = await usePermission();
  if (hasPermission) {
    console.log('引擎管理权限通过，加载引擎状态');
    // 真实业务：获取引擎当前运行状态、版本信息、配置信息等
  } else {
    console.log('无引擎管理权限，拦截操作');
    uni.showToast({ title: '无管理权限', icon: 'error' });
    uni.navigateBack();
  }
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
.pb-6rpx {
  padding-bottom: 6rpx;
}
.text-36rpx {
  font-size: 36rpx;
  color: #333;
}
.text-30rpx {
  font-size: 30rpx;
}
.text-24rpx {
  font-size: 24rpx;
}
.font-bold {
  font-weight: 600;
}
// 提示文本颜色
.tips-color {
  color: #969799;
}

// 原生导航栏样式 还原u-navbar的占位+右侧相机图标
.native-navbar {
  width: 100%;
  height: 40px;
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

// 核心：所有引擎相关的原生字体图标样式（Unicode 完美匹配uni-icons）
.icon {
  font-family: "uniicons" !important;
  font-size: inherit;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
}
// 引擎页面用到的所有图标Unicode
// .camera-filled::before { content: "\e618"; }
// .reload::before { content: "\e86a"; }
// .arrowright::before { content: "\e583"; }
// .play-circle::before { content: "\e642"; }
// .pause-circle::before { content: "\e643"; }
// .refresh::before { content: "\e877"; }
// .gear::before { content: "\e699"; }
// .trash::before { content: "\e62d"; }
// .file-text::before { content: "\e635"; }
// .download::before { content: "\e60c"; }
// .layers::before { content: "\e680"; }
// .cloud-download::before { content: "\e610"; }
// .bar-chart::before { content: "\e868"; }
// .setting::before { content: "\e637"; }
// ✅ 新增：退出登录图标unicode
//.logout::before { content: "\e646"; }

// ✅ 新增：退出登录按钮完整样式 (红色主题 全屏大按钮)
.logout-btn-wrap {
  padding: 0 20rpx;
  width: 100%;
  box-sizing: border-box;
}
.logout-btn {
  width: 100%;
  background-color: #ed4014; // 和停止引擎统一红色
  color: #fff;
  text-align: center;
  padding: 32rpx 0;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  // 点击按压态 深色反馈
  &:active {
    background-color: #d83610;
  }
}
.logout-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
}
</style>