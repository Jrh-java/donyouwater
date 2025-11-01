import request from '@/utils/request'

// 菜单类型定义
export interface Menu {
  id?: string
  parentId?: string
  children?: Menu[]
  menuName: string
  menuCode?: string
  menuType: string  // M目录 C菜单 F按钮
  url?: string      // 修改：将path改为url
  component?: string
  permission?: string
  icon?: string
  status?: string  // T启用 F禁用
  orderNum?: number
  isRefresh?: string
  remark?: string
  target?: string
  // path?: string  // 保留path作为兼容字段，但主要使用url
}

export interface MenuQuery {
  key?: string      // 关键字搜索
  menuType?: string // M目录 C菜单 F按钮
  status?: string   // T启用 F禁用
  roleId?: string   // 角色ID
}

// 查询菜单树
export function queryMenuTree(params?: MenuQuery) {
  return request({
    url: '/authApi/reservoir/sys/sysMenu/menuTree',
    method: 'post',
    data: {
      key: params?.key || "",
      menuType: params?.menuType || "",
      status: params?.status || "",
      roleId: params?.roleId || ""
    }
  })
}

// 查询菜单详情
export function getMenuDetail(id: string) {
  return request({
    url: '/authApi/reservoir/sys/sysMenu/get',
    method: 'post',
    data: { id }
  })
}

// 保存菜单(添加)
export function saveMenu(data: Menu) {
  const saveData = {
    component: data.component || "#",
    icon: data.icon || "#", 
    isRefresh: "T",
    menuName: data.menuName,
    menuType: data.menuType,
    orderNum: data.orderNum || 0,
    parentId: data.parentId || "-1",
    permission: data.permission || "",
    remark: data.remark || "",
    status: data.status || "T",
    target: "",
    url: data.url || "#"
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysMenu/save',
    method: 'post', 
    data: saveData
  })
}

// 更新菜单(编辑)
export function updateMenu(data: Menu) {
  const updateData = {
    id: data.id,
    component: data.component || "#",
    icon: data.icon || "#", 
    isRefresh: "T",
    menuName: data.menuName,
    menuType: data.menuType,
    orderNum: data.orderNum || 0,
    parentId: data.parentId || "-1",
    permission: data.permission || "",
    remark: data.remark || "",
    status: data.status || "T",
    target: "",
    url: data.url || "#"
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysMenu/update',
    method: 'post', 
    data: updateData
  })
}

// 删除菜单
export function deleteMenu(ids: string[]) {
  return request({
    url: '/authApi/reservoir/sys/sysMenu/delete',
    method: 'post',
    data: { ids }
  })
}

// 批量删除菜单
export function batchDeleteMenu(menuIds: string[]) {
  return deleteMenu(menuIds)
}

// 兼容旧的接口名称 - 根据是否有id判断是新增还是编辑
export function addMenu(data: Menu) {
  if (data.id) {
    return updateMenu(data)
  } else {
    return saveMenu(data)
  }
}

// 兼容旧的接口名称
export const queryMenu = queryMenuTree 