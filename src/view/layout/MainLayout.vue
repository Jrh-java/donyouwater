<template>
  <div class="main-layout">
    <!-- 左侧菜单 -->
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="logo-container">
        <img src="../../assets/reservoir-logo.svg" alt="Logo" class="logo" />
        <h1 class="title" v-show="!isCollapsed">闽江流域东游段智慧管理平台</h1>
      </div>
      <div class="toggle-btn" @click="toggleCollapse">
        <i class="toggle-icon">{{ isCollapsed ? '→' : '←' }}</i>
      </div>
      <div class="menu-container">
        <template v-for="(item, index) in menuItems" :key="index">
          <!-- 父菜单项 -->
          <div 
            class="menu-item"
            :class="{ 'active': activeMenu === item.path && !item.children, 'has-children': item.children }"
            @click="handleMenuClick(item)"
          >
            <el-icon class="menu-icon" v-if="item.icon">
              <component :is="getIconComponent(item.icon)" />
            </el-icon>
            <span class="menu-text" v-show="!isCollapsed">{{ item.title }}</span>
            <span class="arrow" v-if="item.children && !isCollapsed">▼</span>
          </div>
          
          <!-- 子菜单项 -->
          <div class="submenu" v-if="item.children && expandedMenu === item.path">
            <div 
              v-for="(subItem, subIndex) in item.children" 
              :key="subIndex"
              class="submenu-item"
              :class="{ 'active': activeMenu === subItem.path }"
              @click.stop="handleSubMenuClick(subItem)"
            >
              <div class="submenu-text" v-show="!isCollapsed">{{ subItem.title }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="content-container">
      <!-- 顶部导航栏 -->
      <div class="header">
        <div class="breadcrumb">
          {{ currentMenuTitle }}
        </div>
        <div class="user-info">
          <div class="fullscreen-btn" @click="toggleFullScreen">
            <i class="fullscreen-icon">{{ isFullScreen ? '🔍' : '🔎' }}</i>
          </div>
          <div class="avatar-dropdown">
            <div class="avatar" @mouseenter="showDropdown = true" @mouseleave="hideDropdownDelayed">
              <span class="avatar-text">{{ userInfo.username.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="dropdown-menu" v-show="showDropdown" @mouseenter="clearHideTimeout" @mouseleave="hideDropdownDelayed">
              <div class="dropdown-item" @click="handleUserAction('profile')">
                <i class="dropdown-icon">👤</i>
                <span>个人信息</span>
              </div>
              <div class="dropdown-item" @click="handleUserAction('password')">
                <i class="dropdown-icon">🔑</i>
                <span>修改密码</span>
              </div>
              <div class="dropdown-item mobile-download" @mouseenter="showQRCode = true" @mouseleave="showQRCode = false">
                <i class="dropdown-icon">📱</i>
                <span>下载移动端</span>
                <div class="qr-code-popup" v-show="showQRCode">
                  <img src="/QRcode.png" alt="移动端下载二维码" class="qr-code-image" />
                </div>
              </div>
              <div class="dropdown-item" @click="handleUserAction('logout')">
                <i class="dropdown-icon">🚪</i>
                <span>退出系统</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" v-if="keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!keepAlive" />
        </router-view>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog
      v-model:visible="showChangePasswordDialog"
   
      @success="handlePasswordChangeSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store/pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as menuApi from '@/api/menu'
// import { Menu } from '@/api/menu'
import { ROUTER_CONFIG } from '@/config/router.config'
  import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 用户信息
const userInfo = computed(() => store.userInfo)

// 动态菜单项
const menuItems = ref([])
const menuLoading = ref(false)

// 静态菜单项配置 - 作为备选方案
const STATIC_MENU_ITEMS = [
  { title: '一张图', path: '/viewer-fullscreen', icon: 'Monitor' },
  { title: '首页', path: '/main/dashboard', icon: 'HomeFilled' },
  { title: '库闸管理', path: '/main/gate', icon: 'Lock', children: [
    { title: '库闸总览', path: '/main/gate/overview' },
    { title: '环境监测', path: '/main/gate/environment' },
    { title: '应力监测', path: '/main/gate/stress' },
    { title: '位移监测', path: '/main/gate/displacement' },
    { title: '渗压监测', path: '/main/gate/seepage' },
    { title: '渗流监测', path: '/main/gate/flow' },
    { title: '闸门管理', path: '/main/gate/control' }
  ] },
  { title: '设备管理', path: '/main/device', icon: 'Setting' },
  { title: '视频监控', path: '/main/monitor', icon: 'VideoCamera' },
  { title: '风险预警', path: '/main/alert', icon: 'Warning', children: [
    { title: '异常预警', path: '/main/alert/exception' },
    { title: '告警规则配置', path: '/main/alert/rules' }
  ] },
  { title: '巡查管理', path: '/main/inspectionManagement', icon: 'MapLocation' },
  { title: '任务管理', path: '/main/task', icon: 'DocumentCopy', children: [
    { title: '任务列表', path: '/main/task/list' },
    { title: '任务看板', path: '/main/task/board-month' },
    { title: '调度预案', path: '/main/task/schedule' }
  ] },
  { title: '系统管理', path: '/main/system', icon: 'Management', children: [
    { title: '部门管理', path: '/main/system/department' },
    { title: '员工管理', path: '/main/system/employee' },
    { title: '角色管理', path: '/main/system/role' },
    { title: '公告管理', path: '/main/system/announcement' },
    { title: '菜单管理', path: '/main/system/menu' },
    { title: '操作日志', path: '/main/system/operation-log' }
  ]}
]

// 当前激活的菜单
const activeMenu = ref(route.path)
const currentMenuTitle = ref(route.meta.title || '首页')

// 组件状态
const isCollapsed = ref(false)
const showDropdown = ref(false)
const isFullScreen = ref(false)
const keepAlive = ref(false)

// 用于处理hover延迟的变量
let hideTimeout = null

// 当前展开的菜单项
const expandedMenu = ref('')

// 修改密码弹窗状态
const showChangePasswordDialog = ref(false)

// 二维码显示状态
const showQRCode = ref(false)

// 获取图标组件
function getIconComponent(iconName) {
  return ElementPlusIconsVue[iconName] || ElementPlusIconsVue['Document']
}

// 生成菜单路径
function generateMenuPath(menu, parentPath = '') {
  // 特殊处理：如果是一张图，返回根路径
  if (menu.id === '1') {
    return '/viewer-fullscreen'
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
function getPathSegment(menuName) {
  const pathMap = {
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
    '巡查管理': 'inspection',
    '任务管理': 'task',
    '任务列表': 'list',
    '任务看板': 'board-month',
    '调度预案': 'schedule',
    '系统管理': 'system',
    '部门管理': 'department',
    '员工管理': 'employee',
    '角色管理': 'role',
    '公告管理': 'announcement',
    '菜单管理': 'menu',
    '操作日志': 'operation-log'
  }
  
  return pathMap[menuName] || menuName.toLowerCase()
}

// 转换API菜单数据为组件菜单格式
function transformMenuData(menuData) {
  return menuData.map(menu => {
    // 只处理启用的菜单，忽略按钮类型
    if (menu.status !== 'T' || menu.menuType === 'F') {
      console.log(`菜单转换：跳过按钮类型菜单 "${menu.menuName}"`)
      return null
    }
    
    const item = {
      title: menu.menuName,
      path: menu.url || generateMenuPath(menu), // 优先使用url字段，如果没有则生成路径
      icon: menu.icon
    }
    
    // 处理子菜单 - 过滤掉按钮类型
    if (menu.children && menu.children.length > 0) {
      const children = transformMenuData(menu.children).filter(Boolean)
      if (children.length > 0) {
        item.children = children
      }
    }
    
    return item
  }).filter(Boolean)
}

// 获取动态菜单数据
async function loadMenuItems() {
  try {
    menuLoading.value = true
    console.log('开始获取菜单数据...')
    
    // 获取当前用户的roleId
    const store = useStore()
    
    if (ROUTER_CONFIG.mode === 'dynamic') {
      // 尝试获取动态菜单
      const response = await menuApi.queryMenuTree({
        key: '',
        menuType: '',
        status: 'T', // 只获取启用的菜单
        roleId: store.roleId || '' // 添加roleId参数
      })
      
      // 处理返回数据，兼容不同的数据结构
      const menuData = response?.data || response || []
      
      if (menuData && menuData.length > 0) {
        console.log('动态菜单数据获取成功:', menuData)
        menuItems.value = transformMenuData(menuData)
        console.log('菜单转换完成:', menuItems.value)
        return
      }
    }
    
    // 使用静态菜单
    console.log('使用静态菜单数据')
    menuItems.value = STATIC_MENU_ITEMS
    
  } catch (error) {
    console.error('获取菜单数据失败:', error)
    // 回退到静态菜单
    menuItems.value = STATIC_MENU_ITEMS
  } finally {
    menuLoading.value = false
  }
}

// 菜单折叠状态控制
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 全屏状态控制
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullScreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullScreen.value = false
    }
  }
}

// hover延迟隐藏下拉菜单
const hideDropdownDelayed = () => {
  hideTimeout = setTimeout(() => {
    showDropdown.value = false
  }, 200) // 200ms延迟
}

// 清除隐藏超时
const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

// 处理用户操作
const handleUserAction = (action) => {
  showDropdown.value = false
  
  if (action === 'logout') {
    store.logout()
    router.push('/login')
  } else if (action === 'profile') {
    // 处理个人信息
    console.log('查看个人信息')
  } else if (action === 'password') {
    // 显示修改密码弹窗
    showChangePasswordDialog.value = true
  }
}

// 处理修改密码成功
const handlePasswordChangeSuccess = () => {
  console.log('密码修改成功')
}

// 处理菜单点击
const handleMenuClick = (item) => {
  console.log('handleMenuClick 被触发:', item)
  if (item.children) {
    // 如果点击的是当前已展开的菜单，则关闭它
    if (expandedMenu.value === item.path) {
      expandedMenu.value = ''
    } else {
      // 否则展开新的菜单
      expandedMenu.value = item.path
    }
    return
  }
  activeMenu.value = item.path
  currentMenuTitle.value = item.title
  console.log('准备路由跳转到:', item.path)
  router.push(item.path)
}

// 处理子菜单点击
const handleSubMenuClick = (subItem) => {
  console.log('handleSubMenuClick 被触发:', subItem)
  activeMenu.value = subItem.path
  currentMenuTitle.value = subItem.title
  console.log('准备路由跳转到:', subItem.path)
  router.push(subItem.path)
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  console.log('路由发生变化，新路径:', newPath)
  console.log('当前菜单项:', menuItems.value)
  
  // 如果菜单还没加载完成，不处理路由变化
  if (!menuItems.value.length) {
    console.log('菜单未加载完成，跳过路由处理')
    return
  }
  
  let found = false
  for (const item of menuItems.value) {
    if (item.children) {
      for (const subItem of item.children) {
        if (newPath === subItem.path) {
          activeMenu.value = subItem.path
          currentMenuTitle.value = subItem.title
          expandedMenu.value = item.path
          found = true
          break
        }
      }
      if (found) break
    } else if (newPath === item.path) {
      activeMenu.value = item.path
      currentMenuTitle.value = item.title
      expandedMenu.value = ''
      found = true
      break
    }
  }
  if (!found) {
    console.log('未找到匹配的菜单项')
    // 不要清空当前选中的菜单，保持用户的选择
    // activeMenu.value = ''
    // currentMenuTitle.value = ''
    // expandedMenu.value = ''
  }
}, { immediate: true })

// 组件挂载时加载菜单数据
onMounted(async () => {
  console.log('MainLayout 组件挂载')
  await loadMenuItems()
  console.log('菜单加载完成:', menuItems.value)
  
  // 只有在没有当前路由时才默认选中第一个菜单
  if (menuItems.value.length > 0 && !activeMenu.value && route.path === '/') {
    console.log('准备选中第一个菜单项:', menuItems.value[0])
    handleMenuClick(menuItems.value[0])
  }
})
</script>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #f0f2f5;
}

