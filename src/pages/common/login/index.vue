<template>
  <view>
    <view class="login-form-wrap">
      <view class="title">
        欢迎登录
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
    <view class="hint">
      登录代表同意
      <text class="link">
        用户协议、隐私政策，
      </text>
      并授权使用您的账号信息（如昵称、头像、收获地址）以便您统一管理
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { HOME_PATH, isTabBarPath, LOGIN_PATH, removeQueryString } from '@/router';
import { setToken } from '@/utils/auth';
import CryptoJS from "crypto-js";
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
    password: CryptoJS.SHA1(code.value).toString()
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
  if (options.redirect && removeQueryString(options.redirect) !== LOGIN_PATH) {
    redirect = decodeURIComponent(options.redirect);
  }
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countDownTimer) {
    clearInterval(countDownTimer);
  }
});
</script>

<style lang="scss" scoped>
.login-form-wrap {
  @apply mt-80rpx mx-auto mb-0 w-600rpx;

  .title {
    @apply mb-100rpx text-60rpx text-left font-500;
  }

  .input-border {
    @apply pb-6rpx mb-10rpx text-left border-0 border-b-1 border-b-solid border-b-#e4e7ed;
  }

  .input-wrap {
    @apply pb-6rpx border-0 border-b-1 border-b-solid border-b-#e4e7ed;
  }

  .code-btn {
    @apply py-4rpx px-16rpx text-24rpx bg-transparent border-1 border-solid border-#2979ff text-#2979ff rounded-8rpx;
    
    &:disabled {
      @apply border-#c0c4cc text-#c0c4cc;
    }
  }

  .login-btn {
    @apply flex items-center justify-center py-12rpx px-0 text-30rpx bg-#fdf3d0 border-none w-full rounded-8rpx;

    color: #909399;

    &::after {
      @apply border-none;
    }
  }

  .alternative {
    @apply flex justify-between mt-30rpx;

    color: #909399;
  }
}

.login-type-wrap {
  @apply flex justify-between pt-350rpx px-150rpx pb-150rpx;

  .item {
    @apply flex items-center flex-col text-28rpx;

    color: #606266;
  }
  
  .icon-image {
    @apply w-70rpx h-70rpx mb-10rpx;
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