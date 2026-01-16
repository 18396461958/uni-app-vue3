<template>
  <div class="setting-root" ref="settingRoot">
    <!-- 头部标题栏 - 纯原生实现 替代TPlaneHeader -->
    <div class="plane-header" @mousedown="dragHelper.startDrag">
      <div class="header-title">结构树</div>
      <div class="header-close" @click="toolState.structTree = false">×</div>
    </div>
    
    <!-- 主体内容区 -->
    <div class="setting-content">
      <!-- 纯原生搜索框+下拉联想 替代 a-auto-complete + a-input-search -->
      <div class="search-wrapper">
        <div class="search-input-box">
          <input
            type="text"
            v-model="searchKey"
            class="native-search-input"
            placeholder="搜索模型/构件"
            @input="handleSearchInput"
            @keyup.enter="onSearch(searchKey)"
          />
          <button class="search-btn" @click="onSearch(searchKey)" :class="{loading:searchLoading}">
            <span v-if="!searchLoading">搜索</span>
            <span class="loading-icon" v-else></span>
          </button>
        </div>
        <!-- 原生下拉搜索候选列表 -->
        <div class="search-dropdown" v-show="searchOptions.length>0 && searchKey">
          <div 
            class="search-option" 
            v-for="(item,idx) in searchOptions" 
            :key="idx"
            @click="onSearchResultSelect(item.value, item)"
          >
            <div class="option-name">{{ item.value }}</div>
            <div class="option-path">{{ item.originData.path }}</div>
          </div>
        </div>
      </div>

      <!-- ✅ 核心：纯原生递归渲染树形结构 替代 antd-vue a-tree 完整实现所有功能 -->
      <div class="native-tree-container">
        <div class="tree-node" v-for="node in treeData" :key="node.key">
          <tree-node 
            :node="node" 
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            @node-expand="handleNodeExpand"
            @node-select="handleNodeSelect"
            @load-more="LoadMore"
            @add-model="AddModel"
            @remove-model="OnRemove"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 树形节点递归组件 纯原生实现 核心组件 -->
  <template id="treeNode">
    <div class="tree-node-wrap">
      <!-- 节点头部 - 展开/收起/图标/标题/操作按钮 -->
      <div 
        class="tree-node-header" 
        :class="{selected: selectedKeys.includes(node.key)}"
        @click.stop="handleNodeClick"
      >
        <!-- 展开/收起按钮 -->
        <span class="tree-expand-btn" v-if="!node.isLeaf && !node.isLoadMore" @click.stop="toggleExpand">
          {{ expandedKeys.includes(node.key) ? '−' : '+' }}
        </span>
        <span class="tree-expand-btn tree-empty-btn" v-else></span>
        
        <!-- 节点图标 -->
        <img class="tree-icon" :src="icon1" alt="" v-if="!node.isLoadMore" />
        <span class="tree-icon load-more-icon" v-else>⊞</span>
        
        <!-- 节点标题 -->
        <div class="tree-node-title line-limit-length" :title="node.title">
          <template v-if="node.isLoadMore">
            <span class="load-more-node" @click.stop="$emit('load-more', node.key)">{{ node.title }}</span>
          </template>
          <template v-else>
            <span>{{ node.title }}</span>
            <!-- 根节点操作按钮 纯原生替代 a-tag + a-tooltip -->
            <div class="tree-action-box" v-if="node.isRoot">
              <span 
                class="tree-action-tag" 
                :title="node.isRemoved ? '添加模型' : '移除模型'"
                @click.stop="node.isRemoved ? $emit('add-model', node.modelId) : $emit('remove-model', node.modelId)"
              >
                {{ node.isRemoved ? '➕' : '🗑️' }}
              </span>
            </div>
          </template>
        </div>
      </div>

      <!-- 子节点区域 - 懒加载+递归渲染 带连接线 -->
      <div 
        class="tree-children-wrap" 
        v-show="expandedKeys.includes(node.key)"
        v-if="!node.isLeaf && !node.isLoadMore"
      >
        <div class="tree-children-line"></div>
        <div class="tree-node" v-for="child in node.children" :key="child.key">
          <tree-node 
            :node="child" 
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            @node-expand="$emit('node-expand', ...arguments)"
            @node-select="$emit('node-select', ...arguments)"
            @load-more="$emit('load-more', ...arguments)"
            @add-model="$emit('add-model', ...arguments)"
            @remove-model="$emit('remove-model', ...arguments)"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { DragHelper } from "@/utils/DragHelper";
import { onMounted } from "vue";
import { postAction } from "@/api";
import icon1 from "@/static/icons/icon_list_structure@3x.png";
import { Medusa } from "@/static/engine.sdk";
import { useToolPlaneStore } from "@/store";
import { AppEvent, ElementSelectedEventArgv } from "@/api/engine/AppEvent";

