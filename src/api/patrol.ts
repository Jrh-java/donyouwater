import request from '@/utils/request';

// 巡检路线管理相关接口类型定义
export interface PatrolRouteDrawAreaConfig {
  areaType: string; // 区域类型(1.圆形区域 2.矩形区域)
  extent?: number;
  id?: string;
  leftLonLat?: string;
  lonLat?: string; // 中心经纬度(圆形区域使用)
  pointType?: string;
  radius?: number;
  rightLonLat?: string;
  routeManagementId?: string;
}

export interface PatrolRouteNodeConfig {
  distance?: number;
  endNode?: string;
  file?: string;
  id?: string;
  node?: string; // 路线节点信息(;号隔开)
  routeManagementId?: string;
  startPoint?: string;
}

export interface PatrolRoute {
  id?: string;
  belongReservoirId?: string; // 所属水库ID
  type: string; // 必传
  routeType: string; // 路线类型(1.日常巡检 2.年度巡检 3.特殊巡检 4.维修 5.保养)
  routeName: string; // 路线名称
  file?: string; // 文件信息
  status: string; // 必传T
  remarks?: string; // 备注
  isDraft?: string; // 是否保存草稿(T/F)
  patrolRouteDrawAreaConfigDTO?: PatrolRouteDrawAreaConfig;
  patrolRouteNodeConfigDTO?: PatrolRouteNodeConfig;
  crtTime?: string;
  crtUser?: string;
  crtName?: string;
  updTime?: string;
  updUser?: string;
  updName?: string;
  patrolRouteDrawAreaConfigVO?: PatrolRouteDrawAreaConfig;
  patrolRouteNodeConfigVO?: PatrolRouteNodeConfig;
}

export interface PatrolRoutePageQuery {
  limit: number;
  page: number;
  routeName?: string;
  status?: string;
}

export interface PatrolRoutePageResult {
  currPage: number;
  list: PatrolRoute[];
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

/**
 * 保存/创建巡检路线
 */
export function savePatrolRoute(data: PatrolRoute) {
  return request({
    url: '/authApi/bms/patrol/patrolRouteManagementConfigInfo/save',
    method: 'post',
    data
  });
}

/**
 * 获取草稿路线
 */
export function getPatrolRouteDraft() {
  return request({
    url: '/authApi/bms/patrol/patrolRouteManagementConfigInfo/getDraft',
    method: 'post'
  });
}

/**
 * 分页查询巡检路线
 */
export function getPatrolRoutePage(data: PatrolRoutePageQuery): Promise<PatrolRoutePageResult> {
  return request({
    url: '/authApi/bms/patrol/patrolRouteManagementConfigInfo/page',
    method: 'post',
    data
  });
}

/**
 * 删除巡检路线
 */
export function deletePatrolRoute(ids: string[]) {
  return request({
    url: '/authApi/bms/patrol/patrolRouteManagementConfigInfo/delete',
    method: 'post',
    data: { ids }
  });
}

/**
 * 查询巡检路线详情
 */
export function getPatrolRouteDetail(id: string): Promise<PatrolRoute> {
  return request({
    url: '/authApi/bms/patrol/patrolRouteManagementConfigInfo/get',
    method: 'post',
    data: { id }
  });
} 