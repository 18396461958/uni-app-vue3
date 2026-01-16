<template>
    <view class="setting-root" ref="settingRoot">
        <!-- 自定义原生弹窗1：漫游点位保存弹窗 替代a-modal -->
        <view class="modal-mask" v-if="open" @click="open = false">
            <view class="modal-box" @click.stop>
                <view class="modal-title">漫游名称</view>
                <view class="modal-content">
                    <input type="text" class="native-input" v-model="inputName" maxlength="50" placeholder="请输入漫游名称" />
                </view>
                <view class="modal-footer">
                    <view class="modal-btn cancel-btn" @click="open = false">取消</view>
                    <view class="modal-btn confirm-btn" @click="OnOk()">确定</view>
                </view>
            </view>
        </view>

        <!-- 自定义原生弹窗2：漫游路径保存弹窗 替代第二个a-modal -->
        <view class="modal-mask" v-if="openPath" @click="ClosePersonRoamPath">
            <view class="modal-box" @click.stop>
                <view class="modal-title">漫游名称</view>
                <view class="modal-content">
                    <input type="text" class="native-input" v-model="inputName" maxlength="50" placeholder="请输入漫游名称" />
                    <view class="speed-input-box">
                        <text>漫游速度</text>
                        <input type="number" class="native-number-input" v-model="pathSpeed" min="1" max="100"
                            @input="handleSpeedInput" />
                        <text>m/s</text>
                    </view>
                </view>
                <view class="modal-footer">
                    <view class="modal-btn cancel-btn" @click="ClosePersonRoamPath">取消</view>
                    <view class="modal-btn confirm-btn" :class="{ loading: confirmLoading }" @click="SaveDrawPath()"
                        :style="{ opacity: confirmLoading ? 0.7 : 1 }">
                        {{ confirmLoading ? '保存中' : '确定' }}
                    </view>
                </view>
            </view>
        </view>

        <!-- 头部组件 保留原组件和拖拽/关闭逻辑 -->
        <TPlaneHeader @mousedown="dragHelper.startDrag" @close="() => { toolState.Roam = false }" title="漫游设置" />

        <view class="setting-content">
            <!-- 原生单选组：漫游视角切换 替代a-radio-group -->
            <view class="native-radio-group">
                <label class="radio-item" v-for="item in plainOptions" :key="item">
                    <input type="radio" v-model="curRoam" :value="item" />
                    <span class="radio-text">{{ item }}</span>
                </label>
            </view>

            <view class="setting-group" v-if="curRoam == '第一视角'"></view>

            <!-- 第三人称视角配置项 -->
            <view class="setting-group" v-if="curRoam == '第三人称'">
                <view class="setting-item">
                    <span class="setting-item-text">重力开关</span>
                    <!-- 原生自定义开关 替代a-switch -->
                    <view class="native-switch"
                        @click="GravityEnable = !GravityEnable; switchHandleChange(1, GravityEnable)">
                        <view class="switch-btn" :class="{ active: GravityEnable }"></view>
                        <text class="switch-text">{{ GravityEnable ? '开' : '关' }}</text>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">碰撞开关</span>
                    <view class="native-switch"
                        @click="CollisionEnable = !CollisionEnable; switchHandleChange(2, CollisionEnable)">
                        <view class="switch-btn" :class="{ active: CollisionEnable }"></view>
                        <text class="switch-text">{{ CollisionEnable ? '开' : '关' }}</text>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">人物尺寸</span>
                    <input type="number" class="native-input small-input" v-model="personSize" placeholder="请输入数值"
                        maxlength="25" />
                </view>
                <view class="setting-item">
                    <view class="native-btn primary-btn" :class="{ disabled: !isJumpFlag }" @click="OnJump"
                        :style="{ opacity: !isJumpFlag ? 0.5 : 1 }">
                        跳转至点位
                    </view>
                </view>
            </view>

            <!-- 上帝视角配置项 -->
            <view class="setting-group" v-if="curRoam == '上帝视角'">
                <view class="setting-item">
                    <span class="setting-item-text">重力开关</span>
                    <view class="native-switch"
                        @click="GravityEnable = !GravityEnable; switchHandleChange(1, GravityEnable)">
                        <view class="switch-btn" :class="{ active: GravityEnable }"></view>
                        <text class="switch-text">{{ GravityEnable ? '开' : '关' }}</text>
                    </view>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">碰撞开关</span>
                    <view class="native-switch"
                        @click="CollisionEnable = !CollisionEnable; switchHandleChange(2, CollisionEnable)">
                        <view class="switch-btn" :class="{ active: CollisionEnable }"></view>
                        <text class="switch-text">{{ CollisionEnable ? '开' : '关' }}</text>
                    </view>
                </view>
            </view>

            <!-- 原生单选按钮组：漫游类型切换 替代a-radio-group+a-radio-button -->
            <view class="native-radio-btn-group">
                <label class="radio-btn-item" v-for="item in roamTypeOptions" :key="item.value">
                    <input type="radio" v-model="roamSetType" :value="item.value" />
                    <span class="radio-btn-text">{{ item.label }}</span>
                </label>
            </view>

            <!-- 点位漫游模块 -->
            <view class="setting-group" v-show="roamSetType === '漫游点位'">
                <view class="setting-item">
                    <span class="setting-item-text">漫游点位</span>
                    <view class="native-btn primary-btn" @click="RoamPositionSave">保存漫游点位</view>
                </view>
                <view style="background-color: rgb(50, 73, 133); margin: 0px -1px -1px -1px; padding-top: 5px;">
                    <view class="setting-position-item" v-for="(item, index) in RoamPositionList" :key="index">
                        <view style="margin-bottom: 10px; margin-left: 10px;">{{ item.name }}</view>
                        <image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)" />
                        <view class="item-bottom">
                            {{ formatDate(item.createdTimDate) }}
                            <view class="del-icon" @click="showDelConfirm('position', item)">删除</view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 路径漫游模块 -->
            <view class="setting-group" v-show="roamSetType === '漫游路径'">
                <view class="setting-item">
                    <span class="setting-item-text">路径录制</span>
                    <view class="native-btn primary-btn" v-if="!roamRecordState" @click="StartRecordPath">开始录制</view>
                    <view class="native-btn primary-btn" v-if="roamRecordState" @click="StopRecordPath">停止录制</view>
                    <text class="icon-text">{{ !roamRecordState ? '播放' : '停止' }}</text>
                </view>
                <view class="setting-item">
                    <span class="setting-item-text">手绘路径</span>
                    <view class="native-btn primary-btn" v-if="!roamDrawState" @click="StartDrawPath">开始绘制</view>
                    <view class="native-btn primary-btn" v-if="roamDrawState" @click="StopDrawPath">停止绘制</view>
                    <text class="icon-text">{{ !roamDrawState ? '播放' : '停止' }}</text>
                </view>
                <view style="background-color: rgb(50, 73, 133); margin: 0px -1px -1px -1px; padding-top: 5px;">
                    <view class="setting-position-item" v-for="(item, index) in RoamPathList" :key="index">
                        <view style="margin-bottom: 10px; margin-left: 10px;">{{ item.name }}</view>
                        <image class="item-img" :src="item.image" mode="widthFix" @click="ZoomView(item)" />
                        <view
                            style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <view class="native-btn primary-btn small-btn" @click="PlayPersonRoam(item)">开始播放</view>
                            <view class="native-btn primary-btn small-btn" @click="PausePersonRoam(item)">暂停播放</view>
                            <view class="native-btn primary-btn small-btn" @click="ResumePersonRoam(item)">继续播放</view>
                            <view class="native-btn primary-btn small-btn" @click="StopPersonRoam(item)">停止播放</view>
                        </view>
                        <view class="item-bottom">
                            {{ formatDate(item.createdTimDate) }}
                            <view class="del-icon" @click="showDelConfirm('path', item)">删除</view>
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
const confirmLoading = ref(false);
const roamSetType = ref('漫游点位');
let openType = 'roamingPosition';
const settingRoot = ref(null);
const dragHelper = new DragHelper(settingRoot);

