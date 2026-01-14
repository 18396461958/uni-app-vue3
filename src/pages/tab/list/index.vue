<template>
  <view class="mx-4" style="padding: 0 8px;">
    <!-- 新建/重命名弹窗 【替换 uni-popup + uni-popup-modal】 -->
    <view v-if="open" class="modal-mask" @click="open = false">
      <view class="modal-center" @click.stop>
        <view class="modal-title">{{ confirmTitle }}</view>
        <view style="width: 100%; margin-top: 6px;">
          <!-- 替换 uni-input 紧凑版 -->
          <input v-model="newFolderName" placeholder="请输入名称" maxlength="50"
            style="width: 100%; padding:6px;min-height:40px;border:1px solid #DCDEE2; border-radius:4px; box-sizing:border-box; font-size:13px;" />
        </view>
        <view class="modal-btn-group">
          <view class="modal-btn cancel" @click="open = false" :class="{ disabled: confirmLoading }">取消</view>
          <view class="modal-btn confirm" @click="handleOk" :class="{ disabled: confirmLoading }">
            <text v-if="confirmLoading" class="loading-icon">♻️</text>
            确定
          </view>
        </view>
      </view>
    </view>

    <!-- 高级转换弹窗 【替换 uni-popup + uni-popup-modal】手机紧凑核心版 -->
    <view v-if="advancedConvertOpen" class="modal-mask" @click="advancedConvertOpen = false">
      <view class="modal-center adv-modal" @click.stop style="width: 95%;">
        <view class="modal-title">高级选项</view>
        <view style="margin: 10px;">
          <!-- 缩放比例 -->
          <view
            style="display: flex; flex-direction: row; justify-content: space-between; margin-top: 15px;align-items: center;">
            <view class="tooltip-wrap">
              <view class="tooltip-text">模型缩放</view>
              <view class="tooltip-box">模型缩放比例配置，可调整模型大小倍率</view>
            </view>
            <view class="custom-select" style="width: 80px;" @click="scaleSelectShow = !scaleSelectShow">
              <view class="select-value">{{ ConvertInfo.scale }}</view>
              <text class="select-arrow">▼</text>
              <view class="select-options" v-show="scaleSelectShow">
                <view class="option-item" v-for="item in scaleOptions" :key="item.value"
                  @click="ConvertInfo.scale = item.value; scaleSelectShow = false">
                  {{ item.text }}
                </view>
              </view>
            </view>
          </view>
          <!-- 过滤飞行模型 -->
          <view
            style="display: flex; flex-direction: row; justify-content: space-between; margin-top: 15px;align-items: center;">
            <view style="font-size:13px;">过滤飞行模型</view>
            <view style="display: flex;align-items:center;">
              <text style="font-size:13px;">{{ ConvertInfo.autoRemoveFly ? '开启' : '关闭' }}</text>
              <view class="custom-switch" :class="{ open: ConvertInfo.autoRemoveFly }"
                @click="ConvertInfo.autoRemoveFly = !ConvertInfo.autoRemoveFly" style="margin-left:6px;"></view>
            </view>
          </view>
          <!-- 简化比例 极致紧凑 -->
          <view
            style="display: flex; flex-direction: row; justify-content: space-between; margin-top: 15px;align-items: center;">
            <view style="font-size:13px;">简化系数</view>
            <input v-model="simplifyScaleVal"
              style="width: 80px;min-height: 30px;text-align: right; padding:2px; border:1px solid #DCDEE2; border-radius:2px; font-size:13px;"
              type="number" @input="handleSimplifyInput" @blur="handleSimplifyBlur" />
          </view>
        </view>
        <view class="modal-btn-group">
          <view class="modal-btn cancel" @click="advancedConvertOpen = false" :class="{ disabled: confirmLoading }">取消
          </view>
          <view class="modal-btn confirm" @click="advancedConvertHandleOk" :class="{ disabled: confirmLoading }">
            <text v-if="confirmLoading" class="loading-icon">♻️</text>
            确定
          </view>
        </view>
      </view>
    </view>

    <!-- 文件上传组件 -->
    <UploadModelFile ref="uploadModelFile" :FolderId="getCurPathFolder().id" @file-upload-ok="OnFileUploadHandleOk"
      @file-upload-error="OnFileUploadError" />

    <!-- 顶部路径导航+操作按钮区【核心紧凑：高度64→48px，手机核心优化】 -->
    <view class="flex justify-between h-[48px] w-full items-center border-b-[1px] border-b-solid border-[#DEDEDE]">
      <view class="text-[12px] text-[#374099] path-root">
        <!-- 返回上级 -->
        <view @click="ReturnUp()" class="path-root"
          style="width: 22px; height: 22px;display:flex;align-items:center;justify-content:center;">
          <text style="font-size:15px;">←</text>
        </view>
        <text>|</text>
        <!-- 根路径 -->
        <view @click="() => RefreshPath(rootPath)" class="path-node" style="margin:0 4px;">
          {{ rootPath.name }}
        </view>
        <!-- 路径面包屑循环 -->
        <view class="flex" v-for="(item, index) in paths">
          <text>/</text>
          <view @click="() => RefreshPath(item)" class="path-node" style="margin:0 4px;">
            {{ item.name }}
          </view>
        </view>
      </view>

      <!-- 右侧操作按钮组【紧凑间距】 -->
      <view class="flex items-center flex-wrap">
        <!-- <view @click="showModal(OpenType.NewFolder)"
          class="h-[28px] px-2 text-[12px] action-button text-[#515A6E] action-button1 flex items-center border border-solid border-[#DCDEE2] rounded-[2px] mr-1 mb-1">
          <text style="font-size:12px; margin-right: 3px;">📁</text>
          新建
        </view>
        <view @click="onFileUpdated"
          class="h-[28px] px-2 text-[12px] action-button text-[#515A6E] action-button1 flex items-center border border-solid border-[#DCDEE2] rounded-[2px] mr-1 mb-1">
          <text style="font-size:12px; margin-right: 3px;">⬆️</text>
          上传
        </view> -->
        <!-- 排序下拉紧凑版 -->
        <view class="custom-select sort-select" style="height:28px;margin-left:2px;"
          @click="sortSelectShow = !sortSelectShow">
          <view class="select-value">{{ selectSort }}</view>
          <text class="select-arrow">▼</text>
          <view class="select-options" v-show="sortSelectShow">
            <view class="option-item" v-for="item in sortList" :key="item.value"
              @click="selectSort = item.value; sortSelectShow = false; handleChange(item.value)">
              {{ item.label }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 文件列表表格【手机核心适配：高度重新计算，避免溢出】 -->
    <view class="d-table mt-[8px]" style="overflow-y: auto;height: calc(100vh - 130px);">
      <view v-if="loading" class="loading-wrap"><text class="loading-icon">♻️</text> 加载中...</view>
      <view class="custom-table bordered" v-else>
        <view class="table-tr th">
          <view class="table-td" style="flex:4">名称</view>
          <!-- <view class="table-td" style="width: 120px;">日期</view>
          <view class="table-td" style="width: 80px;">类型</view>
          <view class="table-td" style="width: 80px;">大小</view> -->
          <!-- 原状态列 表头注释掉 -->
          <view class="table-td" style="width: 20px;">状态</view>
          <!-- <view class="table-td" style="width: 180px;">操作</view> -->
        </view>
        <view class="table-tr" v-for="(record, index) in data" :key="record.key">
          <view class="table-td" style="flex:4">
            <view class="flex items-center action-button" @click="OpenFile(record)">
              {{ record.name }}
              <!-- ✅ 核心修改：状态标签全部跟随名称后方展示 -->
              <!-- 文件夹专属状态 -->
              <view class="tag-item default ml-2" v-if="record.size === '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                <text style="font-size:10px; margin-right:2px;">📁</text>
                文件夹
              </view>
              <!-- 文件状态 紧凑标签 -->
              <!-- <view class="tag-item default ml-2" v-if="record.status === 'UnStarted' && record.size != '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                <text style="font-size:10px; margin-right:2px;">⭕</text>
                未开始
              </view>
              <view class="tag-item default ml-2" v-if="record.status === 'Waiting' && record.size != '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                <text style="font-size:10px; margin-right:2px;">🕒</text>
                等待中
              </view>
              <view class="tag-item processing ml-2" v-if="record.status === 'Converting' && record.size != '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                <text style="font-size:10px; margin-right:2px;" class="spin-icon">♻️</text>
                {{ record.progress }}%
              </view>
              <view class="tag-item success ml-2" v-if="record.status === 'Finished' && record.size != '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                完成
              </view>
              <view class="tag-item error ml-2" v-if="record.status === 'Failed' && record.size != '-'"
                style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
                <text style="font-size:10px; margin-right:2px;">❌</text>
                失败
              </view> -->
            </view>
          </view>
          <!-- <view class="table-td">{{ record.date }}</view>
          <view class="table-td">{{ record.type }}</view>
          <view class="table-td">{{ record.size }}</view> -->
          <!-- ✅ 核心修改：原独立状态列 整段注释掉 -->
          <view class="table-td">
            <view class="tag-item default" v-if="record.status === 'UnStarted'"
              style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
              <text style="font-size:10px; margin-right:2px;">⭕</text>
              未开始
            </view>
            <view class="tag-item default" v-if="record.status === 'Waiting'"
              style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
              <text style="font-size:10px; margin-right:2px;">🕒</text>
              等待中
            </view>
            <view class="tag-item processing" v-if="record.status === 'Converting'"
              style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
              <text style="font-size:10px; margin-right:2px;" class="spin-icon">♻️</text>
              {{ record.progress }}%
            </view>
            <view class="tag-item success" v-if="record.status === 'Finished'"
              style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
              <text style="font-size:10px; margin-right:2px;">✅</text>
              完成
            </view>
            <view class="tag-item error" v-if="record.status === 'Failed'"
              style="display:flex;align-items:center;justify-content:center;padding:1px 4px;border-radius:2px;font-size:11px;">
              <text style="font-size:10px; margin-right:2px;">❌</text>
              失败
            </view>
          </view>
          <!-- 操作列【极致紧凑按钮】 -->
          <!-- <view class="table-td">
            <view class="flex items-center justify-start flex-wrap">
              <view v-if="record.size != '-'" @click="ConvertFile(record)" class="action-btn mr-1 mb-1">转换</view>
              <view v-if="record.size != '-'" @click="AdvancedConvert(record)" class="action-btn mr-1 mb-1">高级</view>
              <view v-if="record.size != '-'" @click="OpenFile(record)" class="action-btn mr-1 mb-1">打开</view>
              <view @click="showModal(OpenType.NewFolder, record)" class="action-btn mr-1 mb-1">重命名</view>
              <view @click="showDelConfirm(record)" class="action-btn danger mr-1 mb-1">删除</view>
            </view>
          </view> -->
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
// import UploadModelFile from "@/components/UploadModelFile.vue";
import { postAction } from "@/api";
import moment from 'moment';

// ========== 类型定义 全部保留 无任何修改 ==========
interface TreeNode {
  id: number,
  name: string,
  date: string,
  type: string,
  size: string,
  status: string,
  uuid: string,
  updatedTime: string
  file: { type: string, size: number, name: string, uuid: string, status: FileStatus },
  children: TreeNode[]
}
enum FileStatus {
  None = "None",
  UnStarted = "UnStarted",
  Waiting = "Waiting",
  Converting = "Converting",
  Finished = "Finished",
  Failed = "Failed"
}
interface PathItem { id: number, name: string }
interface TableItem {
  key: number,
  name: string,
  date: string,
  type: string,
  size: string,
  progress: number,
  status: FileStatus,
  uuid: string,
}
enum OpenType {
  NewFolder = "newFolder",
  NewFile = "newFile",
  ReNameFolder = "ReNameFolder",
  ReNameFile = "ReNameFile"
}

// ========== 变量定义 只新增2个下拉控制变量，其余全部保留 ==========
const selectSort = ref<string>('按名称排序');
const ScaleSelectedValue = [0.000001, 0.00001, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
const scaleOptions = ref(ScaleSelectedValue.map(item => ({ value: item, text: item })));
const ConvertInfo = ref({
  fileGuid: "",
  flagObj: false,
  scale: 1,
  simplifyScale: 100,
  lodCount: 0,
  autoRemoveFly: false,
});
const simplifyScaleVal = ref('100%');
const uploadModelFile = ref();
const loading = ref(false);
const data = ref<TableItem[]>([]);
const rootPath = { name: "全部", id: 0 };
const paths = ref<PathItem[]>([]);
const open = ref(false);
const advancedConvertOpen = ref(false);
const opeType = ref<OpenType>(OpenType.NewFolder);
const confirmLoading = ref(false);
const newFolderName = ref("新建文件夹");
const editRecord = ref<TableItem>();
let dataTree: TreeNode[] = [];
const scaleSelectShow = ref(false);
const sortSelectShow = ref(false);

// ========== 计算属性 全部保留 ==========
const confirmTitle = computed(() => {
  if (opeType.value === OpenType.NewFolder) {
    return "新建文件夹";
  } else if (opeType.value === OpenType.ReNameFolder || opeType.value === OpenType.ReNameFile) {
    return "重命名";
  }
  return "新建文件夹";
})

// ========== 排序选项 ==========
const sortList = ref([
  { value: "按名称排序", label: "按名称排序" },
  { value: "按日期排序", label: "按日期排序" },
  { value: "按大小排序", label: "按大小排序" },
  { value: "按类型排序", label: "按类型排序" },
])

// ========== 百分比输入框格式化解析 ==========
const handleSimplifyInput = (val: string) => {
  const num = val.replace(/%/g, '');
  if (num && !isNaN(Number(num))) {
    ConvertInfo.value.simplifyScale = Math.max(0, Math.min(100, Number(num)));
  }
};
const handleSimplifyBlur = () => {
  simplifyScaleVal.value = `${ConvertInfo.value.simplifyScale}%`;
};

// ========== 定时器轮询进度 ==========
const timeCount = setInterval(() => {
  const ids: string[] = [];
  data.value.forEach(item => ids.push(item.uuid));
  postAction("/Convert/getManyConvertProgress", { value: ids }).then((res: any) => {
    res.forEach((item: any) => {
      const tableItem = data.value.find(v => v.uuid === item.uuid);
      if (tableItem) {
        tableItem.progress = item.progress;
        tableItem.status = item.status;
      }
    });
  });
}, 5000);

// ========== 所有业务方法 全部保留 无任何修改 ==========
const Sort = (type: string) => {
  switch (type) {
    case "按日期排序":
      data.value = data.value.sort((a, b) => (a.size === '-' && b.size !== '-') ? -1 : (a.size !== '-' && b.size === '-') ? 1 : a.date.localeCompare(b.date));
      break;
    case "按名称排序":
      data.value = data.value.sort((a, b) => (a.size === '-' && b.size !== '-') ? -1 : (a.size !== '-' && b.size === '-') ? 1 : a.name.localeCompare(b.name));
      break;
    case "按大小排序":
      data.value = data.value.sort((a, b) => (a.size === '-' && b.size !== '-') ? -1 : (a.size !== '-' && b.size === '-') ? 1 : a.size.localeCompare(b.size));
      break;
    case "按类型排序":
      data.value = data.value.sort((a, b) => (a.size === '-' && b.size !== '-') ? -1 : (a.size !== '-' && b.size === '-') ? 1 : a.type.localeCompare(b.type));
      break;
  }
};
const OnFileUploadHandleOk = (uploadInfo: any) => {
  uni.showToast({ title: "上传成功", icon: 'success' });
  loading.value = true;
  getGetFolderTreeFn().then(() => {
    RefreshPath(getCurPathFolder());
    loading.value = false;
  });
};
const OnFileUploadError = (err: any) => {
  console.log(err);
  uni.showToast({ title: "文件上传失败", icon: 'error' });
};
const getCurPathFolder = () => paths.value.length === 0 ? rootPath : paths.value[paths.value.length - 1];
const showModal = (type: OpenType, record: TableItem | undefined = undefined) => {
  open.value = true;
  opeType.value = type;
  if (record) {
    editRecord.value = record;
    opeType.value = record.size === '-' ? OpenType.ReNameFolder : OpenType.ReNameFile;
    newFolderName.value = record.name;
  }
};
const OnOpenFolderModel = () => {
  const folderId = getCurPathFolder().id;
  uni.navigateTo({ url: `/pages/Engine/ModelView?folderId=${folderId}` });
};
const onRefresh = () => {
  loading.value = true;
  getGetFolderTreeFn().then(() => {
    RefreshPath(getCurPathFolder());
    loading.value = false;
  });
};
const handleOk = () => {
  confirmLoading.value = true;
  switch (opeType.value) {
    case OpenType.NewFolder:
      const rootId = paths.value.length > 0 ? paths.value[paths.value.length - 1].id : 0;
      CreateFolder(newFolderName.value, rootId).then(() => {
        newFolderName.value = "新建文件夹";
        confirmLoading.value = false;
        open.value = false;
        loading.value = true;
        getGetFolderTreeFn().then(() => {
          RefreshPath(getCurPathFolder());
          loading.value = false;
        });
      });
      break;
    case OpenType.ReNameFolder:
    case OpenType.ReNameFile:
      editRecord.value && ReName(editRecord.value);
      break;
  }
};
const ReturnUp = () => {
  paths.value.length > 1 ? RefreshPath(paths.value[paths.value.length - 2]) : RefreshPath(rootPath);
};
const RefreshPath = (node: number | string | PathItem) => {
  let nodeId = 0;
  if (typeof node === 'string') nodeId = parseInt(node);
  else if (typeof node === 'number') nodeId = node;
  else nodeId = node.id;

  uni.setStorageSync('folderId', nodeId);
  if (nodeId === rootPath.id) {
    paths.value = [];
    data.value = [];
    const rows: TableItem[] = [];
    dataTree.forEach((item) => {
      rows.push({
        key: item.id, name: item.name, date: moment(item.updatedTime).format('YYYY-MM-DD HH:mm:ss'),
        type: item.file == null ? "文件夹" : item.file.type,
        size: item.file == null ? "-" : (item.file.size / 1024 / 1024).toFixed(3) + "MB",
        status: item.file == null ? FileStatus.None : (item?.file?.status ?? FileStatus.UnStarted),
        uuid: item?.file?.uuid ?? null, progress: 0
      })
    })
    data.value = rows;
  } else {
    const ps: PathItem[] = [];
    const curNode = findNode(ps, dataTree, nodeId);
    if (!curNode) return;
    paths.value = [];
    data.value = [];
    const rows: TableItem[] = [];
    curNode.children.forEach((item) => {
      rows.push({
        key: item.id, name: item.name, date: moment(item.updatedTime).format('YYYY-MM-DD HH:mm:ss'),
        uuid: item?.file?.uuid ?? null, type: item.file == null ? "文件夹" : item.file.type,
        size: item.file == null ? "-" : (item.file.size / 1024 / 1024).toFixed(3) + "MB",
        status: item?.file?.status ?? FileStatus.UnStarted, progress: 0
      })
    })
    paths.value = ps;
    data.value = rows;
  }
  Sort(selectSort.value);
};
const findNode = (ps: PathItem[], nodes: TreeNode[], id: number): TreeNode | null => {
  for (let i = 0; i < nodes.length; i++) {
    ps.push({ name: nodes[i].name, id: nodes[i].id });
    if (nodes[i].id === id && nodes[i].file === null) return nodes[i];
    else if (nodes[i].children && nodes[i].children.length > 0) {
      const node = findNode(ps, nodes[i].children, id);
      if (node) return node;
    }
    ps.pop();
  }
  return null;
};
const ReName = (record: TableItem) => {
  if (record.size === '-') {
    postAction("/Folder/ReNameFolder", { newFolderName: newFolderName.value, folderId: record.key }).then((res) => {
      res ? uni.showToast({ title: "重命名成功", icon: 'success' }) : uni.showToast({ title: "重命名失败", icon: 'error' });
      onRefresh();
    }).finally(() => {
      confirmLoading.value = false;
      open.value = false;
    });
  } else {
    postAction("/File/ReNameFile", { uuid: record.uuid, name: newFolderName.value }).then((res) => {
      res ? uni.showToast({ title: "重命名成功", icon: 'success' }) : uni.showToast({ title: "重命名失败", icon: 'error' });
      onRefresh();
    }).finally(() => {
      confirmLoading.value = false;
      open.value = false;
    });
  }
};
const OpenFile = (record: TableItem) => {
  if (record.size == '-') {
    paths.value.push({ name: record.name, id: record.key });
    RefreshPath(paths.value[paths.value.length - 1]);
  } else {
    if (record.status != FileStatus.Finished) {
      uni.showToast({ title: "文件未完成转换，无法打开", icon: 'error' });
      return;
    }
    uni.navigateTo({ url: `/pages/Engine/ModelView?fileId=${record.uuid}` });
  }
};
const showDelConfirm = (record: TableItem) => {
  uni.showModal({
    title: '确定要删除吗？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => res.confirm && DeleteFile(record)
  })
};
const DeleteFile = (record: TableItem) => {
  const req = record.size === '-'
    ? postAction("/Folder/DeleteFolder", { value: record.key })
    : postAction("/File/DeleteFile", { value: record.key });
  req.then((res) => {
    res ? uni.showToast({ title: "删除成功", icon: 'success' }) : uni.showToast({ title: "删除失败", icon: 'error' });
    onRefresh();
  });
};
const ConvertFile = (record: TableItem) => {
  postAction("/Convert/convertModel", {
    "fileGuid": record.uuid, "flagObj": 0, "scale": 0, "lodCount": 0, "autoRemoveFly": false,
  }).then((res) => {
    !res && uni.showToast({ title: "转换失败", icon: 'error' });
  });
};
const AdvancedConvert = (record: TableItem) => {
  advancedConvertOpen.value = true;
  ConvertInfo.value.fileGuid = record.uuid;
};
const advancedConvertHandleOk = () => {
  postAction("/Convert/convertModel", {
    "fileGuid": ConvertInfo.value.fileGuid, "flagObj": 0, "autoRemoveFly": ConvertInfo.value.autoRemoveFly,
    "scale": ConvertInfo.value.scale, "simplifyScale": ConvertInfo.value.simplifyScale, "lodCount": 0
  }).then((res) => {
    !res && uni.showToast({ title: "转换失败", icon: 'error' });
  }).finally(() => {
    confirmLoading.value = false;
    advancedConvertOpen.value = false;
  });
};
const onFileUpdated = () => uploadModelFile.value.OpenFileUpload();
const CreateFolder = async (folderName: string, parentId = 0) => {
  try {
    return await postAction("/Folder/CreateFolder", { folderName, parentFolderId: parentId });
  } finally { confirmLoading.value = false; }
};
const getGetFolderTreeFn = async () => {
  const res = await postAction("/Folder/GetExplorerTree");
  dataTree = res.Data as any;
  return dataTree;
};
const handleChange = (value: string) => value && Sort(value);

// ========== 生命周期 全部保留 ==========
onMounted(() => {
  loading.value = true;
  getGetFolderTreeFn().then(() => {
    const folderId = uni.getStorageSync('folderId');
    folderId ? RefreshPath(folderId) : RefreshPath(rootPath);
    loading.value = false;
  });
});
watch(() => uni.getStorageSync('folderId'), (folderId) => {
  if (folderId && folderId != getCurPathFolder().id) {
    RefreshPath(folderId);
  }
});
onUnmounted(() => clearInterval(timeCount));
</script>

<style scoped>
/* 全局基础样式-手机紧凑版 */
.action-button {
  margin-right: 4px;
}

.action-button:active {
  opacity: 0.8;
}

.d-table {
  overflow-y: auto;
  height: calc(100vh - 130px);
}

.stag {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}

.action-button1 {
  border-radius: 2px;
}

.action-button1:active {
  color: #4096ff;
  border: #4096ff solid 1px;
}

/* 路径导航【手机核心：横向滚动，解决窄屏挤压】 */
.path-root {
  display: flex;
  color: #000;
  align-content: center;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow-x: auto;
  white-space: nowrap;
  max-width: 60%;
}

.path-node {
  color: #4096ff;
  font-size: 12px;
  margin: 0px;
}

.path-node-root {
  display: block;
}

/* 操作按钮-极致紧凑 */
.action-btn {
  padding: 3px 6px;
  border: 1px solid #DCDEE2;
  border-radius: 1px;
  font-size: 12px;
  color: #515A6E;
}

.action-btn.danger {
  color: #F53F3F;
  border-color: #F53F3F;
}

.action-btn:active {
  border-color: #4096ff;
  color: #4096ff;
  background: #f5f9ff;
}

/* 状态标签-紧凑配色不变 */
.tag-item.default {
  background: #F2F3F5;
  color: #4E5969;
}

.tag-item.processing {
  background: #E8F3FF;
  color: #165DFF;
}

.tag-item.success {
  background: #E8FFEB;
  color: #00B42A;
}

.tag-item.error {
  background: #FFE8E8;
  color: #F53F3F;
}

/* 旋转动画 保留 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.spin-icon {
  animation: spin 1s linear infinite;
}

.loading-icon {
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 2px;
  font-size: 12px;
}

/* ========== 弹窗蒙层+容器 手机极致紧凑版 ========== */
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

.modal-center {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  width: 50%;
  box-sizing: border-box;
}

.adv-modal {
  width: 50% !important;
}

.modal-title {
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
  color: #333;
}

.modal-btn-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 6px;
}

.modal-btn {
  padding: 4px 12px;
  border-radius: 2px;
  font-size: 13px;
}

.modal-btn.cancel {
  border: 1px solid #DCDEE2;
  color: #515A6E;
}

.modal-btn.confirm {
  background: #165DFF;
  color: #fff;
}

.modal-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* ========== 原生下拉选择器 手机紧凑版 ========== */
.custom-select {
  border: 1px solid #DCDEE2;
  border-radius: 1px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  position: relative;
}

.sort-select {
  min-width: 100px;
}

.select-value {
  font-size: 12px;
  color: #515A6E;
}

.select-arrow {
  font-size: 10px;
  color: #999;
}

.select-options {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #DCDEE2;
  border-radius: 1px;
  z-index: 999;
  max-height: 180px;
  overflow-y: auto;
}

.option-item {
  padding: 6px;
  font-size: 12px;
  color: #515A6E;
  border-bottom: 1px solid #f2f2f2;
}

.option-item:last-child {
  border: none;
}

.option-item:active {
  background: #f5f5f5;
}

/* ========== 原生开关 尺寸不变(触控优先) ========== */
.custom-switch {
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: #DCDEE2;
  position: relative;
  transition: all 0.3s;
}

.custom-switch.open {
  background: #00B42A;
}

.custom-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: all 0.3s;
}

.custom-switch.open::after {
  left: 20px;
}

/* ========== 原生tooltip 手机版(删除hover，保留样式) ========== */
.tooltip-wrap {
  position: relative;
}

.tooltip-box {
  display: none;
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 3px 6px;
  border-radius: 2px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 99;
}

/* ========== 原生表格 手机紧凑核心 ========== */
.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.table-tr {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #DEDEDE;
}

.table-tr.th {
  background: #f5f5f5;
  font-weight: bold;
}

.table-td {
  flex: 1;
  padding: 6px;
  text-align: left;
  font-size: 12px;
  color: #333;
  box-sizing: border-box;
}

.custom-table.bordered .table-td {
  border-right: 1px solid #DEDEDE;
}

.custom-table.bordered .table-td:last-child {
  border-right: none;
}

/* 加载中样式 */
.loading-wrap {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #515A6E;
}
</style>