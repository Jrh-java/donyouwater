import request from '@/utils/request'

// 预案查询参数
export interface PlanQuery {
  page: number
  limit: number
  key?: string
  planType?: string
  startTime?: string
  endTime?: string
}

// 预案信息
export interface Plan {
  id?: string
  planName: string
  planType: string
  versionNum: string
  deptId: string
  deptName: string
  file: string
  remarks?: string
  crtName?: string
  crtTime?: string
  crtUser?: string
  updName?: string
  updTime?: string
  updUser?: string
}

// 分页返回结果
export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 分页查询预案
export function getPlanPage(data: PlanQuery): Promise<PageResult<Plan>> {
  return request({
    url: '/authApi/bms/patrol/stormPlanInfo/page',
    method: 'post',
    data
  })
}

// 新增预案
export function addPlan(data: Omit<Plan, 'id'>) {
  return request({
    url: '/authApi/bms/patrol/stormPlanInfo/save',
    method: 'post',
    data
  })
}

// 更新预案
export function updatePlan(data: Plan) {
  return request({
    url: '/authApi/bms/patrol/stormPlanInfo/update',
    method: 'post',
    data
  })
}

// 删除预案
export function deletePlan(ids: string[]) {
  return request({
    url: '/authApi/bms/patrol/stormPlanInfo/delete',
    method: 'post',
    data: {
      ids
    }
  })
}

// 查询预案详情
export function getPlanDetail(id: string): Promise<Plan> {
  return request({
    url: '/authApi/bms/patrol/stormPlanInfo/get',
    method: 'post',
    data: {
      id
    }
  })
}