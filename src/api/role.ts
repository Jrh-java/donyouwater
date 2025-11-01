import authApi from '@/utils/request'

// 角色接口类型定义
export interface Role {
  id?: string
  roleName: string
  roleCode?: string
  description?: string
  status: string
  crtTime?: string
  crtUser?: string
  crtName?: string
  updTime?: string
  updUser?: string
  updName?: string
  membersNum?: number
}

export interface User {
  userId: string
  userName: string
  name: string
  email?: string
  mobilePhone?: string
  telPhone?: string
  deptId?: string
  status: string
  isActive?: string
  address?: string
  birthday?: string
  sex?: string
  description?: string
  remark?: string
}

export interface MenuTreeNode {
  id: string
  parentId: string
  menuName: string
  menuCode?: string
  menuType: string
  url?: string
  component?: string
  permission?: string
  icon?: string
  status: string
  children?: MenuTreeNode[]
}

export interface RoleMenuResponse {
  roleId: string
  menuTreeVOS: MenuTreeNode[]
  selectedMenuIds: string[]
}

// 保存角色
export function saveRole(params: {
  roleName: string
  description?: string
  status: string
}) {
  return authApi.post('/authApi/reservoir/sys/sysRole/save', params)
}

// 更新角色
export function updateRole(params: {
  id: string
  roleName: string
  description?: string
  status: string
}) {
  return authApi.post('/authApi/reservoir/sys/sysRole/update', params)
}

// 更新角色权限
export function updateRoleMenu(params: {
  roleId: string
  menuIdList: string[]
}) {
  return authApi.post('/authApi/reservoir/sys/sysRole/updateRoleMenu', params)
}

// 删除角色
export function deleteRole(ids: string[]) {
  return authApi.post('/authApi/reservoir/sys/sysRole/delete', {
    ids
  })
}

// 根据角色ID获取用户列表
export function getUsersByRoleId(roleId: string) {
  const formData = new FormData()
  formData.append('roleId', roleId)
  return authApi.get('/authApi/reservoir/sys/sysRole/getUsersByRoleId', {
    params: {
      roleId
    }
  })
}

// 获取所有角色
export function getAllRole(): Promise<Role[]> {
  return authApi.get('/authApi/reservoir/sys/sysRole/getAllRole')
}

// 获取角色关联的权限菜单
export function getRoleSelectedMenu(roleId: string): Promise<RoleMenuResponse> {
  return authApi.get('/authApi/reservoir/sys/sysRole/getRoleSelectedMenu', {
    params: {
      roleId
    }
  })
} 