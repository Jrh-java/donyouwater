<template>
  <div class="schedule-plan-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="queryParams" inline>
        <el-form-item>
          <el-input
            v-model="queryParams.key"
            placeholder="预案名称/版本编号/编制部门"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="queryParams.planType"
            placeholder="预案分类"
            clearable
  
            style="width: 120px;"
            :teleported="false"
          >
            <el-option label="调度方案" value="1"></el-option>
            <el-option label="应急预案" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="queryParams.startTime"
            type="datetime"
            placeholder="开始时间"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="queryParams.endTime"
            type="datetime"
            placeholder="结束时间"
            :teleported="false"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
          >删除</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格和分页 -->
    <div class="table-pagination-container">
      <el-table
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="planName" label="预案名称" />
        <el-table-column prop="planType" label="预案分类">
          <template #default="scope">
            {{ getPlanTypeText(scope.row.planType) }}
          </template>
        </el-table-column>
        <el-table-column prop="versionNum" label="版本编号" />
        <el-table-column prop="deptName" label="编制部门" />
        <el-table-column prop="updTime" label="更新时间" />
        <el-table-column label="附件">
          <template #default="scope">
            <el-button
              v-if="scope.row.file"
              type="primary"
              link
              @click="handleDownload(scope.row)"
            >
              {{ scope.row.file.split('/').pop() }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" @click="handleEdit(scope.row)" link>编辑</el-button>
            <el-button type="danger" @click="handleDelete(scope.row)" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <AddScheduleDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @confirm="handleQuery"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import AddScheduleDialog from './components/AddScheduleDialog.vue'
import { getPlanPage, deletePlan } from '@/api/plan'

interface Plan {
  id: string;
  planName: string;
  planType: string;
  versionNum: string;
  deptId: string;
  deptName: string;
  file: string;
  remarks: string;
  crtTime: string;
  crtUser: string;
  crtName: string;
  updTime: string;
  updUser: string;
  updName: string;
}

const loading = ref(false)
const queryParams = reactive({
  page: 1,
  limit: 10,
  key: '',
  planType: '',
  startTime: '',
  endTime: ''
})

const tableData = ref<Plan[]>([])
const total = ref(0)

const multipleSelection = ref<any[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editData = ref({})

const getPlanTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    '1': '调度方案',
    '2': '应急预案'
  }
  return typeMap[type] || type
}

async function handleQuery() {
  loading.value = true
  try {
    const res = await getPlanPage(queryParams)
    tableData.value = res.list
    total.value = res.totalCount
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

function handleReset() {
  queryParams.key = ''
  queryParams.planType = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  handleQuery()
}

function handleAdd() {
  isEdit.value = false
  editData.value = {}
  dialogVisible.value = true
}

function handleEdit(row: any) {
  isEdit.value = true
  editData.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定要删除预案【${row.planName}】吗？`, '提示', {
    type: 'warning'
  })
  try {
    await deletePlan([row.id])
    ElMessage.success('删除成功')
    handleQuery()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

async function handleBatchDelete() {
  await ElMessageBox.confirm('确定要批量删除选中的预案吗？', '提示', {
    type: 'warning'
  })
  try {
    const ids = multipleSelection.value.map(item => item.id)
    await Promise.all(ids.map(id => deletePlan([id])))
    ElMessage.success('批量删除成功')
    handleQuery()
  } catch (error) {
    ElMessage.error('批量删除失败')
  }
}

function handleSelectionChange(selection: any[]) {
  multipleSelection.value = selection
}

function handleSizeChange(size: number) {
  queryParams.limit = size
  handleQuery()
}

function handleCurrentChange(page: number) {
  queryParams.page = page
  handleQuery()
}

function handleDownload(row: any) {
  window.open(row.file, '_blank')
}

onMounted(() => {
  handleQuery()
})
</script>

<style lang="scss" scoped>
.schedule-plan-container {
  padding: 20px;
}

.search-bar {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.table-pagination-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.mb8 {
  margin-bottom: 8px;
}
</style>