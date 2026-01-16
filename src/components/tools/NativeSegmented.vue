<template>
    <view class="native-segmented">
        <view 
            class="segmented-item" 
            :class="{active: modelValue === item}"
            v-for="(item, index) in options" 
            :key="index"
            @click="handleItemClick(item)"
        >
            {{ item }}
        </view>
    </view>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string
    options: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: string]
    change: [value: string]
}>()

const handleItemClick = (item: string) => {
    emit('update:modelValue', item)
    emit('change', item)
}
</script>

<style scoped>
.native-segmented {
    display: flex;
    width: 100%;
    margin-top: 10px;
    border-radius: 4px;
    background-color: #283a6e;
}
.segmented-item {
    flex: 1;
    text-align: center;
    padding: 6px 0;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}
.segmented-item.active {
    background-color: #6BFF6B;
    color: #324985;
    font-weight: bold;
}
</style>