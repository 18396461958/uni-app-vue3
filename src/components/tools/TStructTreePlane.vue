<template>
  <view class="setting-root" ref="settingRoot">
    <!-- 头部标题栏 - 纯原生实现 -->
    <view class="plane-header" @mousedown="dragHelper.startDrag" @touchstart="dragHelper.startDrag">
      <view class="header-title">结构树</view>
      <view class="header-close" @click="handleClose">×</view>
    </view>

    <!-- 主体内容区 -->
    <view class="setting-content">
      <!-- 纯原生搜索框+下拉联想 -->
      <view class="search-wrapper">
        <view class="search-input-box">
          <input type="text" class="native-search-input" placeholder="搜索模型/构件" v-model="searchKey"
            @input="handleSearchInput" @keyup.enter="onSearch(searchKey)" />
          <button class="search-btn" :class="{ loading: searchLoading }" @click="onSearch(searchKey)">
            <view v-if="!searchLoading">搜索</view>
            <view class="loading-icon" v-else></view>
          </button>
        </view>
        <!-- 原生下拉搜索候选列表 -->
        <view class="search-dropdown" v-show="searchOptions.length > 0 && searchKey">
          <view class="search-option" v-for="(item, idx) in searchOptions" :key="idx"
            @click="onSearchResultSelect(item.value, item)">
            <view class="option-name">{{ item.value }}</view>
            <view class="option-path">{{ item.originData.path }}</view>
          </view>
        </view>
      </view>
      <Tree :tree-data="treeData" :expanded-keys="expandedKeys" :selected-keys="selectedKeys"
        @toggle-expand="handleToggleExpand" @node-click="handleNodeClick" @load-more="LoadMore"
        @model-action="handleModelAction" />


    </view>
  </view>
</template>

<script setup lang="ts">
import Tree from "@/components/tools/Tree.vue";
import { ref, watch, nextTick, onMounted } from "vue";
import { DragHelper } from "@/utils/DragHelper";
import { postAction } from "@/api";
import icon1 from "@/static/icons/icon_list_structure@3x.png";
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from "@/store";
import { AppEvent, ElementSelectedEventArgv } from "@/api/engine/AppEvent";

function handleModelAction(){
  
}
// 状态管理
const toolState = useToolPlaneStore();
// 根容器ref
const settingRoot = ref<HTMLElement | null>(null);
// 拖拽实例
const dragHelper = new DragHelper(settingRoot);

// ✅ 所有响应式变量 替代vue2的data
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
const treeData = ref<any[]>([]);
const isSearching = ref<boolean>(false);
const modelInfo = ref<any[]>([]);
const searchKey = ref<string>("");
const searchOptions = ref<any[]>([]);
const searchLoading = ref<boolean>(false);

// 右键菜单文本（纯中文）
const optAction = ref<string[]>([
  "重置", "显示全部", "半透明", "隔离", "高亮", "隐藏", "显示",
  "定位", "添加标记", "移除标记", "属性面板"
]);

// 常量配置
const PAGE_SIZE = 100;
const treeItemStyle = {
  color: "#FFF",
  fontSize: "16px",
  backgroundColor: "#324985",
  paddingLeft: "10px",
  paddingRight: "10px",
  minHeight: "25px",
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
};

/** ✅ 防抖函数 - TS重构 无this指向问题 */
const myDebounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

/** 展开第一个节点递归方法 */
const expendFirstNode = (array: any[], result: string[] = []) => {
  if (array && array.length > 0) {
    result.push(array[0].key);
    expendFirstNode(array[0].children, result);
  }
};

/** 搜索输入防抖处理 */
const handleSearchInput = myDebounce((e: Event) => {
  const val = (e.target as HTMLInputElement).value.trim();
  searchKey.value = val;
  val ? onSearch(val) : searchOptions.value = [];
}, 500);

/** 递归查找节点 - 核心方法 */
const findNodeByKey = (key: string, nodes: any[]): any => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeByKey(key, node.children);
      if (found) return found;
    }
  }
  return null;
};

/** 树懒加载核心方法 */
const onLoadData = (treeNode: any) => {
  return new Promise<void>((resolve) => {
    if (treeNode && treeNode.isLoadMore) { resolve(); return; }
    if (treeNode?.children && treeNode.children.length > 0) { resolve(); return; }

    postAction("/ModelStruct/GetTreeByParent", { modelId: treeNode.modelId, parentId: treeNode.id }).then((res) => {
      const data = res.Data || [];
      if (data && treeNode) {
        const array = data.map((item) => ({
          title: item?.name?.replace("_$AssimpFbx$_", " ") ?? "",
          key: `${treeNode.modelId}*${item.glid}`,
          modelId: treeNode.modelId,
          id: item.glid,
          children: [],
          style: treeItemStyle,
        }));

        if (array.length > PAGE_SIZE) {
          treeNode._allChildren = array;
          treeNode.children = array.slice(0, PAGE_SIZE);
          treeNode.children.push({
            title: '加载更多',
            key: `${treeNode.key}__loadmore__0`,
            isLeaf: true,
            isLoadMore: true,
            loadOffset: PAGE_SIZE,
            parentId: treeNode.id,
            modelId: treeNode.modelId,
            style: treeItemStyle,
          });
        } else {
          treeNode.children = array;
        }
      }
      resolve();
    }).catch(() => resolve());
  });
};

