<template>
  <div>
    <el-popover v-model:visible="visible" placement="bottom" trigger="click" width="430" :teleported="false">
      <template #reference>
        <slot name="iconSelect"></slot>
      </template>

      <template #default>
        <el-form>
          <el-form-item>
            <el-input v-model="searchValue" placeholder="输入英文关键词进行搜索" @input="updateSelectIconArray" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-form>

        <div class="icon-box">
          <div v-for="item in iconLoopArray" :key="item" @click="handleClick(item)" class="icon-content">
            <component :is="ElementIcons[item]" />
          </div>
          <div v-show="showMoreIndex > 0" style="width: 100%; text-align: center; margin-top: 10px;">
            <el-button type="primary" link @click="showMore">点击展开更多图标</el-button>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue'
import * as ElementIcons from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import _ from 'lodash'

// Element Plus图标数组
const allIconsArray = Object.keys(ElementIcons)

// 显示/隐藏
const visible = ref(false)

// 展开更多
const SHOW_MORE_LENGTH = 35
const showMoreIndex = ref(SHOW_MORE_LENGTH)
function showMore() {
  showMoreIndex.value = -1
}

// 图标展示与搜索
const selectIconArray = ref([...allIconsArray])

const iconLoopArray = computed(() => {
  return _.slice(selectIconArray.value, 0, showMoreIndex.value)
})

let searchValue = ref('')
function updateSelectIconArray() {
  if (!searchValue.value) {
    selectIconArray.value = allIconsArray
  } else {
    selectIconArray.value = allIconsArray.filter((e) => e.toLowerCase().includes(searchValue.value.toLowerCase()))
  }

  if (selectIconArray.value.length > SHOW_MORE_LENGTH) {
    showMoreIndex.value = SHOW_MORE_LENGTH
  }
}

// 对外抛出选择图标事件
const emit = defineEmits(['updateIcon'])
function handleClick(icon) {
  visible.value = false
  emit('updateIcon', icon)
}
</script>

<style scoped lang="scss">
.icon-box {
  overflow: auto;
  font-size: 20px;
  width: 410px;
  height: 300px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: flex-start;
}

.icon-content {
  width: 45px;
  height: 40px;
  margin: 5px;
  cursor: pointer;
  text-align: center;
  border-radius: 6px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-content:hover {
  background: var(--el-color-primary);
  color: white;
}
</style> 