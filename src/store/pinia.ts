import { defineStore } from 'pinia'
import { queryMenuTree } from '@/api/menu'

export const useStore = defineStore('piniaStore', {
    
    state: () => {
        return {
            viewer: null,
            timeMachine : null as number | null, // 修改为number类型，用于浏览器环境的timer ID
            isLoggedIn: localStorage.getItem('isLoggedIn') === 'true' || false, // 从localStorage恢复登录状态
            userInfo: {
                username: localStorage.getItem('username') || '', // 从localStorage恢复用户名
                loginTime: localStorage.getItem('loginTime') ? new Date(localStorage.getItem('loginTime')!) : null // 从localStorage恢复登录时间
            },
            activePanel: 'mainViewer', // 新增activePanel状态
            token: localStorage.getItem('authToken') || '', // 新增 token 状态，并从 localStorage 初始化
            roleId: localStorage.getItem('roleId') || '', // 从localStorage恢复roleId
            // 新增选中的水库节点状态
            selectedDamNode: null as any, // 存储选中的水库节点信息
            // 新增设备类型过滤状态
            deviceTypeFilter: '', // 存储当前选中的设备类型过滤条件
            // 新增权限相关状态
            userPermissions: JSON.parse(localStorage.getItem('userPermissions') || '[]') as string[] // 从localStorage恢复用户权限列表
        }
    },
    actions: {
        // 用户登录
        login(username: string) { // 为username添加类型
            this.isLoggedIn = true;
            this.userInfo.username = username;
            this.userInfo.loginTime = new Date();
            
            // 持久化存储登录状态
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', this.userInfo.loginTime.toISOString());
            // 注意：token 的设置应该在登录API成功后调用 setToken
        },
        
        // 用户登出
        logout() {
            this.isLoggedIn = false;
            this.userInfo.username = '';
            this.userInfo.loginTime = null;
            this.clearToken(); // 登出时清除 token
            this.clearRoleId(); // 登出时清除 roleId
            this.clearUserPermissions(); // 登出时清除用户权限
            
            // 清除持久化存储的登录状态
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('loginTime');
        },
        
        setToken(newToken: string) { // 新增 setToken action
            this.token = newToken;
            localStorage.setItem('authToken', newToken);
        },

        clearToken() { // 新增 clearToken action
            this.token = '';
            localStorage.removeItem('authToken');
        },

        setRoleId(roleId: string) { // 新增 setRoleId action
            this.roleId = roleId;
            localStorage.setItem('roleId', roleId); // 存储到localStorage
        },

        clearRoleId() { // 新增 clearRoleId action
            this.roleId = '';
            // 清除localStorage中可能存在的roleId
            localStorage.removeItem('roleId');
        },
        
        getViewer() {
            if (this.viewer != null) {
              console.log(this.viewer);
              if (this.timeMachine !== null) {
                clearInterval(this.timeMachine);
              }
              this.timeMachine = null;
              return new Promise((resolve=>resolve(this.viewer)));
            } else {
              if (this.timeMachine == null) {
                // 如果timeMachine为null则创建新的Promise对象
                return new Promise((resolve, reject) => {
                  this.timeMachine = window.setInterval(() => {
                    if (this.viewer != null) {
                      console.log(this.viewer,"我是定时器中的viewer");
                      if (this.timeMachine !== null) {
                        clearInterval(this.timeMachine);
                      }
                      this.timeMachine = null;
                      resolve(this.viewer);
                    }
                    console.log('waiting...');
                  }, 50);
                });
              }
            }
          },

        setActivePanel(panelName: string) { // 新增setActivePanel action
            this.activePanel = panelName;
        },

        // 新增设置选中水库节点的方法
        setSelectedDamNode(nodeData: any) {
            this.selectedDamNode = nodeData;
            console.log('Store: 选中节点已更新', nodeData);
        },

        // 清除选中的水库节点
        clearSelectedDamNode() {
            this.selectedDamNode = null;
        },

        // 根据水库ID设置选中节点（用于跨页面场景）
        setSelectedDamNodeById(reservoirId: string, reservoirName?: string) {
            const nodeData = {
                id: reservoirId,
                reservoirName: reservoirName || '未知水库',
                label: reservoirName || '未知水库'
            };
            this.setSelectedDamNode(nodeData);
            console.log('Store: 根据ID设置选中节点', nodeData);
        },

        // 新增设置设备类型过滤的方法
        setDeviceTypeFilter(deviceType: string) {
            this.deviceTypeFilter = deviceType;
            console.log('Store: 设备类型过滤已更新', deviceType);
        },

        // 扁平化菜单树，提取所有权限点
        flattenMenuPermissions(menuTree: any[]): string[] {
            const permissions: string[] = [];
            
            function traverse(menus: any[]) {
                if (!Array.isArray(menus)) return;
                
                menus.forEach(menu => {
                    // 如果是功能点(F)且有权限字符串，则添加到权限列表
                    if (menu.menuType === 'F' && menu.permission && menu.status === 'T') {
                        permissions.push(menu.permission);
                    }
                    
                    // 递归处理子菜单
                    if (menu.children && menu.children.length > 0) {
                        traverse(menu.children);
                    }
                });
            }
            
            traverse(menuTree);
            return permissions;
        },

        // 获取并设置用户权限
        async loadUserPermissions() {
            try {
                // 确保roleId存在
                if (!this.roleId) {
                    console.warn('roleId未设置，无法获取权限数据');
                    return [];
                }
                
                // 调用接口获取菜单树，传递roleId参数
                const menuData = await queryMenuTree({
                    key: '',
                    menuType: '',
                    status: 'T',
                    roleId: this.roleId
                });
                
                if (menuData && Array.isArray(menuData)) {
                    // 提取权限点
                    const permissions = this.flattenMenuPermissions(menuData);
                    
                    // 更新状态和localStorage
                    this.userPermissions = permissions;
                    localStorage.setItem('userPermissions', JSON.stringify(permissions));
                    
                    console.log('用户权限加载成功:', permissions);
                    return permissions;
                }
                
                return [];
            } catch (error) {
                console.error('获取权限失败:', error);
                return [];
            }
        },

        // 检查用户是否有指定权限
        hasPermission(permission: string | string[]): boolean {
            if (!this.userPermissions || this.userPermissions.length === 0) {
                return false;
            }
            
            if (Array.isArray(permission)) {
                // 数组形式：满足其中任一权限即可
                return permission.some(p => this.userPermissions.includes(p));
            } else {
                // 字符串形式：检查单个权限
                return this.userPermissions.includes(permission);
            }
        },

        // 清除用户权限
        clearUserPermissions() {
            this.userPermissions = [];
            localStorage.removeItem('userPermissions');
        }
    }
})