/** 加载更多核心方法 */
const LoadMore = (loadNodeKey: string) => {
  const parts = loadNodeKey.split('__loadmore__');
  if (parts.length < 2) return;
  const parentKey = parts[0];
  const parentNode = findNodeByKey(parentKey, treeData.value);
  if (!parentNode || !parentNode._allChildren) return;

  const loadNode = (parentNode.children || []).find((n: any) => n.isLoadMore);
  if (!loadNode) return;
  if (parentNode._loading) { setTimeout(() => LoadMore(loadNodeKey), 50); return; }

  parentNode._loading = true;
  const loadNodeIndex = (parentNode.children || []).findIndex((n: any) => n.key === loadNodeKey);
  if (loadNodeIndex === -1) { parentNode._loading = false; return; }

  const offset = parseInt(parts[1]) || 0;
  const all = parentNode._allChildren;
  const nextChunk = all.slice(offset, offset + PAGE_SIZE);

  parentNode.children.splice(loadNodeIndex, 1, ...nextChunk);
  const newOffset = offset + nextChunk.length;
  if (newOffset < all.length) {
    parentNode.children.splice(loadNodeIndex + nextChunk.length, 0, {
      title: '加载更多',
      key: `${parentKey}__loadmore__${newOffset}`,
      isLeaf: true,
      isLoadMore: true,
      loadOffset: newOffset,
      parentId: parentNode.id,
      modelId: parentNode.modelId,
      style: treeItemStyle,
    });
  }
  parentNode.children = [...parentNode.children];
  parentNode._loading = false;
};

/** 自动加载所有分页 */
const autoLoadAll = (parentKey: string) => {
  const parentNode = findNodeByKey(parentKey, treeData.value);
  if (!parentNode || !parentNode._allChildren) return;
  const loadNode = (parentNode.children || []).find((n: any) => n.isLoadMore);
  if (!loadNode) return;
  if (parentNode._loading) { setTimeout(() => autoLoadAll(parentKey), 50); return; }
  LoadMore(loadNode.key);
  setTimeout(() => autoLoadAll(parentKey), 30);
};

/** 定位并展开节点核心方法 */
const locateAndExpandNode = async (modelId: string, componentId: string, zoomFit = true) => {
  isSearching.value = true;
  try {
    const res = await postAction("/ModelStruct/GetTreePathByGId", { modelId, componentId });
    let pathNodes = res.Data;
    if (!pathNodes || pathNodes.length === 0) return;

    pathNodes = [...pathNodes].reverse();
    const pathKeys = pathNodes.map((node: any) => `${modelId}*${node.glid}`);
    const targetKey = pathKeys[pathKeys.length - 1];

    for (const key of pathKeys.slice(0, -1)) {
      if (!expandedKeys.value.includes(key)) {
        expandedKeys.value = [...expandedKeys.value, key];
        await nextTick();
        await new Promise(r => setTimeout(r, 200));
      }
    }
    selectedKeys.value = [targetKey];
    toolState.annotation.elementId = targetKey;
    if (zoomFit) onSelect([targetKey], { selectedNodes: pathNodes });
    scrollToTarget(pathNodes[pathNodes.length - 1].name);
  } finally {
    setTimeout(() => { isSearching.value = false; }, 500);
  }
};

/** 搜索方法 - 防抖 */
const onSearch = myDebounce(async (value: string) => {
  if (!value) return;
  searchLoading.value = true;
  try {
    const res = await postAction("/ModelStruct/SearchTreeByName", {
      name: value,
      modelId: toolState.models[0],
    });
    searchOptions.value = res.Data.map((item: any) => ({
      value: item.name,
      label: item.name,
      id: item.glid,
      originData: item,
      modelId: item.modelId,
    }));
  } finally {
    searchLoading.value = false;
  }
}, 500);

/** 搜索结果选中 */
const onSearchResultSelect = (value: string, option: any) => {
  locateAndExpandNode(option.modelId, option.id);
};

