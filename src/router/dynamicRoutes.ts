import { RouteRecordRaw } from 'vue-router'
import { queryMenuTree, type Menu } from '@/api/menu'
import { ROUTER_CONFIG } from '@/config/router.config'
import { useStore } from '@/store/pinia'

// 菜单树节点类型，兼容现有代码
export interface MenuTreeNode {
  id: string
  parentId: string
  menuName: string
  menuCode?: string
  menuType: string
  url?: string
  component?: string
  permission?: string
  icon?: string
  status: string
  children?: MenuTreeNode[]
}

// 预定义组件映射，避免动态导入字符串路径的问题
const COMPONENT_MAP: Record<string, () => Promise<any>> = {
  // Layout 组件
  '/layout/EmptyLayout.vue': () => import('../view/layout/EmptyLayout.vue'),
  '/layout/DefaultLayout.vue': () => import('../view/layout/DefaultLayout.vue'),
  '/layout/DefaultPage.vue': () => import('../view/layout/DefaultPage.vue'),
  
  // Viewer 组件
  '/viewer/layout.vue': () => import('../view/viewer/layout.vue'),
  
  // Dashboard
  '/dashboard/dashboard.vue': () => import('../view/dashboard/dashboard.vue'),
  
  // Gate 相关组件
  '/gate/index.vue': () => import('../view/gate/index.vue'),
  '/gate/overview.vue': () => import('../view/gate/overview.vue'),
  '/gate/environment.vue': () => import('../view/gate/environment.vue'),
  '/gate/stress.vue': () => import('../view/gate/stress.vue'),
  '/gate/displacement.vue': () => import('../view/gate/displacement.vue'),
  '/gate/seepage.vue': () => import('../view/gate/seepage.vue'),
  '/gate/flow.vue': () => import('../view/gate/flow.vue'),
  '/gate/control.vue': () => import('../view/gate/control.vue'),
  
  // Device
  '/device/DeviceManagement.vue': () => import('../view/device/DeviceManagement.vue'),
  
  // Monitor
  '/monitor/MonitorControl.vue': () => import('../view/monitor/MonitorControl.vue'),
  
  // Alert
  '/alert/index.vue': () => import('../view/alert/index.vue'),
  '/alert/Alert.vue': () => import('../view/alert/Alert.vue'),
  '/alert/rules.vue': () => import('../view/alert/rules.vue'),
  
  // Inspection - 使用正确的文件名
  '/inspection/inspectionManagement.vue': () => import('../view/inspection/inspectionManagement.vue'),
  
  // Task
  '/task/index.vue': () => import('../view/task/index.vue'),
  '/task/TaskList.vue': () => import('../view/task/TaskList.vue'),
  '/task/TaskBoard.vue': () => import('../view/task/TaskBoard.vue'),
  
  // Schedule - 修正路径映射
  '/schedule/SchedulePlan.vue': () => import('../view/task/SchedulePlan.vue'),
  '/task/SchedulePlan.vue': () => import('../view/task/SchedulePlan.vue'),
  
  // System
  '/system/index.vue': () => import('../view/system/index.vue'),
  '/system/department/index.vue': () => import('../view/system/department/index.vue'),
  '/system/employee/index.vue': () => import('../view/system/employee/index.vue'),
  '/system/role/index.vue': () => import('../view/system/role/index.vue'),
  '/system/announcement.vue': () => import('../view/system/announcement.vue'),
  '/system/menu/menu-list.vue': () => import('../view/system/menu/menu-list.vue'),
  '/system/operation-log.vue': () => import('../view/system/operation-log.vue'),
  
  // 404 页面 - 在main布局内显示
  '/404.vue': () => import('../view/layout/Main404.vue')
}

