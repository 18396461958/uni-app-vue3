<template>
  <view class="page-root">
    <view class="login-form-wrap">
      <view class="title">
        欢迎使用Medusa引擎
      </view>
      <input v-model="tel" class="input-border" placeholder="请输入账号">
      <view class="input-wrap my-40rpx flex">
        <input v-model="code" class="flex-1" placeholder="请输入密码">
        <view>
          <button class="code-btn" :disabled="countDown > 0" @click="getCode">
            {{ countDown > 0 ? `${countDown}s后重新获取` : '获取验证码' }}
          </button>
        </view>
      </view>
      <button class="login-btn" :style="[inputStyle]" @tap="submit">
        登录
      </button>

      <view class="alternative">
        <view class="password">
          密码登录
        </view>
        <view class="issue flex items-center">
          遇到问题
        </view>
      </view>
    </view>
    <!-- <view class="hint">
      登录代表同意
      <text class="link">
        用户协议、隐私政策，
      </text>
      并授权使用您的账号信息（如昵称、头像、收获地址）以便您统一管理
    </view> -->
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { HOME_PATH, isTabBarPath, LOGIN_PATH, removeQueryString } from '@/router';
import { setToken } from '@/utils/auth';
import SHA1 from "@/utils/sha1";
import { UserApi } from '@/api';

const tel = ref<string>('mqwang@digitwinstech.com');
const code = ref<string>('1234');
const countDown = ref<number>(0);
let countDownTimer: number | null = null;
let redirect = HOME_PATH;

// 手机号验证函数
const validateMobile = (mobile: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(mobile);
};

const inputStyle = computed<CSSProperties>(() => {
  const style = {} as CSSProperties;
  if (tel.value && code.value) {
    style.color = '#fff';
    style.backgroundColor = '#ff7900'; // 替换原来的警告色
  }
  return style;
});

// 倒计时函数
const startCountDown = (seconds: number = 60) => {
  countDown.value = seconds;
  countDownTimer = setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(countDownTimer as number);
      countDownTimer = null;
    }
  }, 1000);
};

function getCode() {
  if (countDown.value > 0) return;
  
  // 手机号验证
  if (!validateMobile(tel.value)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }
  
  // 模拟向后端请求验证码
  uni.showLoading({
    title: '正在获取验证码',
  });
  
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
    // 开始倒计时
    startCountDown();
  }, 1000);
}

async function submit() {
  // 表单验证
  
  if (!code.value) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    });
    return;
  }
  
  // 登录请求
  const res = await UserApi.login({
    account: {
      account: tel.value, 
      accountType: "Email"
    }, 
    password: SHA1(code.value).toString()
  }).catch(() => {
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    });
  });
  
  if (!res) return;
  setToken(res.Data.token);
  
  // 页面跳转
  if (isTabBarPath(redirect)) {
    uni.switchTab({
      url: redirect
    });
  } else {
    uni.redirectTo({
      url: redirect
    });
  }
}

onLoad((options: any) => {
  // if (options.redirect && removeQueryString(options.redirect) !== LOGIN_PATH) {
  //   redirect = decodeURIComponent(options.redirect);
  // }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countDownTimer) {
    clearInterval(countDownTimer);
  }
});
</script>

<style lang="scss" scoped>
// 根容器 核心：实现整体页面 居中偏上 布局
.page-root {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  box-sizing: border-box;
}

.login-form-wrap {
  @apply mx-auto mb-0 w-600rpx;
  // ✅ 核心调整：上间距减少+适中 实现居中偏上，视觉重心完美
  margin-top: 60rpx;
  flex-shrink: 0;

  .title {
    @apply mb-80rpx text-60rpx text-left font-600;
    color: #333;
    letter-spacing: 2rpx;
    font-size: 24px;
    margin-top: 48px
  }

  // 账号输入框 - 圆润下划线+柔和边框+内边距优化
  .input-border {
    @apply pb-8rpx pt-4rpx mb-10rpx text-left border-0 border-b-1 border-b-solid text-30rpx;
    border-color: #E5E6EB;
    caret-color: #ff7900;
    &::placeholder {
      color: #C0C4CC;
    }
  }

  // 验证码/密码输入框容器 - 同风格柔和下划线
  .input-wrap {
    @apply pb-8rpx pt-4rpx border-0 border-b-1 border-b-solid text-30rpx;
    border-color: #E5E6EB;
    & input::placeholder {
      color: #C0C4CC;
    }
  }

  // ✅ 验证码按钮 极致圆润胶囊款+移动端触控优化+柔和配色
  .code-btn {
    @apply py-8rpx px-20rpx text-26rpx bg-transparent border-1 border-solid rounded-20rpx;
    border-color: #2979ff;
    color: #2979ff;
    min-width: 180rpx;
    margin-left: 10rpx;
    
    &:disabled {
      @apply border-#E5E6EB text-#C0C4CC bg-#F7F8FA;
    }
    // 按压反馈
    &:active {
      background: #E8F3FF;
    }
  }

  // ✅ 核心优化：登录按钮 超大圆角+圆润质感+无默认边框+完美触控尺寸
  .login-btn {
    @apply flex items-center justify-center py-20rpx px-0 text-32rpx border-none w-full rounded-24rpx mt-60rpx font-500;
    color: #909399;
    background: #fdf3d0;
    // 清除uniapp默认按钮边框
    &::after {
      @apply border-none;
    }
    // 激活态加深一点 提升质感
    &:active {
      opacity: 0.92;
    }
  }

  // 底部选项 - 圆润柔和配色+间距优化
  .alternative {
    @apply flex justify-between mt-40rpx text-26rpx;
    color: #666;
    .password, .issue {
      padding: 8rpx 12rpx;
      border-radius: 12rpx;
    }
    .password:active, .issue:active {
      background: #F2F3F5;
    }
  }
}

.login-type-wrap {
  @apply flex justify-between pt-350rpx px-150rpx pb-150rpx;

  .item {
    @apply flex items-center flex-col text-28rpx;
    color: #606266;
  }
  
  .icon-image {
    @apply w-70rpx h-70rpx mb-10rpx rounded-16rpx;
  }
}

.hint {
  @apply px-40rpx py-20rpx text-24rpx;
  color: #909399;
  .link {
    color: #ff7900;
  }
}
</style>