// 漫游视角选项-纯中文
const plainOptions = ref(['第一视角', '第三人称', '上帝视角']);
const curRoam = ref('第三人称');
// 漫游类型选项
const roamTypeOptions = ref([
    { label: '漫游点位', value: '漫游点位' },
    { label: '漫游路径', value: '漫游路径' }
]);

const GravityEnable = ref(false);
const CollisionEnable = ref(false);
const personSize = ref(1.0);
const open = ref(false);
const openPath = ref(false);
const inputName = ref("");
const pathSpeed = ref(10);

// 计算属性-跳转按钮禁用状态
const isJumpFlag = computed(() => {
    return toolState.roamingPosition;
})

// 点位/路径列表数据
const RoamPositionList = ref([]);
const RoamPathList = ref([]);

let personRoam = {
    "id": 0,
    "projectId": "",
    "path": "",
    "image": "",
    "name": "",
    "view": "",
    "dataType": "",
    "createdTimDate": 0
}

// 原生时间格式化方法 - 替代moment
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

// 删除确认弹窗 - 替代a-popconfirm
const showDelConfirm = (type, item) => {
    uni.showModal({
        title: '温馨提示',
        content: '确定要删除该数据吗？',
        success: (res) => {
            if (res.confirm) {
                type === 'position' ? deleteView(item) : deletePath(item);
            }
        }
    })
}

