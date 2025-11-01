import request from '@/utils/request'

// 部门相关接口类型定义
export interface Department {
  id?: string
  deptName: string
  parentId?: string
  leader?: string
  phone?: string
  email?: string
  orderNum: number
  status: string // 'T' 启用, 'F' 禁用
  remark?: string
  createTime?: string
  updateTime?: string
}

// 部门用户信息
export interface DepartmentUser {
  userId: string
  name: string
}

// 专门用于树形结构显示的部门节点类型
export interface DepartmentTreeNode extends Department {
  children?: DepartmentTreeNode[]
  membersNum?: number
  sysDeptUserVOS?: DepartmentUser[]
}

export interface DepartmentQuery {
  deptName?: string
  status?: string
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 查询部门树
export function getDepartmentTree(params?: DepartmentQuery): Promise<DepartmentTreeNode[]> {
  const formData = new FormData()
  if (params?.deptName) {
    formData.append('deptName', params.deptName)
  }
  if (params?.status) {
    formData.append('status', params.status)
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysDept/deptTree',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 分页查询部门
export function getDepartmentPage(data: DepartmentQuery): Promise<PageResult<Department>> {
  return request({
    url: '/authApi/system/department/page',
    method: 'post',
    data
  })
}

// 新增部门
export function addDepartment(data: Department) {
  const submitData = {
    deptName: data.deptName,
    leader: data.leader || '',
    orderNum: data.orderNum || 0,
    parentId: data.parentId || '-1',
    phone: data.phone || '',
    remark: data.remark || '',
    status: data.status
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysDept/save',
    method: 'post',
    data: submitData
  })
}

// 更新部门
export function updateDepartment(data: Department) {
  const submitData = {
    deptName: data.deptName,
    email: data.email || '',
    id: data.id,
    leader: data.leader || '',
    orderNum: data.orderNum || 0,
    parentId: data.parentId || '-1',
    phone: data.phone || '',
    remark: data.remark || '',
    status: data.status
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysDept/update',
    method: 'post',
    data: submitData
  })
}

// 删除部门
export function deleteDepartment(id: string[]) {
  return request({
    url: '/authApi/reservoir/sys/sysDept/delete',
    method: 'post',
    data: {
      ids: id
    }
  })
}

// 查询部门详情
export function getDepartmentDetail(id: string): Promise<Department> {
  return request({
    url: '/authApi/reservoir/sys/sysDept/get',
    method: 'post',
    data: {
      id: id
    }
  })
}