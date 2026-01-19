<template>
  <view class="tree-node-wrap">
    <view class="tree-node-header" :class="{ selected: selectedKeys.includes(node.key) }">
      <!-- 展开/收起按钮 -->
      <span 
        class="tree-expand-btn" 
        v-if="!node.isLeaf && !node.isLoadMore"
        @click.stop="$emit('toggle-expand', node)"
      >
        {{ expandedKeys.includes(node.key) ? '−' : '+' }}
      </span>
      <span class="tree-expand-btn tree-empty-btn" v-else></span>

      <!-- 节点图标 -->
      <img class="tree-icon" :src="icon1" alt="" v-if="!node.isLoadMore" />
      <span class="tree-icon load-more-icon" v-else>⊞</span>

      <!-- 节点内容 -->
      <div class="tree-node-title line-limit-length" :title="node.title">
        <template v-if="node.isLoadMore">
          <span class="load-more-node" @click.stop="$emit('load-more', node)">{{ node.title }}</span>
        </template>
        <template v-else>
          <span @click.stop="$emit('node-click', node)">{{ node.title }}</span>
          <div class="tree-action-box" v-if="node.isRoot">
            <span 
              class="tree-action-tag" 
              :title="node.isRemoved ? '添加模型' : '移除模型'"
              @click.stop="$emit('model-action', node)"
            >
              {{ node.isRemoved ? '➕' : '🗑️' }}
            </span>
          </div>
        </template>
      </div>
    </view>

    <!-- 子节点递归渲染 -->
    <div 
      class="tree-children-wrap" 
      v-show="expandedKeys.includes(node.key)"
      v-if="!node.isLeaf && !node.isLoadMore"
    >
      <div class="tree-children-line"></div>
      <tree-node
        v-for="child in node.children"
        :key="child.key"
        :node="child"
        :expanded-keys="expandedKeys"
        :selected-keys="selectedKeys"
        @toggle-expand="$emit('toggle-expand', $event)"
        @node-click="$emit('node-click', $event)"
        @load-more="$emit('load-more', $event)"
        @model-action="$emit('model-action', $event)"
      />
    </div>
  </view>
</template>

<script setup lang="ts">
// 导入图标（需要根据你的实际路径调整）
import icon1 from "@/static/icons/icon_list_structure@3x.png"

// 定义Props
defineProps({
  node: {
    type: Object,
    required: true
  },
  expandedKeys: {
    type: Array as () => string[],
    required: true
  },
  selectedKeys: {
    type: Array as () => string[],
    required: true
  }
})

// 定义事件
defineEmits(['toggle-expand', 'node-click', 'load-more', 'model-action'])
</script>

<style scoped>
.tree-node-wrap {
  width: 100%;
}

/** 核心压缩：节点行高从32→26，内边距缩小，整体高度省空间 **/
.tree-node-header {
  height: 26px;
  line-height: 26px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 2px; /* 左右内边距减半 */
  border-radius: 2px;
}

.tree-node-header.selected {
  background-color: #3471cb;
}

/** 展开/收起按钮 紧凑化：宽度缩小+字号缩小+行高同步 **/
.tree-expand-btn {
  width: 12px; /* 宽度从16→12 */
  height: 26px;
  line-height: 26px;
  text-align: center;
  font-size: 11px; /* 按钮字号缩小 */
  color: #ccc;
  flex-shrink: 0;
}

.tree-empty-btn {
  width: 12px; /* 和按钮同宽，对齐更紧凑 */
}

/** 节点图标 缩小+间距缩小，横向省空间 **/
.tree-icon {
  width: 14px;  /* 图标尺寸从18→14 */
  height: 14px;
  flex-shrink: 0;
  display: block;
  margin: 0 4px; /* 左右间距从6→4 */
}

.load-more-icon {
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  margin: 0 4px;
  font-size: 12px; /* 加载图标字号缩小 */
}

/** 标题区 继承全局12px小字体，保留省略号逻辑，间距紧凑 **/
.tree-node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: inherit; /* 继承父级12px小字体 */
}

.load-more-node {
  color: #40a9ff;
  cursor: pointer;
  font-size: 12px;
}

.load-more-node:hover {
  text-decoration: underline;
}

/** 操作按钮区 间距缩小，按钮尺寸缩小，适配紧凑布局 **/
.tree-action-box {
  margin-left: 4px; /* 间距从8→4 */
}

.tree-action-tag {
  width: 20px;  /* 按钮尺寸从24→20 */
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #355ea8;
  border: 1px solid #3471cb;
	border-radius: 2px;
  cursor: pointer;
  font-size: 11px; /* 按钮图标字号缩小 */
  flex-shrink: 0;
}

.tree-action-tag:hover {
  background-color: #3c6bc9;
}

/** 核心优化：子节点缩进从20→14，移动端横向巨省空间！！ **/
.tree-children-wrap {
  padding-left: 14px; /* 子节点缩进大幅缩小，关键优化 */
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

.line-limit-length {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>