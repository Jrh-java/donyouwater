<template>
  <el-drawer
    :title="form.id ? '编辑角色' : '添加角色'"
    v-model="visible"
    size="800px"
    :lock-scroll="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" />
      </el-form-item>
      
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-switch 
          v-model="form.status" 
          active-value="T"
          inactive-value="F"
          active-text="启用" 
          inactive-text="禁用" 
        />
      </el-form-item>
      
      <el-form-item label="权限配置">
        <div class="permission-container">
          <div class="permission-header">
            <el-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
            >
              全选
            </el-checkbox>
            <el-button type="text" @click="expandAll">
              {{ allExpanded ? '收起全部' : '展开全部' }}
            </el-button>
          </div>
          
          <el-tree
            ref="permissionTree"
            :data="permissionTreeData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            show-checkbox
            :check-strictly="true"
            :default-expand-all="true"
            :default-checked-keys="[]"
            @check="handleTreeCheck"
            class="permission-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon v-if="data.icon" class="node-icon">
                  <component :is="(ElementPlusIconsVue as any)[data.icon]" />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
                <el-tag v-if="data.type" :type="getPermissionTagType(data.type)" >
                  {{ getPermissionTypeName(data.type) }}
                </el-tag>
              </div>
            </template>
          </el-tree>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ElMessage, ElLoading } from 'element-plus'
import _ from 'lodash'
import { nextTick, reactive, ref, computed, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as roleApi from '@/api/role'
import * as menuApi from '@/api/menu'

// 接口定义
interface PermissionNode {
  id: string
  name: string
  type?: string
  icon?: string
  children?: PermissionNode[]
}

interface RoleForm {
  id?: string
  roleName: string
  description: string
  status: string
  permissions: string[]
}

// emit
const emit = defineEmits(['reload'])

// 数据状态
const visible = ref(false)
const formRef = ref()
const permissionTree = ref()
const allExpanded = ref(false)

const formDefault: RoleForm = {
  id: undefined,
  roleName: '',
  description: '',
  status: 'T',
  permissions: []
}

let form = reactive({ ...formDefault })
const permissionTreeData = ref<PermissionNode[]>([])

// 全选相关状态
const checkAll = ref(false)
const isIndeterminate = ref(false)

// 计算属性
const allPermissionIds = computed(() => {
  const ids: string[] = []
  const traverse = (nodes: PermissionNode[]) => {
    nodes.forEach(node => {
      ids.push(node.id)
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  traverse(permissionTreeData.value)
  return ids
})

// 监听权限变化
watch(() => form.permissions, (newPermissions) => {
  const allIds = allPermissionIds.value
  
  // 简化逻辑，只处理完全选中的节点
  const checkedCount = newPermissions.length
  checkAll.value = checkedCount === allIds.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < allIds.length
}, { immediate: true })

// 表单验证规则
const rules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '状态不能为空', trigger: 'change' }
  ]
}

// 转换菜单数据为权限树格式
const convertMenuToPermissionTree = (menuList: any[]): PermissionNode[] => {
  return menuList.map(menu => ({
    id: menu.id,
    name: menu.menuName,
    type: menu.menuType === 'M' ? 'catalog' : menu.menuType === 'C' ? 'menu' : 'button',
    icon: menu.icon,
    children: menu.children ? convertMenuToPermissionTree(menu.children) : undefined
  }))
}

// 加载权限树数据
const loadPermissionTree = async (roleId?: string) => {
  try {
    if (roleId) {
      // 如果有roleId，使用getRoleSelectedMenu获取完整的权限数据
      const res: any = await roleApi.getRoleSelectedMenu(roleId)
      
      console.log('编辑角色权限数据:', res)
      
      // 使用menuTreeVOS作为权限树
      permissionTreeData.value = convertMenuToPermissionTree(res.menuTreeVOS || [])
      
      // 设置已选中的权限
      const selectedIds = res.selectedMenuIds || []
      form.permissions = selectedIds
      
      console.log('设置选中的权限ID:', selectedIds)
      console.log('权限树数据:', permissionTreeData.value)
      
      // 等待DOM更新后设置权限树选中状态
      await nextTick()
      
      // 使用setTimeout确保树组件完全渲染
      setTimeout(() => {
        if (permissionTree.value && selectedIds.length > 0) {
          console.log('开始设置权限树选中状态...')
          
          // 方法1：直接设置选中的节点
          permissionTree.value.setCheckedKeys(selectedIds)
          
          console.log('权限树选中状态设置完成')
          console.log('当前选中的节点:', permissionTree.value.getCheckedKeys())
          console.log('当前半选的节点:', permissionTree.value.getHalfCheckedKeys())
          
          // 触发一次权限检查更新
          updateFormPermissions()
        } else if (permissionTree.value) {
          console.log('新增模式，清空权限树选中状态')
          permissionTree.value.setCheckedKeys([])
        }
      }, 300) // 再增加延时确保渲染完成
    } else {
      // 如果没有roleId（新增模式），使用queryMenuTree获取所有菜单作为权限树
      const res: any = await menuApi.queryMenuTree({
        key: '',
        menuType: '',
        status: 'T',
        roleId: '' // 获取所有菜单时可以传空roleId
      })
      
      permissionTreeData.value = convertMenuToPermissionTree(res || [])
      form.permissions = []
    }
  } catch (error) {
    console.error('加载权限树失败:', error)
    ElMessage.error('加载权限树失败')
  }
}

// 方法
const showModal = async (roleData?: any) => {
  Object.assign(form, formDefault)
  
  // 加载权限树
  await loadPermissionTree(roleData?.id)
  
  if (roleData && !_.isEmpty(roleData)) {
    Object.assign(form, roleData)
  }
  
  visible.value = true
}

const onClose = () => {
  Object.assign(form, formDefault)
  if (formRef.value) {
    formRef.value.resetFields()
  }
  visible.value = false
}

const validateForm = (formRef: any) => {
  return new Promise((resolve) => {
    formRef
      .validate()
      .then(() => {
        resolve(true)
      })
      .catch(() => {
        resolve(false)
      })
  })
}

const onSubmit = async () => {
  const validateFormRes = await validateForm(formRef.value)
  if (!validateFormRes) {
    ElMessage.error('参数验证错误，请仔细填写表单数据!')
    return
  }
  
  const loading = ElLoading.service({
    lock: true,
    text: '保存中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  
  try {
    // 获取选中的权限（只需要完全选中的节点）
    const checkedKeys = permissionTree.value.getCheckedKeys()
    
    console.log('提交权限数据:', { checkedKeys })
    
    // 1. 保存角色基本信息
    const roleParams = {
      roleName: form.roleName,
      description: form.description,
      status: form.status
    }
    
    let roleId = form.id
    
    if (form.id) {
      // 编辑模式 - 更新角色基本信息
      await roleApi.updateRole({
        id: form.id,
        roleName: form.roleName,
        description: form.description,
        status: form.status
      })
    } else {
      // 新增模式
      const result: any = await roleApi.saveRole(roleParams)
      // 从保存结果中获取角色ID，如果接口返回了ID则使用，否则使用时间戳
      roleId = result?.id || Date.now().toString()
    }
    
    // 2. 更新角色权限 - 编辑和新增都需要更新权限
    if (roleId) {
      await roleApi.updateRoleMenu({
        roleId: roleId,
        menuIdList: checkedKeys
      })
    }
    
    ElMessage.success(`${form.id ? '修改' : '添加'}成功`)
    onClose()
    emit('reload')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.close()
  }
}

// 权限相关方法 - 自定义父子联动逻辑
const handleTreeCheck = (currentNode: any, treeStatus: any) => {
  console.log('权限树节点变更:', { currentNode, treeStatus })
  
  // 获取当前选中的节点keys
  const checkedKeys = treeStatus.checkedKeys
  const isChecked = checkedKeys.includes(currentNode.id)
  
  if (isChecked) {
    // 节点被选中 - 选中父节点和子节点
    selectParentNodes(currentNode)
    selectChildNodes(currentNode, true)
  } else {
    // 节点被取消选中 - 取消子节点，检查是否需要取消父节点
    selectChildNodes(currentNode, false)
    unselectParentIfNeeded(currentNode)
  }
  
  // 更新form中的权限
  updateFormPermissions()
}

// 选中父节点
const selectParentNodes = (node: any) => {
  const currentTreeNode = permissionTree.value.getNode(node)
  if (currentTreeNode.parent && currentTreeNode.parent.key !== undefined) {
    permissionTree.value.setChecked(currentTreeNode.parent.key, true, false)
    selectParentNodes(currentTreeNode.parent.data)
  }
}

// 选中或取消选中子节点
const selectChildNodes = (node: any, isSelected: boolean) => {
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      permissionTree.value.setChecked(child.id, isSelected, false)
      selectChildNodes(child, isSelected)
    })
  }
}

