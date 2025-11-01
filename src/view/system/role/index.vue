<template>
  <div class="role-management">
    <div class="role-container">
      <!-- 左侧角色列表 -->
      <div class="role-list">
        <div class="role-header">
          <h3>角色列表</h3>
          <el-button type="primary"   @click="handleAddRole">
            <template #icon>
              <Plus />
            </template>
            添加角色
          </el-button>
        </div>
        
        <div class="role-search">
          <el-input
            v-model="roleSearchKeyword"
            placeholder="搜索角色名称"
            clearable
             
            @input="handleRoleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="role-items">
          <div
            v-for="role in filteredRoles"
            :key="role.id"
            :class="['role-item', { active: selectedRole?.id === role.id }]"
            @click="handleRoleSelect(role)"
          >
            <div class="role-info">
              <div class="role-name">{{ role.roleName }}</div>
              <div class="role-desc">{{ role.description }}</div>
              <div class="role-stats">
                <span class="user-count">{{ role.userCount || 0 }}人</span>
                <span class="status" :class="role.status === 'T' ? 'active' : 'inactive'">
                  {{ role.status === 'T' ? '启用' : '禁用' }}
                </span>
              </div>
            </div>
            <div class="role-actions">
              <el-button type="text"   @click.stop="handleEditRole(role)">
                编辑
              </el-button>
              <el-button type="text"   @click.stop="handleDeleteRole(role)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="role-content">
        <div v-if="!selectedRole" class="empty-state">
          <el-icon class="empty-icon" size="64">
            <UserFilled />
          </el-icon>
          <h3>请选择角色</h3>
          <p>选择左侧角色查看详细信息和关联员工</p>
        </div>
        
        <div v-else class="role-detail">
          <!-- 角色信息卡片 -->
          <el-card class="role-info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>角色信息</span>
                <el-button type="primary"   @click="handleEditRole(selectedRole)">
                  编辑角色
                </el-button>
              </div>
            </template>
            <div class="role-detail-info">
              <div class="info-item">
                <label>角色名称：</label>
                <span>{{ selectedRole.roleName }}</span>
              </div>
              <div class="info-item">
                <label>角色描述：</label>
                <span>{{ selectedRole.description || '暂无描述' }}</span>
              </div>
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ selectedRole.createTime }}</span>
              </div>
              <div class="info-item">
                <label>状态：</label>
                <el-tag :type="selectedRole.status === 'T' ? 'success' : 'danger'">
                  {{ selectedRole.status === 'T' ? '启用' : '禁用' }}
                </el-tag>
              </div>
            </div>
          </el-card>
          
          <!-- 员工列表 -->
          <el-card class="employee-card" shadow="never">
            <template #header>
              <div class="card-header">
                <span>关联员工 ({{ roleEmployees.length }})</span>
                <!-- <el-button type="primary"   @click="handleAssignEmployee">
                  分配员工
                </el-button> -->
              </div>
            </template>
            
            <div class="employee-search">
              <el-input
                v-model="employeeSearchKeyword"
                placeholder="搜索员工姓名"
                clearable
                 
                style="width: 300px"
                @input="handleEmployeeSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
            
            <el-table
              :data="filteredEmployees"
              stripe
              style="width: 100%; margin-top: 16px"
              v-loading="employeeLoading"
            >
              <el-table-column prop="name" label="姓名"  />
              <!-- <el-table-column prop="department" label="部门" width="150" />
              <el-table-column prop="position" label="职位" width="120" /> -->
              <el-table-column prop="mobilePhone" label="手机号" />
              <el-table-column prop="email" label="邮箱" />
              <el-table-column prop="status" label="状态"  align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'T' ? 'success' : 'danger'"  >
                    {{ row.status === 'T' ? '在职' : '离职' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                     
                    @click="handleRemoveEmployee(row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </div>
    
    <!-- 角色操作弹窗 -->
    <RoleOperateModal 
      ref="roleOperateModal" 
      @reload="loadRoles" 
    />
    
    <!-- 员工分配弹窗 -->
    <EmployeeAssignModal 
      ref="employeeAssignModal" 
      @reload="loadRoleEmployees" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, UserFilled } from '@element-plus/icons-vue'
import RoleOperateModal from './components/RoleOperateModal.vue'
import EmployeeAssignModal from './components/EmployeeAssignModal.vue'
import * as roleApi from '@/api/role'

// 接口定义
interface Role {
  id: string
  roleName: string
  description: string
  status: string
  createTime: string
  userCount: number
  permissions: string[]
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
  roleIds: string[]
}

// 数据状态
const roles = ref<Role[]>([])
const selectedRole = ref<Role | null>(null)
const roleEmployees = ref<Employee[]>([])
const employeeLoading = ref(false)

// 搜索关键字
const roleSearchKeyword = ref('')
const employeeSearchKeyword = ref('')

// 组件引用
const roleOperateModal = ref()
const employeeAssignModal = ref()

// 计算属性
const filteredRoles = computed(() => {
  if (!roleSearchKeyword.value) return roles.value
  return roles.value.filter(role =>
    role.roleName.toLowerCase().includes(roleSearchKeyword.value.toLowerCase())
  )
})

const filteredEmployees = computed(() => {
  if (!employeeSearchKeyword.value) return roleEmployees.value
  return roleEmployees.value.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearchKeyword.value.toLowerCase())
  )
})