/** 滚动到目标节点 */
const scrollToTarget = async (nodeName: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const allNodes = Array.from(document.querySelectorAll(".tree-node-title"));
  const matchedElements = allNodes.filter(el => {
    const text = el.textContent;
    return text ? text.trim() === nodeName.trim() : false;
  });
  if (matchedElements.length > 0) {
    const targetEl = matchedElements[matchedElements.length - 1];
    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

/** 节点选中核心事件 */
const onSelect = async (Keys: string[], e: any) => {
  if (Keys.length === 0) { Medusa.ClearHighlightElement(); return; }
  toolState.SelectedTag = Keys[0].split("*")[0];
  selectedKeys.value = Keys;

  AppEvent.dispatchEvent({
    type: "OnTreeSelected",
    ModelId: Keys[0].split("*")[0],
    ElementId: Keys[0].split("*")[1],
  });

  Medusa.ClearHighlightElement();
  const elementId = Keys[0];
  let tags = elementId.split("*");
  if (tags.length !== 2) return;
  let modelId = tags[0];
  let elementGlId = tags[1];

  const ids = await GetChildrenIds(modelId, elementGlId, 400);
  if (ids.length === 0) return;
  let strIds = ids.map((glid: string) => `${modelId}*${glid}`);
  let strId = strIds.join("#");
  Medusa.HighLightElement(strId, 0, 31, 150, 0.7);
  Medusa.FlyToElement(strId);
};

/** 获取子节点ID */
const GetChildrenIds = async (modelId: string, parentId: string, count: number) => {
  const res = await postAction("/ModelStruct/GetModelsByParent", { modelId, parentId, count });
  return res.Data;
};

/** 判断是否为数字 */
const isNumber = (value: any) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/** 递归获取子节点 */
const GetChildren = async (modelId: string, parentId: string, count: number) => {
  let ids: string[] = [];
  const ress = await postAction("/ModelStruct/GetTreeByParent", { modelId, parentId });
  const res = ress.Data;
  for (let i = 0; i < res.length && ids.length < count; i++) {
    if (!isNumber(res[i].glid)) {
      let subIds = await GetChildren(modelId, res[i].glid, count - ids.length);
      ids.push(...subIds);
      if (ids.length >= count) return ids;
    } else {
      ids.push(res[i].glid);
    }
  }
  return ids;
};

/** 添加模型 */
const AddModel = (modelId: string) => {
  const index = toolState.models.indexOf(modelId);
  if (index > -1) {
    treeData.value?.filter((item: any) => item.modelId == modelId).forEach(item => { item.isRemoved = false; });
    Medusa.AddModel(modelId, modelId);
  }
};

/** 移除模型 */
const OnRemove = (modelId: string) => {
  const index = toolState.models.indexOf(modelId);
  if (index > -1) {
    treeData.value?.filter((item: any) => item.modelId == modelId).forEach(item => {
      item.children = [];
      item.isRemoved = true;
    });
    Medusa.RemoveModel(modelId);
  }
};

/** 节点展开/收起事件 */
const handleNodeExpand = async (key: string) => {
  if (expandedKeys.value.includes(key)) {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key);
  } else {
    expandedKeys.value = [...expandedKeys.value, key];
    const node = findNodeByKey(key, treeData.value);
    if (node) await onLoadData(node);
  }
};

/** 节点选中事件 */
const handleNodeSelect = (key: string) => {
  selectedKeys.value = [key];
  const node = findNodeByKey(key, treeData.value);
  if (node && !node.isLoadMore) onSelect([key], { selectedNodes: [node] });
};

/** 关闭面板 */
const handleClose = () => {
  toolState.structTree = false;
};

/** 绑定全局事件监听 */
const bindGlobalEvent = () => {
  // 加载模型信息
  AppEvent.addEventListener("OnLoadModelInfos", (data) => {
    let isFirst = false;
    toolState.models.forEach((modelId) => {
      postAction("/File/GetFileInfoByUuid", { value: modelId }).then((res) => {
        modelInfo.value?.push(res.Data);
        treeData.value = [];
        postAction("/ModelStruct/GetTreeRoot", { value: modelId }).then((res2) => {
          const data = res2.Data;
          if (data) {
            const array = data.map((item) => ({
              title: res.Data.name,
              isRoot: false,
              isRemoved: false,
              id: item.glid,
              key: `${modelId}*${item.glid}`,
              modelId: modelId,
              isLeaf: false,
              style: treeItemStyle,
            }));
            treeData.value?.push(...array);
            if (!isFirst && !isSearching.value) {
              isFirst = true;
              const selectArray: string[] = [];
              expendFirstNode(array, selectArray);
              expandedKeys.value = selectArray;
            }
          }
        });
      });
    });
  });

  // 元素选中
  AppEvent.addEventListener("OnElementSelected", (data: ElementSelectedEventArgv) => {
    selectedKeys.value = [];
    Medusa.ClearHighlightElement();
    if (data && data.ModelId && data.ElementId) {
      locateAndExpandNode(data.ModelId, data.ElementId, false);
    }
  });
};

// ✅ Vue3 生命周期
onMounted(() => {
  // 监听面板显示 层级置顶
  watch(() => toolState.structTree, (newVal) => {
    if (newVal && settingRoot.value) {
      settingRoot.value.style.zIndex = toolState.DivIndex++ + "";
    }
  })
  // 绑定全局事件
  bindGlobalEvent();
});

// ✅ Vue3 内部递归组件 TreeItem (核心替代小程序template)
// ✅ 节点展开/收起 (替代原TreeItem的toggleExpand)
const handleToggleExpand = (node: any) => {
  handleNodeExpand(node.key);
};

// ✅ 节点点击事件 (替代原TreeItem的handleNodeClick)
const handleNodeClick = (node: any) => {
  if (!node.isLoadMore) {
    handleToggleExpand(node);
    handleNodeSelect(node.key);
  }
};
</script>

<style scoped>
/* 根容器样式 保留原样式 */
.setting-root {
  color: #fff;
  width: 20vw;
  height: calc(100vh - 10%);
  background-color: #324985;
  position: fixed;
  font-size: 14px;
  top: 0px;
  left: 0px;
  border: #3471cb solid 1px;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

/* 原生头部样式 */
.plane-header {
  height: 36px;
  line-height: 36px;
  background-color: #3471cb;
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
}

.header-close {
  font-size: 20px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
}

.header-close:hover {
  background-color: #3c6bc9;
}

/* 主体内容区 保留原样式 */
.setting-content {
  background-color: #324985;
  margin: 0 10px 28px;
  height: calc(100vh - 230px);
  font-size: 14px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #3b5997 #324985;
  flex: 1;
}

.setting-content::-webkit-scrollbar {
  width: 6px;
}

.setting-content::-webkit-scrollbar-thumb {
  background-color: #3b5997;
  border-radius: 3px;
}

.setting-content::-webkit-scrollbar-track {
  background-color: #324985;
}

/* 原生搜索框样式 */
.search-wrapper {
  position: sticky;
  top: 0;
  z-index: 5;
  background-color: #324985;
  padding: 8px 0;
}

.search-input-box {
  display: flex;
  width: 100%;
  gap: 4px;
}

.native-search-input {
  flex: 1;
  height: 32px;
  background-color: #3b5997;
  color: #fff;
  border: 1px solid #3471cb;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 14px;
}

.native-search-input::placeholder {
  color: #ccc;
}

.search-btn {
  width: 60px;
  height: 32px;
  background-color: #3471cb;
  color: #fff;
  border: 1px solid #3471cb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  line-height: 32px;
  padding: 0;
}

.search-btn.loading {
  background-color: #3b5997;
  cursor: not-allowed;
}

.loading-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: loading 1s linear infinite;
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 搜索下拉列表样式 */
.search-dropdown {
  width: 100%;
  background-color: #355ea8;
  border: 1px solid #3471cb;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.search-option {
  display: flex;
  flex-direction: column;
  padding: 6px 8px;
  cursor: pointer;
}

.search-option:hover {
  background-color: #3c6bc9;
}

.option-name {
  font-weight: bold;
  color: #FFF;
  font-size: 14px;
}

.option-path {
  font-size: 11px;
  color: #ccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 纯原生树形结构核心样式 - 含连接线、缩进、选中高亮 */
.native-tree-container {
  width: 100%;
  color: #fff;
}

.tree-node-wrap {
  width: 100%;
}

.tree-node-header {
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 2px;
}

.tree-node-header.selected {
  background-color: #3471cb;
}

.tree-expand-btn {
  width: 16px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  color: #ccc;
  flex-shrink: 0;
}

.tree-empty-btn {
  width: 16px;
}

.tree-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  display: block;
  margin: 0 6px;
}

.load-more-icon {
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  margin: 0 6px;
  font-size: 16px;
}

.tree-node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.load-more-node {
  color: #40a9ff;
  cursor: pointer;
}

.load-more-node:hover {
  text-decoration: underline;
}

/* 节点操作按钮 */
.tree-action-box {
  margin-left: 8px;
}

.tree-action-tag {
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background-color: #355ea8;
  border: 1px solid #3471cb;
  border-radius: 2px;
  cursor: pointer;
  font-size: 14px;
}

.tree-action-tag:hover {
  background-color: #3c6bc9;
}

/* 子节点区域 + 连接线样式 */
.tree-children-wrap {
  padding-left: 20px;
  position: relative;
}

.tree-children-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: #3b5997;
}

/* 文本溢出省略 */
.line-limit-length {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>