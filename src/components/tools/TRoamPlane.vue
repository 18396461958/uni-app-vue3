<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 原生弹窗1 漫游点位保存弹窗 纯原生实现 -->
        <view class="native-modal" v-show="open">
            <view class="native-modal-mask" @click="open = false"></view>
            <view class="native-modal-content">
                <view class="modal-title">漫游名称</view>
                <view class="modal-body">
                    <input type="text" class="native-input" v-model="inputName" maxlength="50" />
                </view>
                <view class="modal-footer">
                    <button class="native-btn cancel-btn" @click="open = false">取消</button>
                    <button class="native-btn primary" @click="OnOk()">确定</button>
                </view>
            </view>
        </view>

        <!-- 原生弹窗2 漫游路径保存弹窗 带加载状态 纯原生实现 -->
        <view class="native-modal" v-show="openPath">
            <view class="native-modal-mask" @click="ClosePersonRoamPath"></view>
            <view class="native-modal-content">
                <view class="modal-title">漫游名称</view>
                <view class="modal-body">
                    <input type="text" class="native-input" v-model="inputName" placeholder="漫游名称" maxlength="50" />
                    <view style="display: flex; align-items: center; justify-content: flex-start; flex-direction: row; margin-top: 10px;">
                        <span>漫游速度</span>
                        <input type="number" class="native-input num-input" style="margin-left: 10px; margin-right: 10px;width:80px;" min="1" max="100" v-model="pathSpeed" @blur="checkPathSpeed" />
                        <span>m/s</span>
                    </view>
                </view>
                <view class="modal-footer">
                    <button class="native-btn cancel-btn" @click="ClosePersonRoamPath">取消</button>
                    <button class="native-btn primary" :disabled="confirmLoading" @click="SaveDrawPath()">
                        {{confirmLoading ? '保存中...' : '确定'}}
                    </button>
                </view>
            </view>
        </view>

        <TPlaneHeader @mousedown="dragHelper.startDrag" @touchstart="dragHelper.startDrag" @close="()=>{toolState.Roam = false}" title="漫游设置" />
        <view class="setting-content">
            <!-- 原生单选组 第一/第三人称/上帝视角 纯原生实现 -->
            <view class="native-radio-group" style="margin-left: 24px;">
                <label class="radio-item" v-for="item in plainOptions" :key="item">
                    <input type="radio" v-model="curRoam" :value="item" />
                    <span>{{item}}</span>
                </label>
            </view>

            <view class="setting-group" v-if="curRoam == '第一人称'"></view>
            
            <view class="setting-group" v-if="curRoam == '第三人称'">
                <view class="setting-item">
                    <span class="setting-item-text">重力开关</span>
                    <!-- 原生开关 纯原生实现 无任何组件封装 -->
                    <view class="native-switch" @click="switchHandleChange(CmdType.GravityEnable,!GravityEnable)">
                        <view class="switch-slider" :class="GravityEnable ? 'active' : ''"></view>
                        <span class="switch-text">{{GravityEnable ? '开' : '关'}}</span>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">碰撞开关</span>
                    <view class="native-switch" @click="switchHandleChange(CmdType.CollisionEnable,!CollisionEnable)">
                        <view class="switch-slider" :class="CollisionEnable ? 'active' : ''"></view>
                        <span class="switch-text">{{CollisionEnable ? '开' : '关'}}</span>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">人物尺寸</span>
                    <input type="number" class="native-input" v-model="personSize" placeholder="请输入数值" maxlength="25" style="width: 120px" />
                </view>
                <view class="setting-item">
                    <button class="native-btn primary full-btn" :disabled="!isJumpFlag" @click="OnJump">跳转到点位</button>
                </view>
            </view>

            <view class="setting-group" v-if="curRoam == '上帝视角'">
                <view class="setting-item">
                    <span class="setting-item-text">重力开关</span>
                    <view class="native-switch" @click="switchHandleChange(CmdType.GravityEnable,!GravityEnable)">
                        <view class="switch-slider" :class="GravityEnable ? 'active' : ''"></view>
                        <span class="switch-text">{{GravityEnable ? '开' : '关'}}</span>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">碰撞开关</span>
                    <view class="native-switch" @click="switchHandleChange(CmdType.CollisionEnable,!CollisionEnable)">
                        <view class="switch-slider" :class="CollisionEnable ? 'active' : ''"></view>
                        <span class="switch-text">{{CollisionEnable ? '开' : '关'}}</span>
                    </view>
                </view>
            </view>

            <!-- 原生单选按钮组 漫游点位/路径切换 纯原生实现 替换原:has选择器兼容小程序 -->
            <view class="native-radio-btn-group" style="margin: 15px 20px 0px;">
                <label class="radio-btn-item" :class="{'checked': roamSetType === '漫游点位'}">
                    <input type="radio" v-model="roamSetType" value="漫游点位" />
                    <span>漫游点位</span>
                </label>
                <label class="radio-btn-item" :class="{'checked': roamSetType === '漫游路径'}">
                    <input type="radio" v-model="roamSetType" value="漫游路径" />
                    <span>漫游路径</span>
                </label>
            </view>

            <view class="setting-group" v-show="roamSetType === '漫游点位'">
                <view class="setting-item">
                    <span class="setting-item-text">漫游点位</span>
                    <button class="native-btn primary" @click = "RoamPositionSave">保存当前点位</button>
                </view>
                <view style="background-color: rgb(50, 73, 133); margin: 0px -1px -1px -1px; padding-top: 5px;">
                    <view class="setting-position-item" v-for="(item, index) in RoamPositionList" :key="index">
                        <view style="margin-bottom: 10px; margin-left: 10px;">{{ item.name }}</view>
                        <img class="item-img" :src="item.image" alt="" @click="ZoomView(item)"/>
                        <view class="item-bottom">
                            {{ formatDate(item.createdTimDate) }}
                            <!-- 原生删除确认弹窗 纯原生实现 无任何组件封装 -->
                            <view class="native-popconfirm">
                                <span class="del-text" 
                                    @mouseenter="popShow=true" 
                                    @touchstart="popShow=true"
                                    @mouseleave="popShow=false"
                                    @touchend="popShow=false">删除</span>
                                <view class="pop-box" v-show="popShow">
                                    <view class="pop-title">确定删除吗？</view>
                                    <view class="pop-btn">
                                        <span @click="deleteView(item)">确定</span>
                                        <span @click="popShow=false">取消</span>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <view class="setting-group" v-show="roamSetType === '漫游路径'">
                <view class="setting-item">
                    <span class="setting-item-text">路径录制</span>
                    <button class="native-btn primary" v-if="!roamRecordState" @click = "StartRecordPath">开始</button>
                    <button class="native-btn primary" v-if="roamRecordState" @click = "StopRecordPath">停止</button>
                    <span style="margin-right: 20px;" v-if="!roamRecordState">播放</span>
                    <span style="margin-right: 20px;" v-if="roamRecordState">停止</span>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">路径绘制</span>
                    <button class="native-btn primary" v-if="!roamDrawState" @click = "StartDrawPath">开始</button>
                    <button class="native-btn primary" v-if="roamDrawState" @click = "StopDrawPath">停止</button>
                    <span style="margin-right: 20px;" v-if="!roamDrawState">播放</span>
                    <span style="margin-right: 20px;" v-if="roamDrawState">停止</span>
                </view>
                <view style=" background-color: rgb(50, 73, 133); margin: 0px -1px -1px -1px; padding-top: 5px;">
                    <view class="setting-position-item" v-for="(item, index) in RoamPathList" :key="index">
                        <view style="margin-bottom: 10px; margin-left: 10px;">{{ item.name }}</view>
                        <img class="item-img" :src="item.image" alt="" @click="ZoomView(item)"/>
                        <view style=" display: flex; flex-direction: row; justify-content: space-between; align-items: center; marginTop: 10px;">
                            <button class="native-btn primary small-btn" @click = "PlayPersonRoam(item)">播放</button>
                            <button class="native-btn primary small-btn" @click = "PausePersonRoam(item)">暂停</button>
                            <button class="native-btn primary small-btn" @click = "ResumePersonRoam(item)">继续</button>
                            <button class="native-btn primary small-btn" @click = "StopPersonRoam(item)">停止</button>
                        </view>
                        <view class="item-bottom">
                            {{ formatDate(item.createdTimDate) }}
                            <view class="native-popconfirm">
                                <span class="del-text" 
                                    @mouseenter="popShow=true" 
                                    @touchstart="popShow=true"
                                    @mouseleave="popShow=false"
                                    @touchend="popShow=false">删除</span>
                                <view class="pop-box" v-show="popShow">
                                    <view class="pop-title">确定删除吗？</view>
                                    <view class="pop-btn">
                                        <span @click="deletePath(item)">确定</span>
                                        <span @click="popShow=false">取消</span>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">  
