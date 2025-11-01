// 菜单类型枚举 - 根据新接口规范
export const MENU_TYPE_ENUM = {
  CATALOG: { value: 'M', desc: '目录' },
  MENU: { value: 'C', desc: '菜单' },  
  POINTS: { value: 'F', desc: '按钮' }
}

// 菜单状态枚举
export const MENU_STATUS_ENUM = {
  ENABLE: { value: 'T', desc: '启用' },
  DISABLE: { value: 'F', desc: '禁用' }
}

// 权限类型枚举
export const MENU_PERMS_TYPE_ENUM = {
  SA_TOKEN: { value: 1, desc: 'Sa-Token' },
  SPRING_SECURITY: { value: 2, desc: 'Spring Security' }
}

// 默认父级菜单ID
export const MENU_DEFAULT_PARENT_ID = "-1"

// 静态菜单数据 - 树形结构
export const STATIC_MENU_DATA = [
  {
    id: '1',
    menuName: '一张图',
    menuType: MENU_TYPE_ENUM.MENU.value,
    icon: 'Monitor',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/viewer-fullscreen',
    component: '/viewer/layout.vue',
    orderNum: 1,
    status: MENU_STATUS_ENUM.ENABLE.value
  },
  {
    id: '2',
    menuName: '首页',
    menuType: MENU_TYPE_ENUM.MENU.value,
    icon: 'HomeFilled',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/dashboard',
    component: '/dashboard/dashboard.vue',
    orderNum: 2,
    status: MENU_STATUS_ENUM.ENABLE.value
  },
  {
    id: '3',
    menuName: '库闸管理',
    menuType: MENU_TYPE_ENUM.CATALOG.value,
    icon: 'Lock',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/gate',
    orderNum: 3,
    status: MENU_STATUS_ENUM.ENABLE.value,
    children: [
      {
        id: '31',
        menuName: '库闸总览',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'View',
        parentId: '3',
        path: '/main/gate/overview',
        component: '/gate/overview.vue',
        orderNum: 1,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '32',
        menuName: '环境监测',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Cloudy',
        parentId: '3',
        path: '/main/gate/environment',
        component: '/gate/environment.vue',
        orderNum: 2,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '33',
        menuName: '应力监测',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'DataLine',
        parentId: '3',
        path: '/main/gate/stress',
        component: '/gate/stress.vue',
        orderNum: 3,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '34',
        menuName: '位移监测',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Position',
        parentId: '3',
        path: '/main/gate/displacement',
        component: '/gate/displacement.vue',
        orderNum: 4,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '35',
        menuName: '渗压监测',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Promotion',
        parentId: '3',
        path: '/main/gate/seepage',
        component: '/gate/seepage.vue',
        orderNum: 5,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '36',
        menuName: '渗流监测',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Connection',
        parentId: '3',
        path: '/main/gate/flow',
        component: '/gate/flow.vue',
        orderNum: 6,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '37',
        menuName: '闸门管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Operation',
        parentId: '3',
        path: '/main/gate/control',
        component: '/gate/control.vue',
        orderNum: 7,
        status: MENU_STATUS_ENUM.ENABLE.value
      }
    ]
  },
  {
    id: '4',
    menuName: '设备管理',
    menuType: MENU_TYPE_ENUM.MENU.value,
    icon: 'Setting',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/device',
    component: '/device/DeviceManagement.vue',
    orderNum: 4,
    status: MENU_STATUS_ENUM.ENABLE.value
  },
  {
    id: '5',
    menuName: '视频监控',
    menuType: MENU_TYPE_ENUM.MENU.value,
    icon: 'VideoCamera',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/monitor',
    component: '/monitor/MonitorControl.vue',
    orderNum: 5,
    status: MENU_STATUS_ENUM.ENABLE.value
  },
  {
    id: '6',
    menuName: '风险预警',
    menuType: MENU_TYPE_ENUM.CATALOG.value,
    icon: 'Warning',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/alert',
    orderNum: 6,
    status: MENU_STATUS_ENUM.ENABLE.value,
    children: [
      {
        id: '61',
        menuName: '异常预警',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'WarningFilled',
        parentId: '6',
        path: '/main/alert/exception',
        component: '/alert/Alert.vue',
        orderNum: 1,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '62',
        menuName: '告警规则配置',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Tools',
        parentId: '6',
        path: '/main/alert/rules',
        component: '/alert/rules.vue',
        orderNum: 2,
        status: MENU_STATUS_ENUM.ENABLE.value
      }
    ]
  },
  {
    id: '7',
    menuName: '巡查管理',
    menuType: MENU_TYPE_ENUM.MENU.value,
    icon: 'MapLocation',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/inspection/inspectionManagement',
    component: '/inspection/inspectionManagement.vue',
    orderNum: 7,
    status: MENU_STATUS_ENUM.ENABLE.value
  },
  {
    id: '8',
    menuName: '任务管理',
    menuType: MENU_TYPE_ENUM.CATALOG.value,
    icon: 'DocumentCopy',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/task',
    orderNum: 8,
    status: MENU_STATUS_ENUM.ENABLE.value,
    children: [
      {
        id: '81',
        menuName: '任务列表',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'List',
        parentId: '8',
        path: '/main/task/list',
        component: '/task/TaskList.vue',
        orderNum: 1,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '82',
        menuName: '任务看板-月',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Calendar',
        parentId: '8',
        path: '/main/task/board-month',
        component: '/task/TaskBoard.vue',
        orderNum: 2,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      
      {
        id: '84',
        menuName: '调度预案',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'DataBoard',
        parentId: '8',
        path: '/main/task/schedule',
        component: '/task/SchedulePlan.vue',
        orderNum: 4,
        status: MENU_STATUS_ENUM.ENABLE.value
      }
    ]
  },
  {
    id: '9',
    menuName: '系统管理',
    menuType: MENU_TYPE_ENUM.CATALOG.value,
    icon: 'Management',
    parentId: MENU_DEFAULT_PARENT_ID,
    path: '/main/system',
    orderNum: 9,
    status: MENU_STATUS_ENUM.ENABLE.value,
    children: [
      {
        id: '91',
        menuName: '部门管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'OfficeBuilding',
        parentId: '9',
        path: '/main/system/department',
        component: '/system/department/index.vue',
        orderNum: 1,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '92',
        menuName: '员工管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'User',
        parentId: '9',
        path: '/main/system/employee',
        component: '/system/employee/index.vue',
        orderNum: 2,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '93',
        menuName: '角色管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Avatar',
        parentId: '9',
        path: '/main/system/role',
        component: '/system/role/index.vue',
        orderNum: 3,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '94',
        menuName: '公告管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Bell',
        parentId: '9',
        path: '/main/system/announcement',
        component: '/system/announcement.vue',
        orderNum: 4,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '95',
        menuName: '菜单管理',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Menu',
        parentId: '9',
        path: '/main/system/menu',
        component: '/system/menu/menu-list.vue',
        orderNum: 5,
        status: MENU_STATUS_ENUM.ENABLE.value
      },
      {
        id: '96',
        menuName: '操作日志',
        menuType: MENU_TYPE_ENUM.MENU.value,
        icon: 'Document',
        parentId: '9',
        path: '/main/system/operation-log',
        component: '/system/operation-log.vue',
        orderNum: 6,
        status: MENU_STATUS_ENUM.ENABLE.value
      }
    ]
  }
] 