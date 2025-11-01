import { RouteRecordRaw } from 'vue-router'

// 静态路由配置 - 作为动态路由的备选方案
export const STATIC_ROUTES: Array<RouteRecordRaw> = [
  {
    path: '/viewer-fullscreen',
    component: () => import('../view/viewer/layout.vue'),
    meta: { title: '首页一张图' }
  },
  {
    path: '',
    redirect: '/viewer-fullscreen'
  },
  {
    path: '/login',
    component: () => import('../view/login.vue'),
  },
  {
    path: '/main',
    component: () => import('../view/layout/MainLayout.vue'),
    redirect: '/main/dashboard',
    children: [
      // 首页
      {
        path: 'dashboard',
        component: () => import('../view/dashboard/dashboard.vue'),
        meta: { title: '首页' }
      },
      // 库闸管理
      {
        path: 'gate',
        component: () => import('../view/gate/index.vue'),
        props: route => ({ key: route.fullPath }),
        meta: { title: '库闸管理' },
        redirect: '/main/gate/overview',
        children: [
          {
            path: 'overview',
            component: () => import('../view/gate/overview.vue'),
            meta: { title: '库闸总览' }
          },
          {
            path: 'environment',
            component: () => import('../view/gate/environment.vue'),
            meta: { title: '环境监测' }
          },
          {
            path: 'stress',
            component: () => import('../view/gate/stress.vue'),
            meta: { title: '应力监测' }
          },
          {
            path: 'displacement',
            component: () => import('../view/gate/displacement.vue'),
            meta: { title: '位移监测' }
          },
          {
            path: 'seepage',
            component: () => import('../view/gate/seepage.vue'),
            meta: { title: '渗压监测' }
          },
          {
            path: 'flow',
            component: () => import('../view/gate/flow.vue'),
            meta: { title: '渗流监测' }
          },
          {
            path: 'control',
            component: () => import('../view/gate/control.vue'),
            meta: { title: '闸门管理' }
          }
        ]
      },
      // 设备管理
      {
        path: 'device',
        component: () => import('../view/device/DeviceManagement.vue'),
        meta: { title: '设备管理' }
      },
      // 视频监控
      {
        path: 'monitor',
        component: () => import('../view/monitor/MonitorControl.vue'),
        meta: { title: '视频监控' }
      },
      // 风险预警
      {
        path: 'alert',
        component: () => import('../view/alert/index.vue'),
        meta: { title: '风险预警' },
        redirect: '/main/alert/exception',
        children: [
          {
            path: 'exception',
            component: () => import('../view/alert/Alert.vue'),
            meta: { title: '异常预警' }
          },
          {
            path: 'rules',
            component: () => import('../view/alert/rules.vue'),
            meta: { title: '告警规则配置' }
          }
        ]
      },
      // 巡查管理
      {
        path: 'inspection',
        component: () => import('../view/inspection/inspectionManagement.vue'),
        meta: { title: '巡查管理' }
      },
      // 任务管理
      {
        path: 'task',
        component: () => import('../view/task/index.vue'),
        meta: { title: '任务管理' },
        redirect: '/main/task/list',
        children: [
          {
            path: 'list',
            component: () => import('../view/task/TaskList.vue'),
            meta: { title: '任务列表' }
          },
          {
            path: 'board-month',
            component: () => import('../view/task/TaskBoard.vue'),
            meta: { title: '任务看板' }
          },
          
          {
            path: 'schedule',
            component: () => import('../view/task/SchedulePlan.vue'),
            meta: { title: '调度预案' }
          }
        ]
      },
      // 系统管理
      {
        path: 'system',
        component: () => import('../view/system/index.vue'),
        meta: { title: '系统管理' },
        redirect: '/main/system/department',
        children: [
          {
            path: 'department',
            component: () => import('../view/system/department/index.vue'),
            meta: { title: '部门管理' }
          },
          {
            path: 'employee',
            component: () => import('../view/system/employee/index.vue'),
            meta: { title: '员工管理' }
          },
          {
            path: 'role',
            component: () => import('../view/system/role/index.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'announcement',
            component: () => import('../view/system/announcement.vue'),
            meta: { title: '公告管理' }
          },
          {
            path: 'menu',
            component: () => import('../view/system/menu/menu-list.vue'),
            meta: { title: '菜单管理' }
          },
          {
            path: 'operation-log',
            component: () => import('../view/system/operation-log.vue'),
            meta: { title: '操作日志' }
          }
        ]
      },
      // 权限测试页面
      {
        path: 'test-privilege',
        component: () => import('../view/test-privilege.vue'),
        meta: { title: '权限测试' }
      },
      // 其他路由
      {
        path: '/homePage',
        redirect: '/main/dashboard'
      },
     
      {
        path:"/:pathMatch(.*)*",
        redirect: '/login'
      } 
    ]
  }
]