// 全局状态 & 基础变量
const toolState = useToolPlaneStore();
const settingRoot = ref(null);
const dragHelper = new DragHelper(settingRoot);
const expandedKeys = ref([]);
const selectedKeys = ref([]);
const treeData = ref([]);
const isSearching = ref(false);
const modelInfo = ref([]);

// 搜索相关变量
const searchKey = ref("");
const searchOptions = ref([]);
const searchLoading = ref(false);

// 右键菜单文本（已移除多语言 改为中文）
const optAction = ref([
  "重置", "显示全部", "半透明", "隔离", "高亮", "隐藏", "显示", 
  "定位", "添加标记", "移除标记", "属性面板"
]);

// 节点默认样式
const treeItemStyle = {
  color: "#FFF",
  fontSize: "16px",
  backgroundColor: "#324985",
  paddingLeft: "10px",
  paddingRight: "10px",
  "min-height": "25px",
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "flex-start",
};

/** 防抖函数 - 保留原逻辑 */
function myDebounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/** 展开第一个节点递归方法 */
function expendFirstNode(array, result = []) {
  if (array && array.length > 0) {
    result.push(array[0].key);
    expendFirstNode(array[0].children);
  }
}

/** 搜索输入防抖处理 */
const handleSearchInput = myDebounce((e) => {
  const val = e.target.value.trim();
  searchKey.value = val;
  if(val) onSearch(val);
  else searchOptions.value = [];
}, 500);

/** 监听面板显示 层级置顶 */
watch(() => toolState.structTree, (newVal) => {
  if (newVal && settingRoot.value) {
    settingRoot.value.style.zIndex = toolState.DivIndex++ + "";
  }
})

/** 递归查找节点 */
function findNodeByKey(key, nodes) {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeByKey(key, node.children);
      if (found) return found;
    }
  }
  return null;
}

/** 分页常量 & 树懒加载核心方法 - 保留原逻辑 */
const PAGE_SIZE = 100;
const onLoadData = treeNode => {
  return new Promise(resolve => {
    if (treeNode && treeNode.isLoadMore) { resolve(); return; }
    if (treeNode?.children && treeNode.children.length > 0) { resolve(); return; }

    postAction("/ModelStruct/GetTreeByParent", { modelId: treeNode.modelId, parentId: treeNode.id }).then((res) => {
      const data = res || [];
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
    }).catch(()=>resolve());
  });
};

/** 加载更多核心方法 - 保留原逻辑 */
function LoadMore(loadNodeKey) {
  const parts = loadNodeKey.split('__loadmore__');
  if (parts.length < 2) return;
  const parentKey = parts[0];
  const parentNode = findNodeByKey(parentKey, treeData.value);
  if (!parentNode || !parentNode._allChildren) return;

  const loadNode = (parentNode.children || []).find(n => n.isLoadMore);
  if (!loadNode) return;
  if (parentNode._loading) { setTimeout(()=> LoadMore(loadNodeKey), 50); return; }

  parentNode._loading = true;
  const loadNodeIndex = (parentNode.children || []).findIndex(n => n.key === loadNodeKey);
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
}

/** 自动加载所有分页 */
function autoLoadAll(parentKey) {
  const parentNode = findNodeByKey(parentKey, treeData.value);
  if (!parentNode || !parentNode._allChildren) return;
  const loadNode = (parentNode.children || []).find(n => n.isLoadMore);
  if (!loadNode) return;
  if (parentNode._loading) { setTimeout(()=> autoLoadAll(parentKey), 50); return; }
  LoadMore(loadNode.key);
  setTimeout(()=> autoLoadAll(parentKey), 30);
}

/** 定位并展开节点核心方法 - 保留原逻辑 */
async function locateAndExpandNode(modelId, componentId, zoomFit = true) {
  isSearching.value = true;
  try {
    const res = await postAction("/ModelStruct/GetTreePathByGId", { modelId, componentId });
    let pathNodes = res;
    if (!pathNodes || pathNodes.length === 0) return;

    pathNodes = [...pathNodes].reverse();
    const pathKeys = pathNodes.map(node => `${modelId}*${node.glid}`);
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
    if(zoomFit) onSelect([targetKey], { selectedNodes: pathNodes });
    scrollToTarget(pathNodes[pathNodes.length - 1].name);
  } finally {
    setTimeout(() => { isSearching.value = false; }, 500);
  }
}

