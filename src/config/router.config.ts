// 路由配置
export const ROUTER_CONFIG = {
  // 路由模式：'static' | 'dynamic'
  // 设置为 'static' 可强制使用静态路由进行调试
  mode: 'dynamic', // 默认使用动态路由
  
  // API配置
  api: {
    menuTreeUrl: '/authApi/reservoir/sys/sysMenu/menuTree',
    timeout: 5000 // 5秒超时
  },
  
  // 静态路由作为备选方案
  fallbackToStatic: true,
  
  // 默认路由
  defaultRoute: '/viewer-fullscreen',
  mainDefaultRoute: '/main/dashboard'
} 