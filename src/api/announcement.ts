import request from '@/utils/request';

// 公告数据接口
export interface AnnouncementItem {
  id: string;
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  file?: string;
  crtName: string;
  crtTime: string;
  status: string;
}

// 公告分页响应
export interface AnnouncementPageResponse {
  currPage: number;
  list: AnnouncementItem[];
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

// 用户通知状态
export interface UserNoticeStatus {
  id: string;
  noticeId: string;
  userId: string;
  userName: string;
  status: string;
}

// 公告详情
export interface AnnouncementDetail extends AnnouncementItem {
  userNoticeVOS: UserNoticeStatus[];
}

// 获取公告分页列表
export const getAnnouncementPageApi = async (params: {
  limit: number;
  page: number;
  noticeTitle?: string;
  noticeType?: string;
  pushStartTime?: string;
  pushEndTime?: string;
}): Promise<AnnouncementPageResponse> => {
  return request({
    url: '/authApi/reservoir/sys/sysNotice/page',
    method: 'post',
    data: params
  });
};

// 用户通知项
export interface UserNoticeItem {
  userId: string;
  userName: string;
}

// 添加公告
export const addAnnouncementApi = async (data: {
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  file?: string;
  userNoticeList: UserNoticeItem[];
}) => {
  return request({
    url: '/authApi/reservoir/sys/sysNotice/save',
    method: 'post',
    data
  });
};

// 删除公告
export const deleteAnnouncementApi = async (ids: string[]) => {
  return request({
    url: '/authApi/reservoir/sys/sysNotice/delete',
    method: 'post',
    data: { ids }
  });
};

// 获取公告详情
export const getAnnouncementDetailApi = async (id: string): Promise<AnnouncementDetail> => {
  return request({
    url: '/authApi/reservoir/sys/sysNotice/get',
    method: 'post',
    data: { id }
  });
};