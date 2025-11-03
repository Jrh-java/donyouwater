# 🛠️ 生产环境部署问题修复报告

## ❌ 修复的问题

### 1. Billboard图片资源在生产环境不显示

**问题描述**：
```javascript
// 错误的路径（开发环境可用，生产环境失败）
image: '/src/assets/viewer/billboard/height-bg-blue.png'
```

**原因分析**：
- 开发环境中Vite可以处理`/src/`路径
- 生产环境构建后，`/src/`路径不存在

**解决方案**：
1. 将billboard图片复制到`public/assets/viewer/billboard/`目录
2. 修改代码使用public目录路径：
```javascript
image: '/assets/viewer/billboard/height-bg-blue.png'
```

### 2. 动态路由组件加载失败

**问题描述**：
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
组件加载失败: /viewer/layout.vue -> ../view/viewer/layout.vue
```

**原因分析**：
- 使用字符串路径动态导入在生产环境中失败
- Vite构建后模块路径结构发生变化

**解决方案**：
创建预定义组件映射表，避免字符串路径动态导入：
```typescript
const COMPONENT_MAP: Record<string, () => Promise<any>> = {
  '/viewer/layout.vue': () => import('../view/viewer/layout.vue'),
  '/dashboard/dashboard.vue': () => import('../view/dashboard/dashboard.vue'),
  // ... 其他组件映射
}

function loadComponent(componentPath: string) {
  const mappingPath = `/${cleanPath.replace('view/', '')}`
  const componentLoader = COMPONENT_MAP[mappingPath]
  return componentLoader || COMPONENT_MAP['/404.vue']
}
```

### 3. 按钮类型菜单导致路由错误

**问题描述**：
添加按钮类型菜单时，系统尝试为其创建路由和加载组件，导致错误。

**解决方案**：
1. **动态路由过滤**：
```typescript
// 在transformMenuToRoute中过滤按钮类型
if (menu.status !== 'T' || menu.menuType === 'F') {
  console.log(`跳过菜单: ${menu.menuName} (类型: ${menu.menuType})`)
  return null
}
```

2. **菜单展示过滤**：
```typescript
// 在MainLayout菜单转换中过滤按钮类型
function transformMenuData(menuData) {
  return menuData.filter(menu => {
    if (menu.menuType === 'F') return false // 过滤按钮类型
    return true
  })
}
```

3. **表单验证优化**：
```typescript
// 按钮类型不需要路由地址和组件地址
url: [{
  required: false,
  validator: (rule, value, callback) => {
    if (form.menuType === MENU_TYPE_ENUM.POINTS.value) {
      callback() // 按钮类型跳过验证
      return
    }
    // 目录和菜单类型需要验证
    if (!value) {
      callback(new Error('路由地址不能为空'))
    }
  }
}]
```

### 4. Nginx配置优化

**新增配置**：
```nginx
server {
    listen       8888;
    server_name  localhost;
    root         html/dist;
    index        index.html index.htm;

    # 设置正确的MIME类型
    location ~* \.(js|mjs)$ {
        add_header 'Content-Type' 'application/javascript; charset=utf-8';
        try_files $uri =404;
    }

    # API代理
    location /authApi/ {
        proxy_pass http://220.250.41.136:9050/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## ✅ 修复结果

### 1. 资源文件正确加载
- ✅ Billboard图片在生产环境正常显示
- ✅ 所有静态资源路径正确

### 2. 动态路由正常工作
- ✅ 组件加载不再出现MIME类型错误
- ✅ 路由跳转正常
- ✅ 404页面作为降级方案

### 3. 菜单系统稳定
- ✅ 按钮类型菜单不会影响路由系统
- ✅ 菜单展示正确过滤
- ✅ 表单验证适配不同菜单类型

### 4. 生产环境部署成功
- ✅ 构建无错误
- ✅ Nginx配置正确
- ✅ 应用可正常访问

## 🚀 部署说明

### 访问地址
```
http://localhost:8888
```

### 构建命令
```bash
npm run build
```

### 部署目录
```
/opt/homebrew/var/www/html/dist/
```

## 📝 注意事项

1. **静态资源**：所有需要在生产环境使用的静态资源应放在`public`目录下
2. **动态导入**：避免使用字符串拼接的动态导入，使用预定义映射表
3. **菜单类型**：按钮类型菜单（menuType: 'F'）仅用于权限控制，不参与路由
4. **错误处理**：所有组件加载失败都会降级到404页面

## 🔧 故障排查

如果遇到类似问题，请检查：

1. **控制台错误**：查看是否有MIME类型错误
2. **网络请求**：检查静态资源请求是否返回HTML而不是实际文件
3. **路由配置**：确认动态路由是否正确生成
4. **组件映射**：验证组件路径是否在COMPONENT_MAP中定义

---

*修复时间：2024年*
*修复人员：Assistant* 