import { DragHelper } from '@/utils/DragHelper';
import TPlaneHeader from './TPlaneHeader.vue';
import { computed, ref, watch } from 'vue';
import { postAction } from '@/api';
import { useToolPlaneStore } from "@/store";
import { AppEvent } from '@/api/engine/AppEvent';
import { Medusa } from '@/static/engine.sdk';

const toolState = useToolPlaneStore();
const confirmLoading = ref<boolean>(false);
const roamSetType = ref<string>('漫游点位');
let openType:'roamingPosition'| 'roamPath' |'roamDraw'= 'roamingPosition';
// uniapp原生dom元素类型适配 移除HTMLElement改为any兼容跨端
const settingRoot = ref<any>(null);
const dragHelper = new DragHelper(settingRoot);

// 完全中文固化 无任何多语言代码
const plainOptions = ['第一人称', '第三人称', '上帝视角'];
const curRoam = ref<string>('第三人称');
const GravityEnable = ref<boolean>(false);
const CollisionEnable = ref<boolean>(false);
const personSize = ref<number>(1);
const open = ref<boolean>(false);
const openPath = ref<boolean>(false);
const inputName = ref<string>("");
const pathSpeed = ref<number>(10);
const popShow = ref<boolean>(false);

// 跳转按钮禁用判断
const isJumpFlag = computed(() => {
    return toolState.roamingPosition; 
})

