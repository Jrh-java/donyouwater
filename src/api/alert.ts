import request from '@/utils/request'

// 告警规则相关接口类型定义
export interface AlertRule {
  id?: number;
  ruleName?: string;
  warnType?: string;
  warnLevel?: string;
  warnValue?: string;
  receiveType?: string;
  receiverCode?: string;
  reamrks?: string;
  isActive?: string;
  notifyType?: string;
  crtTime?: string;
  crtUser?: string;
  crtName?: string;
  updTime?: string;
  updUser?: string;
  updName?: string;
  reservoirManagementId?: string;
  gateStationId?: string;
  reservoirManagementNo?: string;
  gateStationCode?: string;
}

export interface AlertRuleQuery {
  page: number
  limit: number
  ruleName?: string
  warnLevel?: string
  warnType?: string
  isActive?: string
}

export interface PageResult<T> {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: T[]
}

// 新增告警规则
export function saveAlertRule(data: AlertRule) {
  return request({
    url: '/authApi/bms/reservoir/reservoirWarnRuleConfig/save',
    method: 'post',
    data
  })
}

// 分页查询告警规则
export function getAlertRulePage(data: AlertRuleQuery): Promise<PageResult<AlertRule>> {
  return request({
    url: '/authApi/bms/reservoir/reservoirWarnRuleConfig/page',
    method: 'post',
    data
  })
}

// 删除告警规则
export function deleteAlertRule(ids: string[]) {
  return request({
    url: '/authApi/bms/reservoir/reservoirWarnRuleConfig/delete',
    method: 'post',
    data: { ids }
  })
}

// 查看告警规则详情
export function getAlertRuleDetail(id: string): Promise<AlertRule> {
  return request({
    url: '/authApi/bms/reservoir/reservoirWarnRuleConfig/get',
    method: 'post',
    data: { id }
  })
}

// 更新告警规则
export function updateAlertRule(data: AlertRule) {
  return request({
    url: '/authApi/bms/reservoir/reservoirWarnRuleConfig/update',
    method: 'post',
    data
  })
}