.sidebar {
  width: 300px;
  background-color: #001529;
  color: white;
  transition: all 0.3s;
  position: relative;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

  &.collapsed {
    width: 80px;
  }
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: #002140;
  overflow: hidden;

  .logo {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .title {
    margin-left: 12px;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.3s;
    color: #fff;
  }
}

.toggle-btn {
  position: absolute;
  top: 72px;
  right: -12px;
  width: 24px;
  height: 24px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;

  .toggle-icon {
    font-size: 12px;
    color: #001529;
  }
}

.menu-container {
  padding: 16px 0;
  overflow-y: auto;
  height: calc(100% - 64px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
}

.menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.65);
  position: relative;

  &:hover {
    color: #fff;
    background-color: #1890ff;
  }

  &.active {
    color: #fff;
    background-color: #1890ff;
  }
  
  &.has-children {
    position: relative;
  }

  .menu-icon {
    font-size: 18px;
    margin-right: 10px;
    width: 24px;
    text-align: center;
    color: inherit;
  }

  .menu-text {
    white-space: nowrap;
    overflow: hidden;
    opacity: 1;
    transition: opacity 0.3s;
    // flex: 1;
  }
  
  .arrow {
    font-size: 12px;
    transition: transform 0.3s;
  }
}

.submenu {
  background-color: rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s;
}

