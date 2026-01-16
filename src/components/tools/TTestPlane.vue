<template>
  <!-- 最外层容器 原生拖拽+固定定位 核心容器 -->
  <view 
    class="setting-root" 
    ref="settingRoot"
    @touchstart="handleDragStart"
    @touchmove="handleDragMove"
    @touchend="handleDragEnd"
    @mousedown="handleDragStart"
    @mousemove="handleDragMove"
    @mouseup="handleDragEnd"
    @mouseleave="handleDragEnd"
  >
    <!-- 原生手写头部区域 替代原TPlaneHeader组件 -->
    <view class="header-root">
      <view class="header-title">测试面板</view>
      <view class="header-close" @click="()=>{toolState.test = false}">×</view>
    </view>

    <!-- 设置内容区 -->
    <view class="setting-content">
      <view class="setting-item">
        <view class="item-left">
          <span>时间推送</span>
          <!-- 纯原生手写开关 替代第三方a-switch 无任何依赖 -->
          <view 
            class="setting-item-switch" 
            @click="handleTestTimeTips"
            :class="{'switch-active': TestTimeTips}"
          >
            <view class="switch-btn" :class="{'btn-active': TestTimeTips}"></view>
          </view>
        </view>
        <view class="item-right">
          <span>{{ TimeTips }}</span>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 开关状态
      TestTimeTips: false,
      // 时间展示文本
      TimeTips: "",
      // 定时器对象
      TestThread: null,
      // 拖拽相关变量
      dragState: {
        isDrag: false,
        startX: 0,
        startY: 0,
        eleX: 0,
        eleY: 0
      },
      // 面板状态（原仓库数据，保留）
      toolState: {
        test: true
      }
    }
  },
  mounted() {
    this.initElePosition()
  },
  methods: {
    // 初始化面板位置
    initElePosition() {
      const query = uni.createSelectorQuery().in(this)
      query.select('.setting-root').boundingClientRect(rect => {
        this.dragState.eleX = rect.left
        this.dragState.eleY = rect.top
      }).exec()
    },
    // 拖拽开始
    handleDragStart(e) {
      this.dragState.isDrag = true
      // 兼容触摸事件和鼠标事件
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      this.dragState.startX = clientX
      this.dragState.startY = clientY
    },
    // 拖拽移动 - 纯原生核心拖拽逻辑
    handleDragMove(e) {
      if (!this.dragState.isDrag) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      // 计算偏移量
      const moveX = clientX - this.dragState.startX
      const moveY = clientY - this.dragState.startY
      // 重新赋值面板位置
      const root = this.$refs.settingRoot
      root.style.left = `${this.dragState.eleX + moveX}px`
      root.style.top = `${this.dragState.eleY + moveY}px`
    },
    // 拖拽结束
    handleDragEnd(e) {
      if (!this.dragState.isDrag) return
      this.dragState.isDrag = false
      // 记录拖拽后的最终位置
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY
      this.dragState.eleX += clientX - this.dragState.startX
      this.dragState.eleY += clientY - this.dragState.startY
    },
    // 开关切换核心逻辑 - 保留原业务逻辑不变
    handleTestTimeTips() {
      this.TestTimeTips = !this.TestTimeTips
      if (this.TestTimeTips) {
        // 先清除防止重复定时器
        if (this.TestThread) clearInterval(this.TestThread)
        this.TestThread = setInterval(() => {
          let now = Date.now();
          this.TimeTips = new Date().toISOString();
          // 保留原mqtt消息发送方法
          Medusa.SendMqttMessage(now)
        }, 10);
      } else {
        // 关闭开关清除定时器
        if (this.TestThread) clearInterval(this.TestThread)
      }
    }
  }
}
</script>

<style scoped>
/* 根容器样式 - 原样式适配修改 */
.setting-root {
  color: #FFF;
  width: 330px;
  height: 340px;
  background-color: #324985;
  position: fixed;
  top: 50%;
  right: 300px;
  transform: translate(-50%, -50%);
  border: #3471cb solid 1px;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  cursor: move;
  box-sizing: border-box;
}

/* 原生手写头部样式 替代TPlaneHeader组件 */
.header-root {
  width: 100%;
  height: 40px;
  line-height: 40px;
  padding: 0 15px;
  background-color: #293c70;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3471cb;
  box-sizing: border-box;
}
.header-title {
  font-size: 16px;
  font-weight: 500;
}
.header-close {
  font-size: 20px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.header-close:active {
  background-color: rgba(255,255,255,0.2);
  border-radius: 50%;
}

/* 内容区样式 */
.setting-content {
  background-color: #506498;
  margin-bottom: 28px;
  margin-left: 10px;
  margin-right: 10px;
  padding-top: 10px;
}

/* 设置项样式 */
.setting-item {
  background-color: #3b5997;
  font-size: 14px;
  padding: 0 10px;
	height: 38px;
	margin-bottom: 1px;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
  box-sizing: border-box;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.item-right {
  color: #c9d2e8;
  font-size: 12px;
}

/* 纯原生手写开关样式 无任何组件依赖 完美替代a-switch */
.setting-item-switch {
  width: 60px;
  height: 26px;
  border-radius: 13px;
  background-color: #8a9bc7;
  position: relative;
  transition: background-color 0.3s ease;
}
.setting-item-switch.switch-active {
  background-color: #3471cb;
}
.switch-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #fff;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: left 0.3s ease;
}
.switch-btn.btn-active {
  left: 36px;
}
</style>