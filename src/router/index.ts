import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ROUTER_CONFIG } from '@/config/router.config'
import { getDynamicRoutes, isDynamicRoutesAvailable } from './dynamicRoutes'
import { STATIC_ROUTES } from './staticRoutes'

// 基础路由（登录页等）
const BASE_ROUTES: Array<RouteRecordRaw> = [
  {
    path: '/login',
    component: () => import('../view/login.vue'),
          }
        ]

// 初始化路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: BASE_ROUTES
})

// 动态添加路由的函数
async function setupRoutes() {
  try {
    console.log(`路由模式: ${ROUTER_CONFIG.mode}`)
    console.log('🔧 开始路由设置流程:', {
      routerMode: ROUTER_CONFIG.mode,
      fallbackToStatic: ROUTER_CONFIG.fallbackToStatic,
      defaultRoute: ROUTER_CONFIG.defaultRoute,
      currentRoutesCount: router.getRoutes().length
    })
    
    let routes: RouteRecordRaw[] = []
    
    if (ROUTER_CONFIG.mode === 'dynamic') {
      // 尝试使用动态路由
      console.log('尝试获取动态路由...')
      
      const isDynamicAvailable = await isDynamicRoutesAvailable()
      console.log('🔍 动态路由可用性检查结果:', isDynamicAvailable)
      
      if (isDynamicAvailable) {
        routes = await getDynamicRoutes()
        console.log('✅ 动态路由加载成功')
        console.log('📊 动态路由详情:', {
          routesCount: routes.length,
          routePaths: routes.map(r => r.path)
        })
        
        // 添加默认重定向和404路由
        routes.unshift({
          path: '',
          redirect: ROUTER_CONFIG.defaultRoute
        })
        
        routes.push({
          path: "/:pathMatch(.*)*",
          redirect: '/login'
        })
        
      } else {
        console.log('🚨 动态路由不可用，准备抛出错误')
        throw new Error('动态路由API不可用')
      }
    } else {
      // 使用静态路由
      routes = STATIC_ROUTES
      console.log('✅ 使用静态路由')
      console.log('📊 静态路由详情:', {
        routesCount: routes.length,
        routePaths: routes.map(r => r.path)
      })
    }
    
    // 添加路由到路由器
    routes.forEach(route => {
      router.addRoute(route)
    })
    
    console.log('✅ 路由设置完成', routes)
    
  } catch (error) {
    console.error('❌ 动态路由加载失败:', error)
    console.log('🚨 setupRoutes错误详细分析:', {
      errorType: typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : 'N/A',
      routerMode: ROUTER_CONFIG.mode,
      canFallback: ROUTER_CONFIG.fallbackToStatic && ROUTER_CONFIG.mode === 'dynamic',
      currentRoutesCount: router.getRoutes().length
    })
    
    if (ROUTER_CONFIG.fallbackToStatic && ROUTER_CONFIG.mode === 'dynamic') {
      console.log('🔄 回退到静态路由...')
      console.log('🚨 回退原因: 动态路由加载失败，启用静态路由备选方案')
      
      // 回退到静态路由
      STATIC_ROUTES.forEach(route => {
        router.addRoute(route)
      })
      
      console.log('✅ 静态路由回退成功')
      console.log('📊 回退后路由状态:', {
        totalRoutes: router.getRoutes().length,
        staticRoutesCount: STATIC_ROUTES.length
      })
    } else {
      console.error('❌ 路由初始化完全失败')
      console.log('🚨 完全失败原因:', {
        reason: '无法回退到静态路由',
        fallbackEnabled: ROUTER_CONFIG.fallbackToStatic,
        isDynamicMode: ROUTER_CONFIG.mode === 'dynamic',
        recommendation: '检查路由配置或网络连接'
      })
    }
  }
}

