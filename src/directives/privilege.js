/*
 * 权限
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-09-06 20:00:40
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */
import { useStore } from '@/store/pinia';
// 获取用户权限列表（从Pinia store中获取）
function getUserPermissions() {
  try {
    // 动态导入useStore以避免循环依赖

    const store = useStore();
    
    return store.userPermissions || [];
  } catch (error) {
    console.error('获取权限失败:', error);
    return [];
  }
}



export function privilegeDirective(el, binding) {
  // 权限检查期间先隐藏元素，避免无权限元素闪现
  const originalDisplay = el.style.display;
  el.style.display = 'none';
  
  try {
    // 获取用户权限列表（同步获取）
    const userPermissions = getUserPermissions();
    
    if (!userPermissions || userPermissions.length === 0) {
      // 没有权限，移除元素
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      return false;
    }
    
    const requiredPermission = binding.value;
    
    // 支持字符串或数组形式的权限检查
    let hasPermission = false;
    
    if (Array.isArray(requiredPermission)) {
      // 数组形式：满足其中任一权限即可
      hasPermission = requiredPermission.some(permission => 
        userPermissions.includes(permission)
      );
    } else {
      // 字符串形式：检查单个权限
      hasPermission = userPermissions.includes(requiredPermission);
    }
    
    // 如果没有权限，移除节点
    if (!hasPermission) {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      return false;
    }
    
    // 有权限，恢复元素显示
    el.style.display = originalDisplay || '';
    return true;
  } catch (error) {
    console.error('权限检查失败:', error);
    // 出错时为安全起见，移除元素
    if (el && el.parentNode) {
      el.parentNode.removeChild(el);
    }
    return false;
  }
}

// 编程式权限检查函数
export function hasPermission(permission) {
  try {
    // 动态导入useStore以避免循环依赖
    const { useStore } = require('@/store/pinia');
    const store = useStore();
    
    return store.hasPermission(permission);
  } catch (error) {
    console.error('权限检查失败:', error);
    return false;
  }
}
