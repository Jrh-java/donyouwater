<template>
  <el-drawer
    title="分配员工"
    v-model="visible"
    size="700px"
    :lock-scroll="false"
    destroy-on-close
  >
    <div class="assign-container">
      <div class="role-info">
        <h4>角色信息</h4>
        <div class="role-detail">
          <span class="role-name">{{ currentRole?.roleName }}</span>
          <span class="role-desc">{{ currentRole?.description }}</span>
        </div>
      </div>
      
      <div class="employee-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索员工姓名、部门"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="employee-list">
        <el-table
          :data="filteredEmployees"
          stripe
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="employeeName" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="position" label="职位" width="120" />
          <el-table-column prop="phone" label="手机号" width="140" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'T' ? 'success' : 'danger'"  >
                {{ row.status === 'T' ? '在职' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="当前角色" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="isAssigned(row)" type="success"  >
                已分配
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <template #footer>
      <div class="drawer-footer">
        <div class="selection-info">
          已选择 {{ selectedEmployees.length }} 个员工
        </div>
        <div class="action-buttons">
          <el-button @click="onClose">取消</el-button>
          <el-button type="primary" @click="onSubmit" :disabled="selectedEmployees.length === 0">
            确认分配
          </el-button>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage, ElLoading } from 'element-plus'
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as roleApi from '@/api/role'

// 接口定义
interface Role {
  id: string
  roleName: string
  description: string
}

interface Employee {
  userId: string
  userName: string
  name: string
  department: string
  position: string
  mobilePhone: string
  telPhone: string
  email: string
  status: string
  isAssigned?: boolean
}

// emit
const emit = defineEmits(['reload'])

// 数据状态
const visible = ref(false)
const loading = ref(false)
const currentRole = ref<Role | null>(null)
const allEmployees = ref<Employee[]>([])
const selectedEmployees = ref<Employee[]>([])
const searchKeyword = ref('')

// 计算属性
const filteredEmployees = computed(() => {
  if (!searchKeyword.value) return allEmployees.value
  return allEmployees.value.filter(employee =>
    employee.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const showModal = (role: Role) => {
  currentRole.value = role
  visible.value = true
  loadEmployees()
}

const loadEmployees = async () => {
  try {
    loading.value = true
    
    // 获取当前角色的员工
    const currentRoleEmployees: any = await roleApi.getUsersByRoleId(currentRole.value?.id || '')
    
    // TODO: 这里应该获取所有员工，然后标识哪些已分配
    // 目前只显示当前角色的员工作为示例
    allEmployees.value = (currentRoleEmployees || []).map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
      name: user.name,
      department: user.deptId || '未知部门',
      position: '未知职位',
      mobilePhone: user.mobilePhone || '',
      telPhone: user.telPhone || '',
      email: user.email || '',
      status: user.status,
      isAssigned: true // 当前都是已分配的
    }))
    
  } catch (error) {
    console.error('加载员工列表失败:', error)
    ElMessage.error('加载员工列表失败')
  } finally {
    loading.value = false
  }
}

const isAssigned = (employee: Employee) => {
  return employee.isAssigned || false
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleSelectionChange = (selection: Employee[]) => {
  selectedEmployees.value = selection
}

const onClose = () => {
  visible.value = false
  currentRole.value = null
  selectedEmployees.value = []
  searchKeyword.value = ''
}

const onSubmit = async () => {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('请选择要分配的员工')
    return
  }
  
  const loading = ElLoading.service({
    lock: true,
    text: '分配中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    // TODO: 调用分配员工到角色的API
    // 这里需要一个将员工分配给角色的接口
    
    ElMessage.success(`成功为角色"${currentRole.value?.roleName}"分配了${selectedEmployees.value.length}个员工`)
    onClose()
    emit('reload', currentRole.value?.id)
  } catch (error) {
    console.error('分配失败:', error)
    ElMessage.error('分配失败')
  } finally {
    loading.close()
  }
}

// 暴露方法
defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.assign-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.role-info {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  
  h4 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }
  
  .role-detail {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .role-name {
      font-weight: 600;
      color: #409eff;
    }
    
    .role-desc {
      color: #606266;
      font-size: 14px;
    }
  }
}

.employee-search {
  margin-bottom: 20px;
}

.employee-list {
  flex: 1;
  overflow: hidden;
  
  :deep(.el-table) {
    height: 100%;
  }
}

.drawer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e9e9e9;
  background: #fff;
}

.selection-info {
  color: #606266;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style> 