// 删除点位
const deleteView = (item) => {
    RoamPositionList.value = RoamPositionList.value.filter((v) => v.id !== item.id);
}
// 删除路径
const deletePath = (item) => {
    RoamPathList.value = RoamPathList.value.filter((v) => v.id !== item.id);
}

// 关闭路径弹窗
const ClosePersonRoamPath = () => {
    openPath.value = false;
    Medusa.EndSetRoamPath();
    Medusa.SetCameraMode(2);
}

// 视角缩放
const ZoomView = (item) => {
    Medusa.SetCameraView(item.view);
}

// 路径录制状态
const roamRecordState = ref(false);
const roamDrawState = ref(false);
// 开始录制路径
const StartRecordPath = () => {
    if (roamRecordState.value) return;
    roamRecordState.value = true;
    Medusa.StartRecordPath();
}
// 停止录制路径
const StopRecordPath = () => {
    if (!roamRecordState.value) return;
    roamRecordState.value = false;
    Medusa.StopRecordPath();
}
// 开始绘制路径
const StartDrawPath = () => {
    if (roamDrawState.value) return;
    roamDrawState.value = true;
    Medusa.StartSetRoamPath();
}
// 停止绘制路径
const StopDrawPath = () => {
    if (!roamDrawState.value) return;
    roamDrawState.value = false;
    openPath.value = true;
}

// 保存手绘路径
const SaveDrawPath = () => {
    confirmLoading.value = true;
    Medusa.GetRoamPath(pathSpeed.value * 30);
}

// 速度输入框数值限制
const handleSpeedInput = () => {
    if (pathSpeed.value < 1) pathSpeed.value = 1;
    if (pathSpeed.value > 100) pathSpeed.value = 100;
}

// 路径绘制完成监听
AppEvent.addEventListener("OnDrawRoamPath", (e) => {
    Medusa.GetCameraView((view) => {
        RoamPathList.value.push({
            "projectId": toolState.projectId,
            "path": e.recordView,
            "image": Medusa.GetCameraImg(),
            "name": inputName.value,
            "view": view,
            "dataType": "draw",
            "createdTimDate": Date.now(),
            "id": 0
        });
        openPath.value = false;
        confirmLoading.value = false;
        Medusa.EndSetRoamPath();
    })
});

// 路径播放相关方法
const PlayPersonRoam = (item) => {
    if (!item.path) return;
    Medusa.PlayPathAnimation(item.path);
}
const PausePersonRoam = (item) => {
    if (!item.path) return;
    Medusa.PausePathAnimation();
}
const ResumePersonRoam = (item) => {
    if (!item.path) return;
    Medusa.ResumePathAnimation();
}
const StopPersonRoam = (item) => {
    if (!item.path) return;
    Medusa.StopPathAnimation();
}

// 人物漫游路径监听
AppEvent.addEventListener("OnPersonRoamPath", (e) => {
    Medusa.GetCameraView((view) => {
        roamSetType.value = '漫游路径';
        personRoam.path = e.recordView;
        personRoam.view = view;
        personRoam.image = Medusa.GetCameraImg();
    })
    openType = 'roamPath';
    open.value = true;
});

// 弹窗确定按钮事件
const OnOk = () => {
    switch (openType) {
        case 'roamingPosition':
            Medusa.GetCameraView((view) => {
                RoamPositionList.value.push({
                    "projectId": toolState.projectId,
                    "image": Medusa.GetCameraImg(),
                    "name": inputName.value,
                    "view": view,
                    "createdTimDate": Date.now(),
                    "id": 0
                });
                open.value = false;
            });
            break;
        case 'roamPath':
            RoamPathList.value.push({
                "projectId": toolState.projectId,
                "path": personRoam.path,
                "image": personRoam.image,
                "name": inputName.value,
                "view": personRoam.view,
                "dataType": "person",
                "createdTimDate": Date.now(),
                "id": 0
            });
            break;
    }
}

// 保存点位
const RoamPositionSave = () => {
    if (!toolState.projectId) {
        uni.showToast({ title: '操作失败', icon: 'none', duration: 1500 });
        return;
    }
    open.value = true;
    openType = 'roamingPosition';
}

// 修改人物尺寸
const changeRoamPersonSize = () => {
    Medusa.SetRoamPersonScale(personSize.value);
}

