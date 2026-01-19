<template>
    <view class="tool-root">
        <THome @click="handleHomeClick" />
        <image src="@/static/icons/icon_title_add@2x.png" mode="widthFix" style="height: 30px;width: 30px;cursor: pointer;" @click="Big" @touch="Big"/>
        <image src="@/static/icons/icon_title_sub@2x.png" mode="widthFix" style="height: 30px;width: 30px;cursor: pointer;" @click="Small" @touch="Small"/>
        <!-- <TSection />
        <TRoam />
        <TMeasure />
        <TViewPoint/>
        <TMarker/> -->
        <!-- <THide /> -->
        <TTree />
        <TProperties />
        <!-- <TElementOpt /> -->
        <TSetting/>
        <!-- <TTest/> -->
    </view>
</template>

<script lang="ts" setup>
import THome from "./THome.vue";
import TSection from "./TSection.vue";
import THide from "./THide.vue";
import TProperties from "./TProperties.vue";
import TTree from "./TTree.vue";
import TSetting from "./TSetting.vue";
import TRoam from "./TRoam.vue";
import TMarker from "./TMarker.vue";
import TMeasure from "./TMeasure.vue";
import TViewPoint from "./TViewPoint.vue";
import TElementOpt from "./TElementOpt.vue";
import { Medusa } from "@/static/engine.sdk";
import TTest from "./TTest.vue";


// 接收 streamEngine 作为 prop

// 示例：处理点击事件时调用 streamEngine 的方法
function handleHomeClick() {
    Medusa.ResetViewPort();
}
function Big() {
    SendMessage("OnWheel_100_822_868");

}
function Small() {
    SendMessage("OnWheel_-100_822_868");
}
</script>

<style lang="css">
.tool-root {
    position: absolute;
    z-index: 1000;
    padding: 10px;
    border-radius: 5px;
    width: fit-content;
    height: 40px;
    color: white;
    min-width: 200px;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #0A2772;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: flex-start;
    padding: 6px;
}
.took-button-root {
    cursor: pointer; /* 鼠标悬停时显示手型 */
    width:32px;
    height:32px;
    margin:4px;
    padding: 4px;
    /* border: 1px dashed #f1f0f073; */
}
</style>