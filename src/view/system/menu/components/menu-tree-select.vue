<!--
  * 菜单 表单 树形下拉框
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-06-12 20:11:39
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <el-tree-select
    :model-value="props.value"
    :data="treeData"
    :props="{ label: 'menuName', children: 'children', value: 'id' }"
    filterable
    :teleported="false"
    class="menu-tree-select"
    placeholder="请选择菜单"
    clearable
    check-strictly
    default-expand-all
    @change="treeSelectChange"
  />
</template>
<script setup>
  import { onMounted, ref } from 'vue'
  import * as menuApi from '@/api/menu'
  import { STATIC_MENU_DATA, MENU_TYPE_ENUM } from '@/constants/menu-const'
  import { useStore } from '@/store/pinia'
  import _ from 'lodash'

  const props = defineProps({
    value: [String, Number],
  })

  let treeData = ref([])
  
  // 过滤掉按钮类型的菜单，只显示目录和菜单
  function filterMenuTree(menuList) {
    return menuList.filter(menu => {
      // 过滤掉按钮类型
      if (menu.menuType === MENU_TYPE_ENUM.POINTS.value) {
        return false
      }
      
      // 如果有子菜单，递归过滤
      if (menu.children && menu.children.length > 0) {
        menu.children = filterMenuTree(menu.children)
      }
      
      return true
    })
  }
  
  async function queryMenuTree() {
    try {
      // 获取当前用户的roleId
      const store = useStore()
      
      // 尝试从API获取最新数据
      try {
        let res = await menuApi.queryMenuTree({
          key: '',
          menuType: '', // 不限制类型，在本地过滤
          status: 'T',   // 只获取启用的菜单
          roleId: store.roleId || '' // 添加roleId参数
        })
        
        if (res  && res.length > 0) {
          treeData.value = filterMenuTree(_.cloneDeep(res))
        } else {
          // API调用成功但无数据，使用静态数据
          treeData.value = filterMenuTree(_.cloneDeep(STATIC_MENU_DATA))
        }
      } catch (apiError) {
        console.warn('API调用失败，使用静态菜单数据:', apiError)
        treeData.value = filterMenuTree(_.cloneDeep(STATIC_MENU_DATA))
      }
    } catch (error) {
      console.error('查询菜单树失败:', error)
      // 确保至少有静态数据
      treeData.value = filterMenuTree(_.cloneDeep(STATIC_MENU_DATA))
    }
  }

  onMounted(queryMenuTree)

  const emit = defineEmits(['update:value'])
  function treeSelectChange(value) {
    emit('update:value', value)
  }

  defineExpose({
    queryMenuTree,
  })
</script>
<style lang="scss" scoped>
.custom-tree-select .el-tree-node__label {
  text-align: left;
}
</style>