// 开关切换事件
const switchHandleChange = (cmd, value) => {
    switch (cmd) {
        case 1: // GravityEnable
            Medusa.SetGravityEnable(value);
            break;
        case 2: // CollisionEnable
            Medusa.SetCollisionEnable(value);
            break;
    }
}

// 跳转点位
const OnJump = () => {
    Medusa.SetCameraView(toolState.roamingPosition);
}

// 监听人物尺寸变化
watch(personSize, (newValue) => {
    changeRoamPersonSize();
})

// 监听漫游状态变化
watch(() => toolState.Roam, (newValue) => {
    if (newValue) {
        switch (curRoam.value) {
            case '第一视角':
                Medusa.SetCameraMode(3);
                break;
            case '第三人称':
                Medusa.SetCameraMode(2);
                break;
            case '上帝视角':
                Medusa.SetCameraMode(4);
                break;
        }
        Medusa.SetRoamPersonScale(personSize.value);
    } else {
        Medusa.SetCameraMode(1);
        Medusa.StopPathAnimation();
        Medusa.EndSetRoamPath();
    }
});

// 监听漫游视角变化
watch(() => curRoam.value, (newValue) => {
    if (toolState.Roam) {
        switch (newValue) {
            case '第一视角':
                Medusa.SetCameraMode(3);
                break;
            case '第三人称':
                Medusa.SetCameraMode(2);
                break;
            case '上帝视角':
                Medusa.SetCameraMode(4);
                break;
        }
        personSize.value = 1.0;
    }
});


</script>

<style scoped>
.setting-root {
    color: #FFF;
    width: 340px;
    height: calc(100vh - 148px);
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
    height: calc(100vh - 148px - 80px);
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

.setting-position-item {
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

.del-icon {
    cursor: pointer;
    color: red;
}

.del-icon:hover {
    background-color: #355ea8;
}

.item-img {
    width: 100%;
}

/* 原生弹窗样式 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-box {
    width: 300px;
    background: #324985;
    border: 1px solid #3471cb;
    border-radius: 4px;
    color: #fff;
}

.modal-title {
    padding: 15px;
    font-size: 16px;
    border-bottom: 1px solid #3b5997;
    text-align: center;
}

.modal-content {
    padding: 20px;
}

.modal-footer {
    padding: 10px 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1px solid #3b5997;
}

.modal-btn {
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.cancel-btn {
    background: #3b5997;
}

.confirm-btn {
    background: #1677ff;
}

/* 原生输入框样式 */
.native-input {
    width: 100%;
    height: 36px;
    line-height: 36px;
    background: #3b5997;
    border: 1px solid #3471cb;
    border-radius: 4px;
    padding: 0 10px;
    color: #fff;
    box-sizing: border-box;
}

.native-input.small-input {
    width: 120px;
}

.native-number-input {
    width: 80px;
    height: 36px;
    line-height: 36px;
    background: #3b5997;
    border: 1px solid #3471cb;
    border-radius: 4px;
    padding: 0 10px;
    color: #fff;
    margin: 0 10px;
}

.speed-input-box {
    display: flex;
    align-items: center;
    margin-top: 10px;
}

/* 原生单选框样式 */
.native-radio-group {
    margin-left: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 10px;
}

.radio-item {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.radio-item input {
    margin-right: 5px;
}

.native-radio-btn-group {
    margin: 15px 20px 0;
    display: flex;
    width: 100%;
    gap: 5px;
}

.radio-btn-item {
    width: 50%;
    text-align: center;
    cursor: pointer;
}

.radio-btn-text {
    display: block;
    padding: 6px 0;
    background: #3b5997;
    border-radius: 4px;
}

.radio-btn-item input:checked+.radio-btn-text {
    background: #1677ff;
}

/* 原生开关样式 */
.native-switch {
    width: 60px;
    height: 24px;
    background: #3b5997;
    border-radius: 12px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    cursor: pointer;
}

.switch-btn {
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    left: 2px;
    top: 2px;
    transition: left 0.2s;
}

.switch-btn.active {
    left: calc(100% - 22px);
}

.switch-text {
    font-size: 12px;
    z-index: 1;
}

/* 原生按钮样式 */
.native-btn {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    font-size: 14px;
}

.native-btn.primary-btn {
    background: #1677ff;
}

.native-btn.disabled {
    cursor: not-allowed;
}

.native-btn.small-btn {
    padding: 4px 6px;
    font-size: 12px;
}

/* 图标文字样式 */
.icon-text {
    margin-right: 20px;
}
</style>