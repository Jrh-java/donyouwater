import request from '@/utils/request'

// 操作日志类型定义
export interface OperationLog {
  id: string
  username: string | null
  operation: string
  method: string
  params: string
  time: number
  ip: string
  crtTime: string
}

export interface OperationLogQuery {
  page: number
  limit: number
  key?: string // 关键字(操作人员/操作IP)
  startTime?: string
  endTime?: string
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 分页查询操作日志
export function getOperationLogPage(data: OperationLogQuery): Promise<PageResult<OperationLog>> {
  return request({
    url: 'authApi/reservoir/sys/sysLog/page',
    method: 'post',
    data
  })
}

// 删除操作日志
export function deleteOperationLog(ids: string[]) {
  return request({
    url: 'authApi/reservoir/sys/sysLog/delete',
    method: 'post',
    data: {
      ids
    }
  })
} 