// 点位/路径接口类型定义不变
interface RoamingPosition {
  projectId: string,
  image:string,
  name: string,
  view: string,
  createdTimDate:number,
  id:number
}
interface RoamingPath{
    projectId: string,
    path:string,
    image:string,
    name: string,
    view: string,
    dataType:string,
    createdTimDate:number,
    id:number
}
const RoamPositionList = ref<RoamingPosition[]>([]);
const RoamPathList = ref<RoamingPath[]>([]);
let personRoam : RoamingPath={
  "id": 0,
  "projectId": "",
  "path": "",
  "image": "",
  "name": "",
  "view": "",
  "dataType": "",
  "createdTimDate": 0
}

// 原生时间格式化函数 无任何依赖
const formatDate = (time: number) => {
    const date = new Date(time);
    const y = date.getFullYear();
    const m = (date.getMonth()+1).toString().padStart(2,'0');
    const d = date.getDate().toString().padStart(2,'0');
    const h = date.getHours().toString().padStart(2,'0');
    const mm = date.getMinutes().toString().padStart(2,'0');
    const s = date.getSeconds().toString().padStart(2,'0');
    return `${y}-${m}-${d} ${h}:${mm}:${s}`;
}

// 速度输入框数值校验
const checkPathSpeed = () => {
    if(pathSpeed.value < 1) pathSpeed.value =1;
    if(pathSpeed.value >100) pathSpeed.value=100;
}

// 删除点位
function deleteView(item:RoamingPosition) {
    postAction("/roam/deleteRoamPosition",{value:item.id}).then((res:any) => {
        uni.showToast({title:'删除成功',icon:'success',duration:1500});
        RoamPositionList.value = RoamPositionList.value.filter((v) => v.id !== item.id); 
    }).catch((err:any) => {
        // uniapp原生toast修正：无error类型，改为none+文字提示
        uni.showToast({title:'删除失败',icon:'none',duration:1500,mask:true});
    }); 
}

