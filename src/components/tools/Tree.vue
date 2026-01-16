<template>
  <view class="native-tree-container">
    <!-- 递归渲染树形结构 -->
    <tree-node 
      v-for="node in treeData" 
      :key="node.key"
      :node="node"
      :expanded-keys="expandedKeys"
      :selected-keys="selectedKeys"
      @toggle-expand="$emit('toggle-expand', $event)"
      @node-click="$emit('node-click', $event)"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import TreeNode from './TreeNode.vue'

// 定义Props
defineProps({
  treeData: {
    type: Array as () => any[],
    default: () => []
  },
  expandedKeys: {
    type: Array as () => string[],
    default: () => []
  },
  selectedKeys: {
    type: Array as () => string[],
    default: () => []
  }
})

// 定义事件
defineEmits(['toggle-expand', 'node-click'])
</script>

<style scoped>
.native-tree-container {
  width: 100%;
  color: #fff;
}
</style>