// 动态组件加载函数
function loadComponent(componentPath: string) {
  if (!componentPath || componentPath === '#') {
    return COMPONENT_MAP['/layout/EmptyLayout.vue']
  }
  
  // 清理组件路径
  let cleanPath = componentPath
  
  // 移除开头的 /@ 或 @
  if (cleanPath.startsWith('/@/')) {
    cleanPath = cleanPath.replace('/@/', '')
  } else if (cleanPath.startsWith('@/')) {
    cleanPath = cleanPath.replace('@/', '')
  } else if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1)
  }
  
  // 确保路径以 view/ 开头
  if (!cleanPath.startsWith('view/')) {
    cleanPath = `view/${cleanPath}`
  }
  
  // 确保路径以 .vue 结尾
  if (!cleanPath.endsWith('.vue')) {
    cleanPath = `${cleanPath}.vue`
  }
  
  // 将view/路径转换为组件映射路径
  const mappingPath = `/${cleanPath.replace('view/', '')}`
  
  console.log(`动态加载组件: ${componentPath} -> ${mappingPath}`)
  
  // 从预定义映射中获取组件
  const componentLoader = COMPONENT_MAP[mappingPath]
  
  if (componentLoader) {
    console.log(`✅ 找到组件映射: ${mappingPath}`)
    return componentLoader
  } else {
    console.warn(`⚠️ 未找到组件映射: ${mappingPath}，将显示404页面`)
    console.log('可用的组件映射:', Object.keys(COMPONENT_MAP).sort())
    // 如果没有找到组件，返回404页面而不是跳转登录
    return COMPONENT_MAP['/404.vue']
  }
}

// 生成路由路径
function generateRoutePath(menu: MenuTreeNode, parentPath = ''): string {
  // 特殊处理：如果是一张图，返回根路径
  if (menu.id === '1') {
    return '/viewer-fullscreen'
  }
  
  // 如果菜单有url字段，直接使用
  if (menu.url && menu.url !== '#') {
    return menu.url
  }
  
  // 如果是顶级菜单，路径为 /main/xxx
  if (menu.parentId === '-1') {
    const pathSegment = getPathSegment(menu.menuName)
    return `/main/${pathSegment}`
  }
  
  // 子菜单路径
  const pathSegment = getPathSegment(menu.menuName)
  return `${parentPath}/${pathSegment}`
}

// 根据菜单名称生成路径片段
function getPathSegment(menuName: string): string {
  // 基础映射，用于常见菜单名称
  const pathMap: Record<string, string> = {
    '首页': 'dashboard',
    '库闸管理': 'gate',
    '库闸总览': 'overview',
    '环境监测': 'environment',
    '应力监测': 'stress',
    '位移监测': 'displacement',
    '渗压监测': 'seepage',
    '渗流监测': 'flow',
    '闸门管理': 'control',
    '设备管理': 'device',
    '视频监控': 'monitor',
    '风险预警': 'alert',
    '异常预警': 'exception',
    '告警规则配置': 'rules',
    '巡查管理': 'inspectionManagement',
    '任务管理': 'task',
    '任务列表': 'list',
    '任务看板-月': 'board-month',
    '任务看板-周': 'board-week',
    '调度预案': 'schedule',
    '系统管理': 'system',
    '部门管理': 'department',
    '员工管理': 'employee',
    '角色管理': 'role',
    '公告管理': 'announcement',
    '菜单管理': 'menu',
    '操作日志': 'operation-log'
  }
  
  // 如果有映射，使用映射；否则转换为小写并替换空格
  return pathMap[menuName] || menuName.toLowerCase().replace(/\s+/g, '-')
}

// 获取默认重定向路径
function getDefaultRedirect(menu: MenuTreeNode, routePath: string): string | undefined {
  if (menu.children && menu.children.length > 0) {
    const firstChild = menu.children[0]
    return generateRoutePath(firstChild, routePath)
  }
  return undefined
}