// 删除路径
function deletePath(item:RoamingPath) {
    postAction("/roam/deleteRoamPath",{value:item.id}).then((res:any) => {
        uni.showToast({title:'删除成功',icon:'success',duration:1500});
        RoamPathList.value = RoamPathList.value.filter((v) => v.id !== item.id); 
    }).catch((err:any) => {
        uni.showToast({title:'删除失败',icon:'none',duration:1500,mask:true});
    }); 
}

// 关闭路径弹窗
function ClosePersonRoamPath() {
    openPath.value = false;
    Medusa.EndSetRoamPath();
    Medusa.SetCameraMode(2);
}

// 视角缩放
function ZoomView(item:RoamingPosition) {
    Medusa.SetCameraView(item.view);
}

// 路径录制相关
const roamRecordState = ref<boolean>(false);
const roamDrawState = ref<boolean>(false);
function StartRecordPath() {
    if (roamRecordState.value) return;
    roamRecordState.value = true;
    Medusa.StartRecordPath();
}
function StopRecordPath() {
    if (!roamRecordState.value) return;
    roamRecordState.value = false;
    Medusa.StopRecordPath();
}
function StartDrawPath() {
    if (roamDrawState.value) return;
    roamDrawState.value = true;
    Medusa.StartSetRoamPath();
}
function StopDrawPath() {
    if (!roamDrawState.value) return;
    roamDrawState.value = false;
    openPath.value = true;
}

// 保存绘制路径
function SaveDrawPath() {
    confirmLoading.value = true;
    Medusa.GetRoamPath(pathSpeed.value * 30);
}

// 绘制路径回调事件
AppEvent.addEventListener("OnDrawRoamPath", (e)=>{
    Medusa.GetCameraView((view:string) => {
        postAction("/roam/saveRoamPath",{
            "projectId": toolState.projectId,
            "path": e.recordView,
            "image": Medusa.GetCameraImg(),
            "name":inputName.value,
            "view": view,
            "dataType": "draw",
        }).then((res:any) => {
            uni.showToast({title:'保存成功',icon:'success',duration:1500});
            RoamPathList.value.push(res);
        }).catch((err:any) => {
            uni.showToast({title:'保存失败',icon:'none',duration:1500,mask:true});
        }).finally(() => {
            openPath.value = false;
            confirmLoading.value = false;
            Medusa.EndSetRoamPath();
        })
    })
});

AppEvent.addEventListener("OnInitAfter", ()=>{});

// 路径播放/暂停/继续/停止
function PlayPersonRoam(item:RoamingPath) {
    if (!item.path) return;
    Medusa.PlayPathAnimation(item.path);
}
function PausePersonRoam() {
    Medusa.PausePathAnimation();
}
function ResumePersonRoam() {
    Medusa.ResumePathAnimation();
}
function StopPersonRoam() {
    Medusa.StopPathAnimation();
}

// 路径录制完成回调
AppEvent.addEventListener("OnPersonRoamPath", (e)=>{
    Medusa.GetCameraView((view:string) => {
        roamSetType.value = '漫游路径';
        personRoam.path = e.recordView;
        personRoam.view = view;
        personRoam.image = Medusa.GetCameraImg();
    })
    openType = 'roamPath';
    open.value = true;
});

// 弹窗确定按钮统一处理
function OnOk(){
    switch(openType){
        case 'roamingPosition':
            Medusa.GetCameraView((view:any) => {
                postAction("/roam/saveRoamPosition",{
                    "projectId": toolState.projectId,
                    "image": Medusa.GetCameraImg(),
                    "name":inputName.value,
                    "view": view,
                }).then((res:any) => {
                    uni.showToast({title:'保存成功',icon:'success',duration:1500}); 
                    RoamPositionList.value.push(res);
                }).catch((err:any) => {
                    uni.showToast({title:'保存失败',icon:'none',duration:1500,mask:true});
                }).finally(() => {
                    open.value = false; 
                })
            });
        break;
        case 'roamPath':
            postAction("/roam/saveRoamPath",{
                "projectId": toolState.projectId,
                "path": personRoam.path,
                "image": personRoam.image,
                "name":inputName.value,
                "view": personRoam.view, 
            }).then((res:any) => {
                uni.showToast({title:'保存成功',icon:'success',duration:1500});
                RoamPathList.value.push(res);
            }).catch((err:any) => {
                uni.showToast({title:'保存失败',icon:'none',duration:1500,mask:true});
            }).finally(() => {
                open.value = false; 
            })
           break;
    }
}

