<!--
  * 菜单列表
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-06-12 20:11:39
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <div class="menu-container">
    

    <el-card shadow="never" :body-style="{ padding: '16px' }">
      <el-form class="smart-query-form">
      <el-row class="smart-query-form-row">
        <el-form-item label="关键字" class="smart-query-form-item">
          <el-input style="width: 300px" v-model="queryForm.key" placeholder="菜单名称/路由地址/组件路径/权限字符串" clearable />
        </el-form-item>

        <el-form-item label="类型" class="smart-query-form-item">
          <el-select v-model="queryForm.menuType" placeholder="请选择类型" clearable style="width: 120px" :teleported="false">
            <el-option v-for="item in MENU_TYPE_ENUM_LIST" :key="item.value" :label="item.desc" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" class="smart-query-form-item">
          <el-select v-model="queryForm.status" placeholder="全部" clearable style="width: 120px" :teleported="false">
            <el-option label="启用" :value="'T'" />
            <el-option label="禁用" :value="'F'" />
          </el-select>
        </el-form-item>

        <el-form-item class="smart-query-form-item smart-margin-left10">
          <el-button-group>
            <el-button type="primary" @click="query">
              <template #icon>
                <Search />
              </template>
              查询
            </el-button>

            <el-button @click="resetQuery">
              <template #icon>
                <Refresh />
              </template>
              重置
            </el-button>
          </el-button-group>
          <el-button class="smart-margin-left20" @click="moreQueryConditionFlag = !moreQueryConditionFlag">
            <template #icon>
              <MoreFilled />
            </template>
            {{ moreQueryConditionFlag ? '收起' : '展开' }}
          </el-button>
        </el-form-item>
      </el-row>

      <el-row class="smart-query-form-row" v-show="moreQueryConditionFlag">
        <el-form-item label="外链" class="smart-query-form-item">
          <el-select v-model="queryForm.frameFlag" placeholder="全部" clearable style="width: 120px" :teleported="false">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="缓存" class="smart-query-form-item">
          <el-select v-model="queryForm.cacheFlag" placeholder="全部" clearable style="width: 120px" :teleported="false">
            <el-option label="开启" :value="true" />
            <el-option label="关闭" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="显示" class="smart-query-form-item">
          <el-select v-model="queryForm.visibleFlag" placeholder="全部" clearable style="width: 120px" :teleported="false">
            <el-option label="显示" :value="true" />
            <el-option label="隐藏" :value="false" />
          </el-select>
        </el-form-item>
      </el-row>
    </el-form>
      <el-row class="smart-table-btn-block">
        <div class="smart-table-operate-block">
          <el-button type="primary" @click="showDrawer">
            <template #icon>
              <Plus />
            </template>
            添加菜单
          </el-button>

          <el-button type="danger" @click="batchDelete" :disabled="!hasSelected">
            <template #icon>
              <Delete />
            </template>
            批量删除
          </el-button>
        </div>
      </el-row>

      <el-table
        :data="tableData"
  
        border
        v-loading="tableLoading"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        @selection-change="onSelectChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="menuName" label="名称" min-width="180" />
        <el-table-column prop="menuType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.menuType === 'M' ? 'danger' : row.menuType === 'C' ? 'primary' : row.menuType === 'F' ? 'warning' : 'info'"
            >
              {{ getMenuTypeDesc(row.menuType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon && row.menuType !== 'F'">
              <component :is="getIconComponent(row.icon)" />
            </el-icon>
            <span v-else class="no-icon">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="路径" min-width="200"  />
        <el-table-column prop="component" label="组件" min-width="200" >
          <template #default="{ row }">
            <span>{{ row.component }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permission" label="权限标识" min-width="150"  />
        <el-table-column prop="orderNum" label="顺序" width="80" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'T' ? 'success' : 'danger'">
              {{ getStatusDesc(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="smart-table-operate">
              <el-button
                v-if="row.menuType !== MENU_TYPE_ENUM.POINTS.value"
                type="primary"
                link
                 
                @click="showAddSub(row)"
              >
                添加下级
              </el-button>
              <el-button type="primary" link   @click="showDrawer(row)">编辑</el-button>
              <el-button type="danger" link   @click="singleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuOperateModal ref="menuOperateModal" @reloadList="query" />
  </div>
</template>
<script setup>
  import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
  import { Search, Refresh, Plus, Delete, MoreFilled } from '@element-plus/icons-vue'
  import * as ElementPlusIconsVue from '@element-plus/icons-vue'
  import _ from 'lodash'
  import { computed, onMounted, reactive, ref } from 'vue'
  import MenuOperateModal from './components/menu-operate-modal.vue'
  import { buildMenuTableTree, filterMenuByQueryForm } from './menu-data-handler'
  import { MENU_TYPE_ENUM, STATIC_MENU_DATA } from '@/constants/menu-const'
  import * as menuApi from '@/api/menu'
  import { useStore } from '@/store/pinia'

  // 转换枚举为数组
  const MENU_TYPE_ENUM_LIST = Object.values(MENU_TYPE_ENUM)

  // ------------------------ 表格渲染 ------------------------
  const menuTypeColorArray = ['danger', 'primary', 'warning', 'success']

  // 获取菜单类型描述
  function getMenuTypeDesc(menuType) {
    const found = MENU_TYPE_ENUM_LIST.find(item => item.value === menuType)
    return found ? found.desc : ''
  }

  // 获取菜单状态描述
  function getStatusDesc(status) {
    return status === 'T' ? '启用' : '禁用'
  }

  // ------------------------ 查询表单 ------------------------
  const queryFormState = {
    key: '',
    menuType: '',
    status: ''
  }
  const queryForm = reactive({ ...queryFormState })
  //展开更多查询参数
  const moreQueryConditionFlag = ref(false)

  // ------------------------ table表格数据和查询方法 ------------------------

  const tableLoading = ref(false)
  const tableData = ref([])

  function resetQuery() {
    Object.assign(queryForm, queryFormState)
    query()
  }

  onMounted(query)

  async function query() {
    try {
      tableLoading.value = true
      
      // 获取当前用户的roleId
      const store = useStore()
      
      // 调用真实API
      try {
        let responseModel = await menuApi.queryMenuTree({
          key: queryForm.key,
          menuType: queryForm.menuType,
          status: queryForm.status,
          roleId: store.roleId || '' // 添加roleId参数
        })
        
        if (responseModel) {
          tableData.value = responseModel
        } else {
          // 如果API调用失败，使用静态数据
          tableData.value = _.cloneDeep(STATIC_MENU_DATA)
        }
      } catch (apiError) {
        console.warn('API调用失败，使用静态菜单数据:', apiError)
        tableData.value = _.cloneDeep(STATIC_MENU_DATA)
      }
    } catch (e) {
      console.error('查询菜单失败:', e)
      ElMessage.error('查询菜单失败')
    } finally {
      tableLoading.value = false
    }
  }

  // -------------- 多选操作 --------------
  const selectedRowKeys = ref([])
  let selectedRows = []
  const hasSelected = computed(() => selectedRowKeys.value.length > 0)

  function onSelectChange(selection) {
    selectedRowKeys.value = selection.map(row => row.id)
    selectedRows = selection
  }

  function singleDelete(record) {
    confirmBatchDelete([record])
  }

  function batchDelete() {
    confirmBatchDelete(selectedRows)
  }

  function confirmBatchDelete(menuArray) {
    const menuNameArray = menuArray.map((e) => e.menuName)
    ElMessageBox.confirm(
      `确定要删除如下菜单吗? ${_.join(menuNameArray, '、')}`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    ).then(() => {
      const menuIdList = menuArray.map((e) => e.id)
      requestBatchDelete(menuIdList)
      selectedRows = []
    }).catch(() => {
      // 用户取消删除
    })

    async function requestBatchDelete(menuIdList) {
      const loading = ElLoading.service({
        lock: true,
        text: '删除中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      
      try {
        await menuApi.deleteMenu(menuIdList)
        ElMessage.success('删除成功!')
        query()
      } catch (e) {
        console.error('删除失败:', e)
        ElMessage.error('删除失败')
      } finally {
        loading.close()
      }
    }
  }

  // -------------- 添加、修改 右侧抽屉 --------------
  const menuOperateModal = ref()
  function showDrawer(rowData) {
    menuOperateModal.value.showDrawer(rowData)
  }

  function showAddSub(rowData) {
    const subData = {
      parentId: rowData.id,
      menuType: rowData.menuType === MENU_TYPE_ENUM.CATALOG.value ? MENU_TYPE_ENUM.MENU.value : MENU_TYPE_ENUM.POINTS.value,
      contextMenuId: rowData.menuType === MENU_TYPE_ENUM.MENU.value ? rowData.id : undefined,
    }
    menuOperateModal.value.showDrawer(subData)
  }

  // 获取图标组件
  function getIconComponent(iconName) {
    return ElementPlusIconsVue[iconName] // 直接从Element Plus图标库获取
  }
</script>

<style lang="scss" scoped>
.menu-container {
  padding: 20px;
}

.smart-query-form {
  .smart-query-form-row {
    margin-bottom: 16px;
    
    .smart-query-form-item {
      margin-right: 24px;
      margin-bottom: 12px;
    }
  }
}

.smart-table-btn-block {
  margin-bottom: 16px;
  
  .smart-table-operate-block {
    .el-button {
      margin-right: 12px;
    }
  }
}

.smart-table-operate {
  display: flex;
  gap: 8px;
}

.no-icon {
  color: #c0c4cc;
  font-size: 12px;
}

.el-icon {
  font-size: 16px;
  color: #606266;
}
</style>