// 转换菜单为路由
function transformMenuToRoute(menu: MenuTreeNode, parentPath = ''): RouteRecordRaw | null {
  // 只处理启用的菜单，忽略按钮类型
  if (menu.status !== 'T' || menu.menuType === 'F') {
    console.log(`跳过菜单: ${menu.menuName} (状态: ${menu.status}, 类型: ${menu.menuType})`)
    return null
  }
  
  // 特殊处理：一张图直接返回
  if (menu.id === '1') {
    return {
      path: '/viewer-fullscreen',
      component: loadComponent('/viewer/layout.vue'),
      meta: { title: menu.menuName, icon: menu.icon }
    }
  }
  
  // 优先使用url字段，如果没有则生成路径
  let routePath = menu.url || generateRoutePath(menu, parentPath)
  
  // 对于子路由，路径应该是相对路径（去掉父路径部分）
  if (parentPath) {
    // 如果是子路由，路径应该是相对的
    if (routePath.startsWith(parentPath)) {
      routePath = routePath.replace(parentPath, '')
    }
    // 确保子路由路径不以/开头（除非是绝对路径）
    if (routePath.startsWith('/') && !routePath.startsWith('/main')) {
      routePath = routePath.substring(1)
    }
  } else {
    // 对于顶级路由，去掉/main前缀
    if (routePath.startsWith('/main/')) {
      routePath = routePath.replace('/main/', '')
    } else if (routePath === '/main') {
      routePath = ''
    }
  }
  
  const route: Partial<RouteRecordRaw> = {
    path: routePath,
    meta: { 
      title: menu.menuName, 
      icon: menu.icon,
      menuId: menu.id,
      menuType: menu.menuType
    }
  }
  
  // 如果是目录类型且有子菜单
  if (menu.menuType === 'M' && menu.children && menu.children.length > 0) {
    // 使用组件路径或默认布局组件
    if (menu.component && menu.component !== '#') {
      route.component = loadComponent(menu.component)
    } else {
      // 使用默认布局组件
      route.component = loadComponent('/layout/DefaultLayout.vue')
    }
    
    // 设置默认重定向 - 使用第一个子菜单的路径
    // 过滤掉按钮类型的子菜单，只使用目录和菜单类型
    const validChildren = menu.children.filter(child => child.status === 'T' && child.menuType !== 'F')
    const firstChild = validChildren[0]
    if (firstChild) {
      let redirectPath = firstChild.url || generateRoutePath(firstChild, menu.url || generateRoutePath(menu, parentPath))
      // 确保重定向路径是完整路径
      if (!redirectPath.startsWith('/main/') && !redirectPath.startsWith('/viewer')) {
        const fullParentPath = menu.url || generateRoutePath(menu, parentPath)
        if (fullParentPath.startsWith('/main/')) {
          redirectPath = fullParentPath + '/' + (redirectPath.startsWith('/') ? redirectPath.substring(1) : redirectPath)
        }
      }
      route.redirect = redirectPath
    }
    
    // 处理子路由 - 过滤掉按钮类型
    const fullParentPath = menu.url || generateRoutePath(menu, parentPath)
    route.children = menu.children
      .filter(child => child.status === 'T' && child.menuType !== 'F') // 过滤掉按钮类型
      .map(child => transformMenuToRoute(child, fullParentPath))
      .filter(Boolean) as RouteRecordRaw[]
  } else if (menu.menuType === 'C') {
    // 菜单类型，设置组件
    if (menu.component && menu.component !== '#') {
      route.component = loadComponent(menu.component)
    } else {
      // 如果没有指定组件，使用404页面
      console.warn(`菜单 "${menu.menuName}" 没有指定组件，将显示404页面`)
      route.component = loadComponent('/404.vue')
    }
  }
  
  return route as RouteRecordRaw
}

