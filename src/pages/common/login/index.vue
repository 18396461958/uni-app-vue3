<template>
  <view class="page-root">
    <view class="login-form-wrap">
      <img src="/static/images/logo_login.png" alt=""
        style="height: 150px;width: 80vw;max-width: 400px;position: absolute;z-index: 0;border-radius: 40rpx;">
      <view style="position: absolute;z-index: 99;top:52%;left: 50%;transform: translate(-50%,-50%);width: 80vw;">
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
    </view>
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

// 手机号验证函数 - 已注释，适配邮箱登录，如需手机号登录可放开
const validateMobile = (mobile: string): boolean => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(mobile);
};

// ✅ 核心修改：登录按钮激活态 科技色替换原橙色
const inputStyle = computed<CSSProperties>(() => {
  const style = {} as CSSProperties;
  if (tel.value && code.value) {
    style.color = '#FFFFFF'; // 文字强制白色
    // 科技蓝主色 - 极光蓝 适配深色背景科技感拉满
    style.backgroundColor = '#0099FF';
    // 科技渐变优化：hover/激活态渐变，可选开启
    style.background = 'linear-gradient(90deg, rgb(14 48 111) 0%, rgb(19 86 154) 100%);';
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

  // ✅ 修复bug：邮箱登录时，注释手机号校验，否则会拦截提示错误
  // if (!validateMobile(tel.value)) {
  //   uni.showToast({
  //     title: '请输入正确的手机号',
  //     icon: 'none'
  //   });
  //   return;
  // }

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
  background: url("/static/images/pic_bg_login_box@2x.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: #0b193f;
}

.login-form-wrap {
  @apply mx-auto mb-0 w-600rpx;
  margin-top: 60rpx;
  flex-shrink: 0;

  .title {
    @apply mb-80rpx text-60rpx text-left font-600;
    // ✅ 字体改为纯白色 + 科技感文字阴影
    color: #FFFFFF;
    letter-spacing: 2rpx;
    font-size: 24px;
    margin-top: 48px;
    text-shadow: 0 0 10rpx rgba(0, 153, 255, 0.5);
    z-index: 1;
  }

  // 账号输入框 - 圆润下划线+白色半透边框+内边距优化
  .input-border {
    @apply pb-8rpx pt-4rpx mb-10rpx text-left border-0 border-b-1 border-b-solid text-30rpx;
    // ✅ 白色半透边框+白色文字+科技色光标
    border-color: rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
    caret-color: #0099FF;

    &::placeholder {
      // ✅ 占位符半透白色 科技风适配
      color: rgba(255, 255, 255, 0.7);
    }
  }

  // 验证码/密码输入框容器 - 同风格白色半透下划线
  .input-wrap {
    @apply pb-8rpx pt-4rpx border-0 border-b-1 border-b-solid text-30rpx;
    border-color: rgba(255, 255, 255, 0.3);

    & input {
      color: #FFFFFF;
    }

    & input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  // ✅ 科技色 验证码按钮 极致圆润胶囊款+移动端触控优化
  .code-btn {
    @apply py-8rpx px-20rpx text-26rpx bg-transparent border-1 border-solid rounded-20rpx;
    // ✅ 科技蓝边框+纯白色文字 核心科技色
    border-color: #0099FF;
    color: #FFFFFF;
    min-width: 180rpx;
    margin-left: 10rpx;
    background-color: rgba(0, 153, 255, 0.1);

    // ✅ 修复原语法错误 + 禁用态科技风浅白样式
    &:disabled {
      border-color: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.5);
      background-color: rgba(255, 255, 255, 0.05);
    }

    // 按压反馈-科技色加深
    &:active {
      background: rgba(0, 153, 255, 0.3);
    }
  }

  // ✅ 核心优化：登录按钮 超大圆角+科技风+无默认边框+完美触控尺寸
  .login-btn {
    @apply flex items-center justify-center py-20rpx px-0 text-32rpx border-none w-full rounded-24rpx mt-60rpx font-500;
    // ✅ 默认态：浅白文字+浅蓝透背景 科技风禁用态
    color: rgba(255, 255, 255, 0.7);
    background: linear-gradient(90deg, rgb(14 48 111) 0%, rgb(19 86 154) 100%);

    // 清除uniapp默认按钮边框
    &::after {
      @apply border-none;
    }

    // 激活态加深一点 提升科技质感
    &:active {
      opacity: 0.92;
    }
  }

  // ✅ 底部选项 - 纯白色文字+科技按压态
  .alternative {
    @apply flex justify-between mt-40rpx text-26rpx;
    color: #FFFFFF;

    .password,
    .issue {
      padding: 8rpx 12rpx;
      border-radius: 12rpx;
    }

    .password:active,
    .issue:active {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.login-type-wrap {
  @apply flex justify-between pt-350rpx px-150rpx pb-150rpx;

  .item {
    @apply flex items-center flex-col text-28rpx;
    color: rgba(255, 255, 255, 0.7);
  }

  .icon-image {
    @apply w-70rpx h-70rpx mb-10rpx rounded-16rpx;
  }
}

.hint {
  @apply px-40rpx py-20rpx text-24rpx;
  color: rgba(255, 255, 255, 0.7);

  .link {
    color: #0099FF;
  }
}
</style>