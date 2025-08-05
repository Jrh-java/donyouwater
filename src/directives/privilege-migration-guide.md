# 权限指令移植文档

## 概述

本文档详细说明了如何将 `privilege.ts` 权限指令移植到其他项目中。该指令用于根据用户权限控制DOM元素的显示/隐藏。

## 核心文件

### 1. 权限指令文件
- **文件路径**: `src/directives/privilege.ts`
- **功能**: 权限控制指令，根据用户权限决定是否显示DOM元素

### 2. 权限插件文件
- **文件路径**: `src/plugins/privilege-plugin.ts`
- **功能**: 提供全局权限检查方法 `$privilege`

## 依赖项分析

### 必需的NPM包依赖

```json
{
  "dependencies": {
    "vue": "^3.4.27",
    "pinia": "^2.1.7",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

### 核心依赖说明

1. **Vue 3**: 指令系统基础
2. **Pinia**: 状态管理，用于用户信息存储
3. **Lodash**: 工具库，主要使用 `_.some()` 方法
4. **TypeScript**: 类型支持

## 需要移植的代码模块

### 1. 用户存储模块 (UserStore)

**注意**: 原项目中的 `useUserStore` 实现文件缺失，需要根据使用情况重新实现。

**必需的状态和方法**:

```typescript
// src/store/modules/system/user.ts
import { defineStore } from 'pinia';

export interface UserState {
  // 是否为超级管理员
  administratorFlag: boolean;
  // 用户权限点列表
  pointsList: Array<{webPerms: string}>;
  // 其他用户信息...
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    administratorFlag: false,
    pointsList: [],
    // 其他状态...
  }),
  
  getters: {
    // 获取权限点列表
    getPointList: (state) => state.pointsList,
  },
  
  actions: {
    // 设置用户登录信息
    setUserLoginInfo(loginInfo: any) {
      this.administratorFlag = loginInfo.administratorFlag;
      this.pointsList = loginInfo.pointsList || [];
      // 设置其他用户信息...
    },
    
    // 登出
    logout() {
      this.administratorFlag = false;
      this.pointsList = [];
      // 清除其他用户信息...
    }
  }
});
```

### 2. 权限指令实现

```typescript
// src/directives/privilege.ts
import { useUserStore } from '/@/store/modules/system/user';
import _ from 'lodash';

export function privilegeDirective(el: { parentNode: { removeChild: (arg0: any) => void } }, binding: DirectiveBinding<any>) {
  // 超级管理员
  if (useUserStore().administratorFlag) {
    return true;
  }
  // 获取功能点权限
  let userPointsList = useUserStore().getPointList;
  if (!userPointsList) {
    return false;
  }
  // 如果没有权限，删除节点
  if (!_.some(userPointsList, ['webPerms', binding.value])) {
    el.parentNode.removeChild(el);
  }
  return true;
}
```

### 3. 权限插件实现

```typescript
// src/plugins/privilege-plugin.ts
import { useUserStore } from '/@/store/modules/system/user';
import { App } from 'vue';
import _ from 'lodash';

const privilege = (value: string) => {
  // 超级管理员
  if (useUserStore().administratorFlag) {
    return true;
  }
  // 获取功能点权限
  let userPointsList = useUserStore().getPointList;
  if (!userPointsList) {
    return false;
  }
  return _.some(userPointsList, ['webPerms', value]);
};

export default {
  install: (app: App): void => {
    app.config.globalProperties.$privilege = privilege;
  },
};
```

## 项目配置

### 1. 路径别名配置

确保项目中配置了 `/@/` 路径别名，通常在 `vite.config.ts` 或 `webpack.config.js` 中:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '/@': path.resolve(__dirname, 'src'),
    },
  },
});
```

### 2. TypeScript 配置

确保 `tsconfig.json` 中包含路径映射:

```json
{
  "compilerOptions": {
    "paths": {
      "/@/*": ["src/*"]
    }
  }
}
```

### 3. Vue 类型声明

创建或更新 `src/shims-vue.d.ts`:

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 全局属性类型声明
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $privilege: (value: string) => boolean;
  }
}
```

## 主应用集成

### 1. 在 main.ts 中注册

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { privilegeDirective } from '/@/directives/privilege';
import privilegePlugin from '/@/plugins/privilege-plugin';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(privilegePlugin);

// 注册权限指令
app.directive('privilege', {
  mounted(el, binding) {
    privilegeDirective(el, binding);
  },
});

app.mount('#app');
```

## 使用方法

### 1. 指令方式

```vue
<template>
  <!-- 只有拥有 'user:add' 权限的用户才能看到此按钮 -->
  <button v-privilege="'user:add'">添加用户</button>
  
  <!-- 只有拥有 'user:delete' 权限的用户才能看到此按钮 -->
  <a-button v-privilege="'user:delete'">删除</a-button>
</template>
```

### 2. 编程方式

```vue
<template>
  <div>
    <button v-if="hasAddPermission">添加</button>
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';

const instance = getCurrentInstance();
const hasAddPermission = instance?.proxy?.$privilege('user:add');
</script>
```

## 权限数据格式

权限点数据应该符合以下格式:

```typescript
interface PermissionPoint {
  webPerms: string; // 权限标识，如 'user:add', 'user:delete'
  // 其他权限相关字段...
}

// 示例数据
const pointsList = [
  { webPerms: 'user:add' },
  { webPerms: 'user:edit' },
  { webPerms: 'user:delete' },
  { webPerms: 'role:manage' }
];
```

## 注意事项

1. **安全性**: 前端权限控制仅用于UI展示，真正的权限验证必须在后端进行
2. **性能**: 权限检查会在每次组件渲染时执行，确保权限数据获取高效
3. **兼容性**: 确保 Vue 3 和 Pinia 版本兼容
4. **错误处理**: 建议在权限检查失败时有适当的错误处理机制

## 可选优化

### 1. 权限缓存

```typescript
// 可以添加权限缓存机制提高性能
const permissionCache = new Map<string, boolean>();

const privilege = (value: string) => {
  if (permissionCache.has(value)) {
    return permissionCache.get(value);
  }
  
  const result = checkPermission(value);
  permissionCache.set(value, result);
  return result;
};
```

### 2. 权限组合

```typescript
// 支持多权限组合检查
const privilege = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.some(perm => checkSinglePermission(perm));
  }
  return checkSinglePermission(value);
};
```

## 移植检查清单

- [ ] 安装必需的NPM依赖
- [ ] 创建用户存储模块 (UserStore)
- [ ] 复制权限指令文件
- [ ] 复制权限插件文件
- [ ] 配置路径别名
- [ ] 更新TypeScript类型声明
- [ ] 在主应用中注册指令和插件
- [ ] 测试权限控制功能
- [ ] 验证超级管理员逻辑
- [ ] 确认权限数据格式匹配

## 常见问题

### Q: 指令不生效怎么办？
A: 检查用户存储模块是否正确实现，权限数据格式是否正确。

### Q: TypeScript 报错怎么解决？
A: 确保类型声明文件正确配置，特别是 DirectiveBinding 类型。

### Q: 如何调试权限问题？
A: 在指令中添加 console.log 输出权限检查过程，确认数据流向。

---

**移植完成后，建议进行完整的功能测试，确保权限控制在各种场景下都能正常工作。**