import request from '@/utils/request'

// 职务相关接口类型定义
export interface Position {
  id?: string
  positionName: string
  level: number
  sort: number
  remark?: string
  disabled: boolean
  createTime?: string
  updateTime?: string
}

export interface PositionQuery {
  page: number
  limit: number
  positionName?: string
  disabled?: boolean | null
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 分页查询职务
export function getPositionPage(data: PositionQuery): Promise<PageResult<Position>> {
  return request({
    url: '/authApi/system/position/page',
    method: 'post',
    data
  })
}

// 查询所有职务
export function getAllPositions(): Promise<Position[]> {
  return request({
    url: '/authApi/system/position/list',
    method: 'get'
  })
}

// 新增职务
export function addPosition(data: Position) {
  return request({
    url: '/authApi/system/position/add',
    method: 'post',
    data
  })
}

// 更新职务
export function updatePosition(data: Position) {
  return request({
    url: '/authApi/system/position/update',
    method: 'post',
    data
  })
}

// 删除职务
export function deletePosition(id: string) {
  return request({
    url: `/authApi/system/position/delete/${id}`,
    method: 'post'
  })
}

// 查询职务详情
export function getPositionDetail(id: string): Promise<Position> {
  return request({
    url: `/authApi/system/position/detail/${id}`,
    method: 'get'
  })
} 