// 人物尺寸监听
watch(personSize, (newValue) => {
    changeRoamPersonSize();
})

// 保存点位弹窗打开
function RoamPositionSave()
{
    if (!toolState.projectId) {
        uni.showToast({title:'操作异常',icon:'none',duration:1500,mask:true});
        return;
    }
    open.value = true;
    openType = 'roamingPosition';
}

// 修改人物尺寸
function changeRoamPersonSize()
{
    Medusa.SetRoamPersonScale(personSize.value);
}

// 开关指令枚举不变
enum CmdType{
    GravityEnable = 1,
    CollisionEnable = 2,
}
function switchHandleChange(cmd: CmdType, value: boolean) {
    switch (cmd) {
        case CmdType.GravityEnable:
            GravityEnable.value = value;
            Medusa.SetGravityEnable(value);
            break;
        case CmdType.CollisionEnable:
            CollisionEnable.value = value;
            Medusa.SetCollisionEnable(value);
            break;
    }
}

// 跳转到点位
function OnJump() {
    Medusa.SetCameraView(toolState.roamingPosition);
}

// 初始化标识
let initFlag = false;
// 漫游状态监听
watch(() => toolState.Roam, (newValue) => {
    if (newValue) {
        switch (curRoam.value) {
            case '第一人称':
                Medusa.SetCameraMode(3);
                if(!initFlag)
                {
                    GravityEnable.value = true;
                    initFlag = true;
                    setTimeout(() => {
                        Medusa.SetGravityEnable(true);
                        Medusa.MoveUp();
                    }, 500);
                }
                break;
            case '第三人称':
                Medusa.SetCameraMode(2);
                if(!initFlag)
                {
                    GravityEnable.value = true;
                    initFlag = true;
                    setTimeout(() => {
                        Medusa.SetGravityEnable(true);
                        Medusa.MoveUp();
                    }, 500);
                }
                break;
            case '上帝视角':
                Medusa.SetCameraMode(4);
                break;
        }
        Medusa.SetRoamPersonScale(personSize.value);
        postAction("/roam/getRoamPositions", { value: toolState.projectId }).then((res: any) => {
            RoamPositionList.value = [];
            RoamPositionList.value.push(...res);
        })
        postAction("/roam/getRoamPaths", { value: toolState.projectId }).then((res: any) => {
            RoamPathList.value = [];
            RoamPathList.value.push(...res);
        })
        if (newValue && settingRoot.value) {
            settingRoot.value.style.zIndex=toolState.DivIndex+++"";
        }
    } else {
        Medusa.SetCameraMode(1);
        Medusa.StopPathAnimation();
        Medusa.EndSetRoamPath();
    }
});

// 视角切换监听
watch(() => curRoam.value, (newValue) => {
    if (toolState.Roam) {
        switch (newValue) {
            case '第一人称':
                Medusa.SetCameraMode(3);
                break;
            case '第三人称':
                Medusa.SetCameraMode(2);
                break;
            case '上帝视角':
                Medusa.SetCameraMode(4);
                break;
        }
        personSize.value = 1;
    }
});
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
.setting-group {
    background-color: #3b5997;
    font-size: 16px;
	padding: 1px;
	margin-top: 10px;
	margin-left: 10px;
	margin-right: 10px;
	margin-bottom: 1px;
	border-radius: 0px;
	border: none;
}
.setting-item {
    background-color: #324985;
    font-size: 14px;
    padding-left: 10px;
    padding-right: 10px;
    height: 40px;
    margin-bottom: 1px;
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;
    justify-content: space-between;
}
.setting-content {
    background-color: #324985;
    height: calc(100vh - 10% - 80px);
    margin-left: 24px;
    margin-right: 24px;
    margin-top: 16px;
    overflow-y: auto;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: #3b5997 #324985;
    box-sizing: content-box;
    color: #FFF;
}
.setting-content::-webkit-scrollbar {
    width: 8px;
    padding-right: 10px;
    box-sizing: content-box;
    background-color: #324985;
}
.setting-content::-webkit-scrollbar-thumb {
    background-color: #3b5997;
    border-radius: 4px;
}
.setting-content::-webkit-scrollbar-track {
    background-color: #324985;
}
.setting-position-item{
    background-color: #3b5997;
    font-size: 14px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-content: space-around;
    align-items: stretch;
    justify-content: flex-start;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.3);
    margin-bottom: 10px;
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
}
.icon-select:hover {
    background-color: #355ea8;
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
}