// 检查是否需要取消选中父节点
const unselectParentIfNeeded = (node: any) => {
  const currentTreeNode = permissionTree.value.getNode(node)
  if (currentTreeNode.parent && currentTreeNode.parent.key !== undefined) {
    // 检查父节点的所有子节点是否都未选中
    const parentNode = currentTreeNode.parent
    const allChildrenUnchecked = parentNode.childNodes.every((childNode: any) => !childNode.checked)
    
    if (allChildrenUnchecked) {
      permissionTree.value.setChecked(parentNode.key, false, false)
      unselectParentIfNeeded(parentNode.data)
    }
  }
}

// 更新表单中的权限数据
const updateFormPermissions = () => {
  const checkedKeys = permissionTree.value.getCheckedKeys()
  form.permissions = checkedKeys
  
  console.log('更新权限列表:', checkedKeys)
}

const handleCheckAllChange = (checked: boolean) => {
  if (checked) {
    const allIds = allPermissionIds.value
    permissionTree.value.setCheckedKeys(allIds)
    form.permissions = [...allIds]
  } else {
    permissionTree.value.setCheckedKeys([])
    form.permissions = []
  }
  isIndeterminate.value = false
}

const expandAll = () => {
  allExpanded.value = !allExpanded.value
  const nodes = permissionTree.value.store.nodesMap
  Object.keys(nodes).forEach(key => {
    nodes[key].expanded = allExpanded.value
  })
}

const getPermissionTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'catalog': 'info',
    'menu': 'success',
    'button': 'warning'
  }
  return typeMap[type] || 'info'
}

const getPermissionTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    'catalog': '目录',
    'menu': '菜单',
    'button': '按钮'
  }
  return nameMap[type] || '未知'
}

// 暴露方法
defineExpose({
  showModal
})
</script>

<style lang="scss" scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #e9e9e9;
  background: #fff;
}

.permission-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  
  :deep(.el-tree-node__content) {
    height: 32px;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  
  .node-icon {
    font-size: 14px;
    color: #606266;
  }
  
  .node-label {
    flex: 1;
    color: #303133;
  }
}
</style> 