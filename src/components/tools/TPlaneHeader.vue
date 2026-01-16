<template>
    <view class="setting-title">
        <view class="setting-title-content">
            <image src="@/static/icons/pic_title_icon@3x.png" style="width: 20px; height: 20px;" />
            <span style="margin-left: 5px;">{{ title }}</span>
        </view>
        <image class="setting-title-close" src="@/static/icons/icon_close@3x.png" @click="close" style="width: 16px; height: 16px;" />
    </view>
</template>

<script lang="ts" setup>
defineProps({
    title: {
        type: String,
        default: '设置', // 去掉多语言，默认值改为中文
    },
});

const emit = defineEmits(['close']);
const close = () => {
    emit('close');
};
</script>

<style scoped>
.setting-title {
    margin-top: 14px;
    margin-left: 10px;
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 10px;
    height: 40px;
    display: flex;
    background-color: #355ea8;
    font-size: 14px;
    flex-direction: row;
    align-items: center;
    border: none;
    border-bottom: #61a6e1 solid 1px;
    justify-content: space-between;
    box-sizing: border-box;
}

.setting-title-content {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.setting-title-close {
    border-radius: 50%;
}
</style>