/** 搜索方法 - 防抖 */
const onSearch = myDebounce((value) => {
  if (!value) return;
  searchLoading.value = true;
  postAction("/ModelStruct/SearchTreeByName", {
    name: value,
    modelId: toolState.models[0],
  }).then((res) => {
    searchOptions.value = res.map(item => ({
      value: item.name,
      label: item.name,
      id: item.glid,
      originData: item,
      modelId: item.modelId,
    }));
  }).finally(() => searchLoading.value = false);
}, 500);

/** 搜索结果选中 */
function onSearchResultSelect(value, option) {
  locateAndExpandNode(option.modelId, option.id);
}

/** 滚动到目标节点 */
async function scrollToTarget(nodeName) {
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
}

/** 节点选中核心事件 - 保留原逻辑 */
function onSelect(Keys, e) {
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
  if(tags.length !=2) return;
  let modelId = tags[0];
  let elementGlId = tags[1];

  GetChildrenIds(modelId, elementGlId, 400).then((ids) => {
   if(ids.length ==0) return;
    let strIds = ids.map(glid => `${modelId}*${glid}`);
    let strId = "";
    for(let i =0;i<strIds.length;i++){ strId+= strIds[i]+"#"; }
    Medusa.HighLightElement(strId, 0, 31, 150, 0.7);
    Medusa.FlyToElement(strId);
  });
}

/** 获取子节点ID */
async function GetChildrenIds(modelId, parentId, count) {
  let res = await postAction("/ModelStruct/GetModelsByParent", { modelId, parentId, count });
  return res;
}

/** 判断是否为数字 */
function isNumber(value) {
  return!isNaN(parseFloat(value)) && isFinite(value);
}

/** 递归获取子节点 */
async function GetChildren(modelId, parentId, count) {
  let ids = [];
  let res = await postAction("/ModelStruct/GetTreeByParent", { modelId, parentId });
  for(let i =0;i<res.length && ids.length < count;i++){
    if(!isNumber(res[i].glid)){
      let subIds = await GetChildren(modelId,res[i].glid, count - ids.length);
      ids.push(...subIds);
      if(ids.length >= count) return ids;
    } else {
      ids.push(res[i].glid);
    }
  }
  return ids;
}

/** 添加模型 */
function AddModel(modelId) {
  const index = toolState.models.indexOf(modelId);
  if (index > -1) {
    treeData.value?.filter(item => item.modelId == modelId).forEach(item => { item.isRemoved = false; });
    Medusa.AddModel(modelId, modelId);
  }
}

/** 移除模型 */
function OnRemove(modelId) {
  const index = toolState.models.indexOf(modelId);
  if (index > -1) {
    treeData.value?.filter(item => item.modelId == modelId).forEach(item => {
      item.children = [];
      item.isRemoved = true;
    });
    Medusa.RemoveModel(modelId);
  }
}

/** 节点展开/收起事件 */
function handleNodeExpand(key) {
  if (expandedKeys.value.includes(key)) {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key);
  } else {
    expandedKeys.value = [...expandedKeys.value, key];
    const node = findNodeByKey(key, treeData.value);
    if(node) onLoadData(node);
  }
}

/** 节点选中事件 */
function handleNodeSelect(key) {
  selectedKeys.value = [key];
  const node = findNodeByKey(key, treeData.value);
  if(node && !node.isLoadMore) onSelect([key], {selectedNodes:[node]});
}

/** 节点点击事件 */
function handleNodeClick(node) {
  handleNodeExpand(node.key);
  handleNodeSelect(node.key);
}

/** 事件监听 - 加载模型信息 */
AppEvent.addEventListener("OnLoadModelInfos", (data) => {
  let isFirst = false;
  toolState.models.forEach((modelId) => {
    postAction("/File/GetFileInfoByUuid", { value: modelId }).then((res) => {
      modelInfo.value?.push(res);
      treeData.value = [];
      postAction("/ModelStruct/GetTreeRoot", { value: modelId }).then((res2) => {
        const data = res2;
        if (data) {
          const array = data.map((item) => ({
            title: res.name,
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
            const selectArray = [];
            expendFirstNode(array, selectArray);
            expandedKeys.value = selectArray;
          }
        }
      });
    });
  });
});

/** 事件监听 - 元素选中 */
AppEvent.addEventListener("OnElementSelected", (data) => {
  selectedKeys.value = [];
  Medusa.ClearHighlightElement();
  if(data && data.ModelId && data.ElementId){
    locateAndExpandNode(data.ModelId, data.ElementId,false);
  }
});
</script>

<style scoped>
/* 根容器样式 保留原样式 */
.setting-root {
  color: #fff;
  width: 340px;
  height: calc(100vh - 148px);
  background-color: #324985;
  position: fixed;
  font-size: 14px;
  top: 74px;
  left: 10px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* ✅ 纯原生树形结构核心样式 - 含连接线、缩进、选中高亮 */
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