/********** 纯原生组件样式 无任何封装 全原生实现 **********/
/* 原生弹窗样式 */
.native-modal{position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;display:flex;align-items:center;justify-content:center;}
.native-modal-mask{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);}
.native-modal-content{position:relative;width:300px;background:#324985;border:1px solid #3471cb;border-radius:4px;z-index:10;}
.modal-title{padding:12px 16px;font-size:16px;border-bottom:1px solid #3b5997;color:#fff;}
.modal-body{padding:16px;color:#fff;}
.modal-footer{padding:12px;display:flex;justify-content:flex-end;gap:10px;border-top:1px solid #3b5997;}

/* 原生输入框样式 */
.native-input{width:100%;height:32px;padding:0 8px;background:#3b5997;border:1px solid #3471cb;border-radius:4px;color:#fff;outline:none;box-sizing:border-box;}
.native-input::placeholder{color:#ccc;}
.num-input{text-align:center;}

/* 原生按钮样式 */
.native-btn{height:32px;padding:0 16px;border:none;border-radius:4px;cursor:pointer;font-size:14px;}
.native-btn.primary{background:#3471cb;color:#fff;}
.native-btn.primary:disabled{background:#6686c9;cursor:not-allowed;}
.native-btn.cancel-btn{background:#3b5997;color:#fff;}
.native-btn.full-btn{width:100%;}
.native-btn.small-btn{height:28px;padding:0 8px;font-size:12px;}

/* 原生开关样式 纯css实现 无任何js封装 */
.native-switch{width:60px;height:24px;background:#3b5997;border-radius:12px;display:flex;align-items:center;padding:0 2px;cursor:pointer;position:relative;}
.switch-slider{width:20px;height:20px;background:#fff;border-radius:50%;transition:all 0.2s ease;}
.switch-slider.active{transform:translateX(36px);background:#3471cb;}
.switch-text{position:absolute;left:50%;transform:translateX(-50%);font-size:12px;color:#fff;}

/* 原生单选组样式 */
.native-radio-group{display:flex;flex-direction:column;gap:8px;}
.radio-item{display:flex;align-items:center;cursor:pointer;}
.radio-item input{margin-right:8px;}

/* 原生单选按钮组样式 替换:has 兼容小程序 纯原生class实现选中态 */
.native-radio-btn-group{display:flex;width:100%;gap:5px;}
.radio-btn-item{flex:1;height:32px;display:flex;align-items:center;justify-content:center;background:#3b5997;border:1px solid #3471cb;border-radius:4px;cursor:pointer;}
.radio-btn-item input{display:none;}
.radio-btn-item.checked{background:#3471cb;color:#fff;}

/* 原生删除确认弹窗样式 纯原生实现 无任何组件 */
.native-popconfirm{position:relative;}
.del-text{color:red;cursor:pointer;}
.pop-box{position:absolute;right:0;top:20px;width:120px;background:#324985;border:1px solid #3471cb;border-radius:4px;padding:8px;z-index:99;color:#fff;}
.pop-title{font-size:12px;margin-bottom:8px;text-align:center;}
.pop-btn{display:flex;justify-content:space-around;}
.pop-btn span{cursor:pointer;padding:2px 8px;border-radius:2px;}
.pop-btn span:first-child{color:red;}
</style>