// 方法
const loadRoles = async () => {
  try {
    const res: any = await roleApi.getAllRole()
    
    // 转换数据格式
    roles.value = (res || []).map((item: any) => ({
      id: item.id,
      roleName: item.roleName,
      description: item.description || '暂无描述',
      status: item.status,
      createTime: item.crtTime || '',
      userCount: item.membersNum || 0,
      permissions: []
    }))
  } catch (error) {
    console.error('加载角色列表失败:', error)
    ElMessage.error('加载角色列表失败')
  }
}

const loadRoleEmployees = async (roleId: string) => {
  if (!roleId) {
    roleEmployees.value = []
    return
  }
  
  try {
    employeeLoading.value = true
    const res: any = await roleApi.getUsersByRoleId(roleId)
    
    // 转换数据格式
    roleEmployees.value = (res || []).map((user: any) => ({
      userId: user.userId,
      userName: user.userName,
      name: user.name,
      department: user.deptId || '未知部门',
      position: '未知职位',
      mobilePhone: user.mobilePhone || '',
      telPhone: user.telPhone || '',
      email: user.email || '',
      status: user.status,
      roleIds: [roleId] // 当前角色ID
    }))
  } catch (error) {
    console.error('加载角色员工失败:', error)
    ElMessage.error('加载角色员工失败')
  } finally {
    employeeLoading.value = false
  }
}

const handleRoleSelect = (role: Role) => {
  selectedRole.value = role
  loadRoleEmployees(role.id)
}

const handleRoleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleEmployeeSearch = () => {
  // 搜索逻辑已在computed中处理
}

const handleAddRole = () => {
  roleOperateModal.value.showModal()
}

const handleEditRole = (role: Role) => {
  roleOperateModal.value.showModal(role)
}

const handleDeleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${role.roleName}"吗？删除后将无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    )
    
    await roleApi.deleteRole([role.id])
    
    ElMessage.success('删除成功')
    loadRoles()
    
    // 如果删除的是当前选中的角色，清空选择
    if (selectedRole.value?.id === role.id) {
      selectedRole.value = null
      roleEmployees.value = []
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除角色失败')
    }
  }
}

const handleAssignEmployee = () => {
  if (!selectedRole.value) return
  employeeAssignModal.value.showModal(selectedRole.value)
}

const handleRemoveEmployee = async (employee: Employee) => {
  try {
    await ElMessageBox.confirm(
      `确定要从角色"${selectedRole.value?.roleName}"中移除员工"${employee.name}"吗？`,
      '确认移除',
      {
        confirmButtonText: '移除',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    )
    
    // TODO: 调用移除员工角色的API
    ElMessage.success('移除成功')
    if (selectedRole.value) {
      loadRoleEmployees(selectedRole.value.id)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除员工失败:', error)
      ElMessage.error('移除员工失败')
    }
  }
}

// 生命周期
onMounted(() => {
  loadRoles()
})
</script>

<style lang="scss" scoped>
.role-management {
  height: 100%;
  padding: 20px;
}

.role-container {
  display: flex;
  height: 100%;
  gap: 20px;
}

.role-list {
  width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  
  h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
}

.role-search {
  padding: 0 20px 20px;
}

.role-items {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.role-item {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }
  
  &.active {
    border-color: #409eff;
    background-color: #f0f9ff;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.role-info {
  .role-name {
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .role-desc {
    color: #606266;
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.4;
  }
  
  .role-stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .user-count {
      color: #909399;
      font-size: 12px;
    }
    
    .status {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      
      &.active {
        background-color: #f0f9ff;
        color: #409eff;
      }
      
      &.inactive {
        background-color: #fef0f0;
        color: #f56c6c;
      }
    }
  }
}

.role-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.role-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  
  .empty-icon {
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  h3 {
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    color: #606266;
  }
}

.role-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span {
    font-weight: 600;
    color: #303133;
  }
}

.role-info-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.role-detail-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  
  .info-item {
    display: flex;
    align-items: center;
    
    label {
      min-width: 80px;
      color: #606266;
      font-weight: 500;
    }
    
    span {
      color: #303133;
    }
  }
}

.employee-card {
  flex: 1;
  
  :deep(.el-card__body) {
    padding: 20px;
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;
  }
}

.employee-search {
  margin-bottom: 16px;
}
</style>