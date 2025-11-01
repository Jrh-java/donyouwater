import request from '@/utils/request'

// 字典项接口类型定义
export interface DictItem {
  id: string
  code: string
  value: string
  typeCode: string
  typeValue: string
  isSys: string
  sort: number
}

// 字典查询参数
export interface DictQuery {
  limit: number
  page: number
  typeCode: string
}

// 字典分页结果
export interface DictPageResult {
  totalCount: number
  pageSize: number
  totalPage: number
  currPage: number
  list: DictItem[]
}

// 获取字典分页数据
export function getDictPage(data: DictQuery): Promise<DictPageResult> {
  return request({
    url: '/authApi/reservoir/sys/dict/page',
    method: 'post',
    data
  })
}

// 根据类型代码获取字典选项（用于下拉框）
export async function getDictOptions(typeCode: string): Promise<Array<{ value: string, label: string }>> {
  try {
    const response = await getDictPage({
      limit: 100,
      page: 1,
      typeCode
    })
    
    return response.list.map(item => ({
      value: item.code,
      label: item.value
    }))
  } catch (error) {
    console.error(`获取字典选项失败 (${typeCode}):`, error)
    return []
  }
}