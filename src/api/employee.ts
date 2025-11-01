import request from '@/utils/request'

// 员工相关接口类型定义
export interface Employee {
  userId?: string
  name: string
  userName: string
  password?: string
  mobilePhone: string
  telPhone?: string
  email?: string
  address?: string
  birthday?: string
  certificateType?: string
  certificateNo?: string
  sex: string
  deptId: string
  roleId?: string
  isActive: string // 'T' 启用, 'F' 禁用
  isShow: string // 'T' 显示, 'F' 隐藏
  status: string // 'T' 启用, 'F' 禁用
  description?: string
  remark?: string
  createTime?: string
  updateTime?: string
}

export interface EmployeeQuery {
  page: number
  limit: number
  key?: string // 账号名搜索
  deptId?: string
  roleId?: string
  status?: string
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 分页查询员工
export function getEmployeePage(data: EmployeeQuery): Promise<PageResult<Employee>> {
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/page',
    method: 'post',
    data
  })
}

// 根据部门查询员工
export function getEmployeeByDepartment(departmentId: string): Promise<Employee[]> {
  return request({
    url: `/authApi/system/employee/department/${departmentId}`,
    method: 'get'
  })
}

// 新增员工
export function addEmployee(data: Employee) {
  const submitData = {
    address: data.address || '',
    birthday: data.birthday || '',
    certificateNo: data.certificateNo || '',
    certificateType: data.certificateType || '',
    deptId: data.deptId,
    description: data.description || '',
    email: data.email || '',
    isActive: data.isActive || 'T',
    isShow: data.isShow || 'T',
    mobilePhone: data.mobilePhone,
    name: data.name,
    password: data.password || '',
    remark: data.remark || '',
    roleId: data.roleId || '',
    sex: data.sex,
    status: data.status || 'T',
    telPhone: data.telPhone || '',
    userName: data.userName
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/save',
    method: 'post',
    data: submitData
  })
}

// 更新员工
export function updateEmployee(data: Employee) {
  const submitData = {
    userId: data.userId,
    address: data.address || '',
    birthday: data.birthday || '',
    certificateNo: data.certificateNo || '',
    certificateType: data.certificateType || '',
    deptId: data.deptId,
    description: data.description || '',
    email: data.email || '',
    isActive: data.isActive || 'T',
    isShow: data.isShow || 'T',
    mobilePhone: data.mobilePhone,
    name: data.name,
    remark: data.remark || '',
    roleId: data.roleId || '',
    sex: data.sex,
    status: data.status || 'T',
    telPhone: data.telPhone || '',
    userName: data.userName
  }
  
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/update',
    method: 'post',
    data: submitData
  })
}

// 删除员工
export function deleteEmployee(id: string) {
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/delete',
    method: 'post',
    data: {
      ids: id
    }
  })
}

// 查询员工详情
export function getEmployeeDetail(id: string): Promise<Employee> {
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/get',
    method: 'post',
    data: {
      id: id
    }
  })
}

// 重置员工密码
export function resetEmployeePassword(userIds: string[], password: string) {
  return request({
    url: '/authApi/reservoir/sys/sysAdminUser/updateUsersStatusOrPass',
    method: 'post',
    data: {
      password: password,
      userIds: userIds
    }
  })
}

// 批量删除员工
export function batchDeleteEmployee(ids: string[]) {
  return request({
    url: '/authApi/system/employee/batchDelete',
    method: 'post',
    data: { ids }
  })
} 