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

.line-limit-length {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>