.submenu-item {
  height: 40px;
  line-height: 40px;
    justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.65);
  
  &:hover {
    color: #fff;
    background-color: rgba(24, 144, 255, 0.7);
  }
  
  &.active {
    color: #fff;
    background-color: rgba(24, 144, 255, 0.7);
  }
  
  .submenu-text {
    white-space: nowrap;
    overflow: hidden;
    text-align: left;
    min-width: 100px;
  }
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  z-index: 999;
}

.breadcrumb {
  font-size: 16px;
  color: #001529;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;

  .fullscreen-btn {
    margin-right: 24px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }

    .fullscreen-icon {
      font-size: 20px;
      color: #666;
    }
  }
}

.avatar-dropdown {
  position: relative;

  .avatar {
    width: 36px;
    height: 36px;
    background-color: #1890ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #40a9ff;
    }

    .avatar-text {
      color: white;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    min-width: 160px;
    padding: 4px 0;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.2s ease, transform 0.2s ease;

    .dropdown-item {
      padding: 10px 24px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      color: rgba(0, 0, 0, 0.85);
      position: relative;

      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
        color: #1890ff;
      }

      .dropdown-icon {
        margin-right: 12px;
        font-size: 16px;
      }

      &.mobile-download {
        cursor: default;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.025);
          color: #1890ff;
        }
      }
    }

    .qr-code-popup {
      position: absolute;
      left: -120px;
      top: 50%;
      transform: translateY(-50%);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 12px;
      z-index: 9999;
      
      .qr-code-image {
        width: 100px;
        height: 100px;
        display: block;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 10px;
  overflow: auto;
  background-color: #f0f2f5;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}

.collapsed {
  .title,
  .menu-text {
    opacity: 0;
    display: none;
  }

  .menu-item {
    padding: 0;
    justify-content: center;

    .menu-icon {
      margin: 0;
    }
  }
}
</style>