// 路由守卫 - 检查登录状态
router.beforeEach(async (to, from, next) => {
  console.log('=== 路由守卫触发 ===')
  console.log('导航信息:', { 
    to: { path: to.path, name: to.name, meta: to.meta }, 
    from: { path: from.path, name: from.name }, 
    totalRoutes: router.getRoutes().length 
  })
  
  // 获取登录状态
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const token = localStorage.getItem('authToken')
  
  console.log('🔐 登录状态检查:', { 
    isLoggedIn, 
    hasToken: !!token, 
    targetPath: to.path,
    requiresAuth: to.meta?.requiresAuth !== false
  })
  
  // 添加详细的localStorage状态检查
  console.log('📱 localStorage详细状态:', {
    isLoggedIn_raw: localStorage.getItem('isLoggedIn'),
    authToken_raw: localStorage.getItem('authToken'),
    authToken_length: localStorage.getItem('authToken')?.length || 0,
    allLocalStorageKeys: Object.keys(localStorage)
  })
  
  // 如果要去登录页，直接放行
  if (to.path === '/login') {
    console.log('✅ 目标是登录页，直接放行')
    next()
    return
  }
  
  // 如果未登录且没有token，跳转到登录页
  if (!isLoggedIn || !token) {
    console.log('❌ 未登录或无token，跳转到登录页')
    console.log('🚨 重定向到login的原因分析:', {
      isLoggedIn: isLoggedIn,
      isLoggedInType: typeof isLoggedIn,
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : 'null',
      condition1_notLoggedIn: !isLoggedIn,
      condition2_noToken: !token,
      finalCondition: !isLoggedIn || !token,
      targetPath: to.path,
      fromPath: from.path
    })
    next('/login')
    return
  }
  
  // 如果已登录但路由未初始化，则初始化路由
  const currentRoutes = router.getRoutes()
  const hasMainRoutes = currentRoutes.some(route => route.path.startsWith('/main') && route.children?.length > 1)
  
  if (!hasMainRoutes && isLoggedIn && token) {
    console.log('📊 用户已登录但路由未完全初始化，开始初始化路由系统')
    console.log('当前路由数量:', currentRoutes.length)
    console.log('当前路由列表:')
    currentRoutes.forEach(route => {
      console.log(`  - ${route.path} (children: ${route.children?.length || 0})`)
    })
    
    try {
      await setupRoutes()
      const newRoutes = router.getRoutes()
      console.log('✅ 路由初始化完成，新的路由数量:', newRoutes.length)
      
      // 打印所有已注册的路由
      console.log('📋 已注册的路由列表:')
      newRoutes.forEach(route => {
        console.log(`  - ${route.path} (${route.name ? String(route.name) : '未命名'}) children:${route.children?.length || 0}`)
        if (route.children?.length) {
          route.children.forEach(child => {
            console.log(`    └─ ${child.path}`)
          })
        }
      })
      
      // 重新导航到目标路由
      console.log('🔄 重新导航到目标路由:', to.fullPath)
      next(to.fullPath)
      return
    } catch (error) {
      console.error('❌ 路由初始化失败:', error)
      
      // 分析错误类型，区分API错误和组件加载错误
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log('🔍 路由初始化失败详细分析:', {
        errorType: typeof error,
        errorMessage: errorMessage,
        errorStack: error instanceof Error ? error.stack : 'N/A',
        isRoleIdError: errorMessage?.includes('角色ID') || errorMessage?.includes('roleId'),
        isComponentError: errorMessage?.includes('组件') || errorMessage?.includes('component'),
        currentPath: to.path,
        fromPath: from.path,
        routerConfig: ROUTER_CONFIG
      })
      
      if (errorMessage?.includes('角色ID') || errorMessage?.includes('roleId')) {
        console.log('🔄 检测到角色权限问题，尝试跳转到默认页面')
        console.log('🚨 角色权限问题重定向原因: 缺少roleId或角色权限验证失败')
        next('/viewer-fullscreen')
        return
      } else if (errorMessage?.includes('组件') || errorMessage?.includes('component')) {
        console.log('🔄 检测到组件加载问题，但路由系统应该正常工作')
        console.log('🚨 组件问题处理: 继续使用动态路由，由404页面处理组件错误')
        // 组件问题不应该导致整个路由系统失败，继续正常导航
        next()
        return
      } else {
        console.error('🚨 路由初始化完全失败，可能需要重新登录')
        console.log('🚨 强制重新登录的原因:', {
          reason: '路由初始化完全失败',
          errorMessage: errorMessage,
          willClearStorage: true,
          targetAfterClear: '/login'
        })
        // 清理登录状态，强制用户重新登录
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('authToken')
        next('/login')
        return
      }
    }
  }
  
  // 检查目标路由是否存在
  const targetRoute = router.resolve(to.path)
  console.log('🎯 目标路由解析结果:', {
    path: targetRoute.path,
    matched: targetRoute.matched.length,
    name: targetRoute.name
  })
  
  // 检查路由是否匹配到有效组件
  if (targetRoute.matched.length === 0) {
    console.log('⚠️ 路由未匹配到任何组件，路径可能不存在:', to.path)
    console.log('🚨 路由匹配失败详细分析:', {
      targetPath: to.path,
      resolvedPath: targetRoute.path,
      matchedLength: targetRoute.matched.length,
      routeName: targetRoute.name,
      totalRegisteredRoutes: router.getRoutes().length,
      fromPath: from.path,
      isMainRoute: to.path.startsWith('/main/'),
      routerMode: ROUTER_CONFIG.mode
    })
    
    console.log('可用路由列表:')
    const allRoutes = router.getRoutes()
    allRoutes.forEach(route => {
      console.log(`  - ${route.path}`)
      if (route.children?.length) {
        route.children.forEach(child => {
          const fullChildPath = route.path === '/' ? `/${child.path}` : `${route.path}/${child.path}`
          console.log(`    └─ ${fullChildPath}`)
        })
      }
    })
    
    // 智能回退逻辑 - 优化404处理
    if (to.path.startsWith('/main/')) {
      console.log('🔄 主应用路由不存在，检查是否为组件加载失败')
      // 如果是组件路径问题，让路由继续，由动态路由的404组件处理
      if (to.matched.length > 0) {
        console.log('📄 路由匹配成功但组件可能加载失败，继续执行以显示404页面')
        next()
      } else {
        console.log('🚨 主应用路由重定向原因: 目标路径不存在于已注册的路由中')
        next('/main/dashboard')
      }
    } else {
      console.log('🔄 未知路由，跳转到默认页面')
      console.log('🚨 默认页面重定向原因: 路由路径完全无法匹配')
      next('/viewer-fullscreen')
    }
    return
  }
  
  // 已登录，正常跳转
  console.log('✅ 已登录，路由有效，正常跳转')
  next()
})

// 导出路由实例
export default router

// 导出路由设置函数供外部调用
export { setupRoutes }
