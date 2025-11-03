<template>
  <div class="operation-log-container">
    <!-- 查询表单 -->


    <el-card shadow="never" :body-style="{ padding: '16px' }">
      <el-form class="smart-query-form">
      <el-row class="smart-query-form-row">
        <el-form-item label="关键字" class="smart-query-form-item">
          <el-input 
            style="width: 300px" 
            v-model="queryForm.key" 
            placeholder="操作人员/操作IP" 
            clearable
          />
        </el-form-item>
        
        <el-form-item label="操作时间" style="margin-left: 20px;">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :teleported="false"
            style="width: 400px"
            @change="onDateChange"
          />
        </el-form-item>

        <el-form-item style="display: flex;justify-content: flex-end;gap:15px">
          <el-button-group style="display: flex;justify-content: flex-end;gap:15px">
            <el-button type="primary" @click="onSearch">
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


          <el-button @click="batchDelete" type="danger" :disabled="selectedRowKeys.length === 0">
            <template #icon>
              <Delete />
            </template>
            批量删除  
          </el-button>
 
          </el-button-group>
        </el-form-item>
      </el-row>
    </el-form>
      <!-- 操作按钮 -->
  

      <!-- 数据表格 -->
      <el-table

        :data="tableData"
        row-key="id"
        border
        v-loading="tableLoading"
        @selection-change="onSelectChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="操作人员" width="120">
          <template #default="{ row }">
            <span>{{ row.username || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作" width="150" />
        <el-table-column prop="method" label="方法" min-width="180" />
        <el-table-column prop="time" label="耗时(ms)" width="100" />
        <el-table-column prop="ip" label="操作IP" width="150" />
        <el-table-column prop="crtTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <div class="smart-table-operate">
              <el-button @click="showParams(row)" link type="primary">查看参数</el-button>
              <el-button @click="deleteLog(row.id)" link type="danger">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="smart-query-table-page">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </div>
    </el-card>

    <!-- 参数查看弹窗 -->
    <el-dialog
      v-model="paramsDialogVisible"
      title="参数详情"
      width="800px"
      :lock-scroll="false"
      destroy-on-close
    >
      <el-input
        v-model="currentParams"
        type="textarea"
        :rows="15"
        readonly
        style="font-family: 'Courier New', monospace;"
      />
      <template #footer>
        <el-button @click="paramsDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyParams">复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { Search, Refresh, Delete } from '@element-plus/icons-vue'
import { getOperationLogPage, deleteOperationLog, type OperationLog, type OperationLogQuery } from '@/api/operation-log'

// 查询表单
const queryFormDefault = {
  page: 1,
  limit: 10,
  key: '',
  startTime: '',
  endTime: ''
}

const queryForm = reactive<OperationLogQuery>({ ...queryFormDefault })
const dateRange = ref<[string, string] | null>(null)

// 表格数据
const tableData = ref<OperationLog[]>([])
const tableLoading = ref(false)
const total = ref(0)

// 多选
const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<OperationLog[]>([])

// 参数弹窗
const paramsDialogVisible = ref(false)
const currentParams = ref('')

// 时间范围变化
function onDateChange(dates: [string, string] | null) {
  if (dates) {
    queryForm.startTime = dates[0]
    queryForm.endTime = dates[1]
  } else {
    queryForm.startTime = ''
    queryForm.endTime = ''
  }
}

// 重置查询
function resetQuery() {
  Object.assign(queryForm, queryFormDefault)
  dateRange.value = null
  onSearch()
}

// 查询数据
async function onSearch() {
  tableLoading.value = true
  try {
    const res = await getOperationLogPage(queryForm)
    tableData.value = res.list
    total.value = res.totalCount
    selectedRowKeys.value = []
    selectedRows.value = []
  } catch (error) {
    console.error('查询失败:', error)
    ElMessage.error('查询失败')
  } finally {
    tableLoading.value = false
  }
}

// 表格选择变化
function onSelectChange(selection: OperationLog[]) {
  selectedRowKeys.value = selection.map(row => row.id)
  selectedRows.value = selection
}

// 查看参数
function showParams(row: OperationLog) {
  currentParams.value = formatParams(row.params)
  paramsDialogVisible.value = true
}

// 格式化参数显示
function formatParams(params: string): string {
  try {
    const parsed = JSON.parse(params)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return params
  }
}

// 复制参数
async function copyParams() {
  try {
    await navigator.clipboard.writeText(currentParams.value)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 删除单条日志
function deleteLog(id: string) {
  ElMessageBox.confirm(
    '确定要删除这条操作日志吗？',
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    requestDelete([id])
  }).catch(() => {
    // 用户取消删除
  })
}

// 批量删除
function batchDelete() {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRowKeys.value.length} 条操作日志吗？`,
    '提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(() => {
    requestDelete(selectedRowKeys.value)
  }).catch(() => {
    // 用户取消删除
  })
}

// 执行删除请求
async function requestDelete(ids: string[]) {
  const loading = ElLoading.service({
    lock: true,
    text: '删除中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    await deleteOperationLog(ids)
    ElMessage.success('删除成功')
    onSearch()
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.close()
  }
}

// 页面加载时查询数据
onMounted(() => {
  onSearch()
})
</script>

<style scoped lang="scss">
.operation-log-container {
  padding: 20px;
}

.smart-table-operate {
  display: flex;
  gap: 8px;
}
.smart-query-table-page{
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>