// 获取动态路由
export async function getDynamicRoutes(): Promise<RouteRecordRaw[]> {
  try {
    console.log('🚀 开始获取动态路由...')
    
    // 获取store中的roleId
    const store = useStore()
    const roleId = store.roleId
    const isLoggedIn = store.isLoggedIn
    const token = store.token
    
    console.log('📊 动态路由状态检查:', { 
      roleId, 
      isLoggedIn, 
      hasToken: !!token,
      storeState: { 
        roleId: store.roleId, 
        isLoggedIn: store.isLoggedIn,
        userInfo: store.userInfo
      }
    })
    
    if (!isLoggedIn) {
      console.log('🚨 动态路由获取失败: 用户未登录')
      throw new Error('用户未登录，无法获取动态路由')
    }
    
    if (!token) {
      console.log('🚨 动态路由获取失败: 未找到登录token')
      throw new Error('未找到登录token，无法获取动态路由')
    }
    
    if (!roleId) {
      console.warn('⚠️ 未找到角色ID，尝试使用默认权限或静态路由');
      console.log('🚨 动态路由获取失败: 缺少角色ID', {
        reason: '未找到角色ID',
        storeRoleId: store.roleId,
        storeKeys: Object.keys(store),
        willFallbackToStatic: true
      })
      
      // 选项1：抛出错误让系统回退到静态路由
      throw new Error('未找到角色ID，回退到静态路由模式')
      
      // 选项2：可以考虑查询默认角色或提供基础权限菜单
      // const defaultRoleId = 'default_role_id'
      // console.log(`使用默认角色ID: ${defaultRoleId}`)
      // roleId = defaultRoleId
    }
    
    console.log(`🔑 使用角色ID获取菜单: ${roleId}`)
    
    // 调用菜单树接口，传递角色ID
    console.log('📡 准备调用API...')
    const response: any = await queryMenuTree({
      key: "",
      menuType: "", 
      status: "T",
      roleId: roleId
    })
    
    console.log('📡 API响应:', {
      hasResponse: !!response,
      responseType: typeof response,
      isArray: Array.isArray(response),
      length: response?.length || 0,
      firstItem: response?.[0] || null
    })
    
    // 处理响应数据结构 - request.ts已经处理了.data，直接使用response作为菜单数据
    const menuData: MenuTreeNode[] = response || []
    
    if (!menuData || menuData.length === 0) {
      console.warn('⚠️ 菜单数据为空，将生成基础路由结构:', {
        menuData,
        responseLength: response?.length,
        responseType: typeof response
      })
      // 即使菜单数据为空，也生成基础的main布局路由，避免系统崩溃
      const basicRoutes: RouteRecordRaw[] = [
        {
          path: '/main',
          component: () => import('../view/layout/MainLayout.vue'),
          redirect: ROUTER_CONFIG.mainDefaultRoute,
          children: [
            {
              path: ':pathMatch(.*)*',
              name: 'Main404',
              component: () => import('../view/layout/Main404.vue'),
              meta: {
                title: '页面未找到',
                hideInMenu: true
              }
            }
          ]
        }
      ]
      return basicRoutes
    }
    
    console.log('✅ 菜单数据获取成功，开始转换路由...', {
      menuCount: menuData.length,
      menuNames: menuData.map(m => m.menuName)
    })
    
    // 打印每个菜单项的详细信息
    menuData.forEach((menu: MenuTreeNode, index: number) => {
      console.log(`📋 菜单项 ${index + 1}: ${menu.menuName}`, {
        id: menu.id,
        menuType: menu.menuType,
        url: menu.url,
        component: menu.component,
        status: menu.status,
        hasChildren: !!(menu.children && menu.children.length > 0),
        childrenCount: menu.children?.length || 0
      })
      
      if (menu.children?.length) {
        menu.children.forEach((child, childIndex) => {
          console.log(`  └─ 子菜单 ${childIndex + 1}: ${child.menuName}`, {
            id: child.id,
            menuType: child.menuType,
            url: child.url,
            component: child.component,
            status: child.status
          })
        })
      }
    })
    
    // 分离出一张图和其他菜单
    const viewerMenu = menuData.find((menu: MenuTreeNode) => menu.id === '1')
    const mainMenus = menuData.filter((menu: MenuTreeNode) => menu.id !== '1')
    
    console.log('📊 菜单分类结果:', {
      hasViewerMenu: !!viewerMenu,
      viewerMenuName: viewerMenu?.menuName,
      mainMenusCount: mainMenus.length,
      mainMenuNames: mainMenus.map(m => m.menuName)
    })
    
    const dynamicRoutes: RouteRecordRaw[] = []
    
    // 添加一张图路由
    if (viewerMenu) {
      const viewerRoute = transformMenuToRoute(viewerMenu)
      if (viewerRoute) {
        console.log('✅ 生成一张图路由:', viewerRoute)
        dynamicRoutes.push(viewerRoute)
      } else {
        console.warn('⚠️ 一张图路由转换失败')
      }
    }
    
    // 生成主要路由的子路由
    const mainChildren: RouteRecordRaw[] = []
    
    for (const menu of mainMenus) {
      const route = transformMenuToRoute(menu)
      if (route) {
        console.log(`✅ 生成菜单路由 "${menu.menuName}":`, {
          path: route.path,
          hasComponent: !!route.component,
          hasChildren: !!route.children?.length,
          childrenCount: route.children?.length || 0
        })
        mainChildren.push(route)
      } else {
        console.warn(`⚠️ 菜单 "${menu.menuName}" 路由转换失败`)
      }
    }
    
    console.log('📊 主要路由转换结果:', {
      totalMainMenus: mainMenus.length,
      successfulRoutes: mainChildren.length,
      routePaths: mainChildren.map(r => r.path)
    })
    
    // 添加主布局路由
    if (mainChildren.length > 0) {
      // 添加404路由到main子路由中
      mainChildren.push({
        path: ':pathMatch(.*)*',
        name: 'Main404',
        component: () => import('../view/layout/Main404.vue'),
        meta: {
          title: '页面未找到',
          hideInMenu: true
        }
      })
      
      const mainLayoutRoute = {
        path: '/main',
        component: () => import('../view/layout/MainLayout.vue'),
        redirect: ROUTER_CONFIG.mainDefaultRoute,
        children: mainChildren
      }
      
      dynamicRoutes.push(mainLayoutRoute)
      console.log('✅ 生成主布局路由，子路由数量:', mainChildren.length)
    } else {
      console.warn('⚠️ 没有生成任何主要路由，主布局路由将为空')
    }
    
    console.log('🎉 动态路由生成成功:', {
      totalRoutes: dynamicRoutes.length,
      routePaths: dynamicRoutes.map(r => r.path),
      hasMainRoute: dynamicRoutes.some(r => r.path === '/main'),
      mainRouteChildrenCount: dynamicRoutes.find(r => r.path === '/main')?.children?.length || 0
    })
    
    return dynamicRoutes
    
  } catch (error) {
    console.error('❌ 获取动态路由失败:', error)
    console.error('错误详情:', {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

// 检查动态路由是否可用
export async function isDynamicRoutesAvailable(): Promise<boolean> {
  try {
    // 获取store中的roleId
    const store = useStore()
    const roleId = store.roleId
    const isLoggedIn = store.isLoggedIn
    const token = store.token
    
    console.log('检查动态路由可用性:', { 
      roleId, 
      isLoggedIn, 
      hasToken: !!token 
    })
    
    console.log('🔍 动态路由可用性详细检查:', {
      storeState: {
        roleId: roleId,
        roleIdType: typeof roleId,
        isLoggedIn: isLoggedIn,
        isLoggedInType: typeof isLoggedIn,
        hasToken: !!token,
        tokenLength: token?.length || 0
      },
      localStorage: {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        hasAuthToken: !!localStorage.getItem('authToken')
      },
      conditions: {
        condition1_isLoggedIn: !!isLoggedIn,
        condition2_hasToken: !!token,
        condition3_hasRoleId: !!roleId,
        allConditionsMet: !!(isLoggedIn && token && roleId)
      }
    })
    
    if (!isLoggedIn || !token || !roleId) {
      console.warn('动态路由不可用: 用户未完全登录或缺少角色ID')
      console.log('🚨 动态路由不可用的具体原因:', {
        missingLogin: !isLoggedIn,
        missingToken: !token,
        missingRoleId: !roleId,
        recommendation: '需要完整的登录状态和角色信息'
      })
      return false
    }
    
    // 只检查API是否可用，不检查具体的菜单数据
    // 即使某些组件不存在，也应该允许动态路由系统运行，由404页面处理
    const response = await Promise.race([
      queryMenuTree({
        key: "",
        menuType: "", 
        status: "T",
        roleId: roleId
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('接口超时')), ROUTER_CONFIG.api.timeout)
      )
    ])
    
    // 只要API调用成功，就认为动态路由可用
    // 具体的组件加载错误由loadComponent函数处理，返回404页面
    console.log('✅ 动态路由API调用成功，系统可用')
    return true
  } catch (error) {
    console.warn('动态路由API不可用:', error)
    return false
  }
}