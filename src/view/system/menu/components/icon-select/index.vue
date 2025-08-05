<!--
  * 图标 选择
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-09-01 23:14:49
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div>
    <el-popover v-model:visible="visible" placement="bottom" trigger="click" width="430" :teleported="false">
      <template #reference>
        <slot name="iconSelect"></slot>
      </template>

      <template #default>
        <el-form>
          <!-- <el-form-item>
            <el-radio-group @change="updateSelectIconArray" v-model="iconStyle" style="margin: 8px">
              <el-radio-button value="outlined">线框风格</el-radio-button>
              <el-radio-button value="filled">实底风格</el-radio-button>
              <el-radio-button value="twoTone">双色风格</el-radio-button>
            </el-radio-group>
          </el-form-item> -->
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
            <component :is="(ElementIcons as any)[item]" />
          </div>
          <div v-show="showMoreIndex > 0" style="width: 100%; text-align: center; margin-top: 10px;">
            <el-button type="primary" link @click="showMore">点击展开更多图标（因图标较多，可能会卡一小会）</el-button>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
  import { Search } from '@element-plus/icons-vue'
  import * as ElementIcons from '@element-plus/icons-vue'
  import { computed, ref, watch } from 'vue'
  import _ from 'lodash'

  // Element Plus图标数组
  const allIconsArray = Object.keys(ElementIcons)
  // 线框风格图标数组（Element Plus图标都是线框风格）
  const outlinedIconArray = allIconsArray
  // 实底风格图标数组（使用相同的图标）
  const filledIconArray = allIconsArray
  // 双色风格图标数组（使用相同的图标）
  const twoToneIconArray = allIconsArray

  // ------------ 显示/隐藏 ------------
  const visible = ref(false)

  // ------------ 展开更多 ------------
  const SHOW_MORE_LENGTH = 35
  const showMoreIndex = ref(SHOW_MORE_LENGTH)
  function showMore() {
    showMoreIndex.value = -1
  }

  // ------------ 图标展示与搜索 ------------

  const iconStyle = ref('outlined')
  const selectIconArray = ref([...outlinedIconArray])

  const iconLoopArray = computed(() => {
    return _.slice(selectIconArray.value, 0, showMoreIndex.value)
  })

  watch(iconStyle, (newValue, oldValue) => {
    updateSelectIconArray()
  })

  let searchValue = ref('')
  function updateSelectIconArray() {
    let tempArray = null
    if (iconStyle.value === 'outlined') {
      tempArray = outlinedIconArray
    } else if (iconStyle.value === 'filled') {
      tempArray = filledIconArray
    } else {
      tempArray = twoToneIconArray
    }
    if (!searchValue.value) {
      selectIconArray.value = tempArray
    } else {
      selectIconArray.value = tempArray.filter((e) => e.toLowerCase().includes(searchValue.value.toLowerCase()))
    }

    if (selectIconArray.value.length > SHOW_MORE_LENGTH) {
      showMoreIndex.value = SHOW_MORE_LENGTH
    }
  }

  // ------------ 对外抛出选择图标事件 ------------
  const emit = defineEmits<{
    updateIcon: [icon: string]
  }>()
  function handleClick(icon: string) {
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
    
    .more-icon {
      font-size: 14px;
      margin: 5px;
    }
  }
  
  .icon-content:hover {
    background: var(--el-color-primary);
    color: white;
  }
</style>
