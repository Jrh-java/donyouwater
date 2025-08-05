import request from '@/utils/request'

// 任务相关接口类型定义
export interface Task {
  id?: string
  taskName: string
  taskType: string // 1.日常巡检 2.年度巡检 3.特别巡检 4.维修 5.保养
  startTime: string
  endTime: string
  taskCycle: string // 1.不重复 2.每天重复 3.每周重复 4.每月重复 5.每年重复
  remindCycle: string // 1.准时提醒 2.提前5分钟 3.提前15分钟 4.提前30分钟 5.提前1小时
  remindType: string // 1.系统消息 2.邮件通知 3.短信通知
  routeManagementId: string // 巡查路线ID
  desc?: string // 任务描述
  file?: string // 附件
  excutorId?: string
  excutorName?: string
  completionProgress?: string // 1待处理 2进行中 3已完成
  crtTime?: string
  crtUser?: string
  crtName?: string
  updTime?: string
  updUser?: string
  updName?: string
}

export interface TaskExecutor {
  id?: string
  taskId?: string
  excutorId: string
  excutorName: string
  completionProgress?: string
  crtTime?: string
  crtUser?: string
  crtName?: string
  updTime?: string
  updUser?: string
  updName?: string
}

export interface TaskQuery {
  page: number
  limit: number
  completionProgress?: string // 1待处理 2进行中 3已完成
  startTime?: string
  endTime?: string
  key?: string // 关键字(任务名称/任务编号)
  taskType?: string
}

export interface TaskSaveRequest {
  taskName: string
  taskType: string
  startTime: string
  endTime: string
  taskCycle: string
  remindCycle: string
  remindType: string
  routeManagementId: string
  desc?: string
  file?: string
  taskExcutorInfoDTOList: Array<{
    excutorId: string
    excutorName: string
  }>
}

export interface TaskUpdateRequest {
  id: string
  taskName: string
  taskType: string
  startTime: string
  endTime: string
  taskCycle: string
  remindCycle: string
  remindType: string
  routeManagementId: string
  desc?: string
  file?: string
  taskExcutorInfoDTOS: Array<{
    excutorId: string
    excutorName: string
  }>
}

export interface TaskDetailResponse {
  id: string
  taskNum: string
  taskName: string
  taskType: string
  startTime: string
  endTime: string
  taskCycle: string
  remindCycle: string
  remindType: string
  routeManagementId: string
  desc?: string
  file?: string
  crtTime?: string
  crtUser?: string
  crtName?: string
  taskExcutorInfoVOS: TaskExecutor[]
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 分页查询任务
export function getTaskPage(data: TaskQuery): Promise<PageResult<Task>> {
  return request({
    url: '/authApi/bms/task/sysTaskManagementInfo/page',
    method: 'post',
    data
  })
}

// 新增任务
export function addTask(data: TaskSaveRequest) {
  return request({
    url: '/authApi/bms/task/sysTaskManagementInfo/save',
    method: 'post',
    data
  })
}

// 更新任务
export function updateTask(data: TaskUpdateRequest) {
  return request({
    url: '/authApi/bms/task/sysTaskManagementInfo/update',
    method: 'post',
    data
  })
}

// 删除任务
export function deleteTask(ids: string[]) {
  return request({
    url: '/authApi/bms/task/sysTaskManagementInfo/delete',
    method: 'post',
    data: {
      ids
    }
  })
}

// 查询任务详情
export function getTaskDetail(id: string): Promise<TaskDetailResponse> {
  return request({
    url: '/authApi/bms/task/sysTaskManagementInfo/get',
    method: 'post',
    data: {
      id
    }
  })
}