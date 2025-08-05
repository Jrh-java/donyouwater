# Smart-Admin 系统组件依赖关系分析

## 1. 部门管理模块

### 1.1 部门列表组件 (department-list.vue)
- **依赖组件**：
  - DepartmentFormModal：部门表单模态框
- **依赖API**：
  - departmentApi：提供部门数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - lodash：JavaScript工具库

### 1.2 部门表单模态框 (department-form-modal.vue)
- **依赖组件**：
  - DepartmentTreeSelect：部门树选择组件
  - EmployeeSelect：员工选择组件
- **依赖API**：
  - departmentApi：提供部门数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获

## 2. 员工管理模块

### 2.1 员工主页 (index.vue)
- **依赖组件**：
  - DepartmentTree：部门树组件
  - EmployeeList：员工列表组件
- **依赖工具**：
  - lodash：JavaScript工具库

### 2.2 部门树组件 (department-tree/index.vue)
- **依赖API**：
  - departmentApi：提供部门数据查询
- **依赖工具**：
  - departmentEmitter：部门事件发射器
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

### 2.3 员工列表组件 (employee-list/index.vue)
- **依赖API**：
  - employeeApi：提供员工数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理

### 2.4 员工表单模态框 (employee-form-modal/index.vue)
- **依赖组件**：
  - DepartmentTreeSelect：部门树选择组件
  - SmartEnumSelect：枚举选择组件
  - PositionSelect：职位选择组件
- **依赖API**：
  - employeeApi：提供员工数据的CRUD操作
  - roleApi：提供角色数据查询
- **依赖常量**：
  - GENDER_ENUM：性别枚举
  - regular：正则表达式常量
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

## 3. 职位管理模块

### 3.1 职位列表组件 (position-list.vue)
- **依赖组件**：
  - PositionForm：职位表单组件
  - TableOperator：表格操作组件
- **依赖API**：
  - positionApi：提供职位数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
- **依赖常量**：
  - TABLE_ID_CONST：表格ID常量

### 3.2 职位表单组件 (position-form.vue)
- **依赖API**：
  - positionApi：提供职位数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

## 4. 角色管理模块

### 4.1 角色主页 (index.vue)
- **依赖组件**：
  - RoleList：角色列表组件
  - RoleSetting：角色设置组件

### 4.2 角色列表组件 (role-list/index.vue)
- **依赖组件**：
  - RoleFormModal：角色表单模态框
- **依赖API**：
  - roleApi：提供角色数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

### 4.3 角色设置组件 (role-setting/index.vue)
- **依赖组件**：
  - RoleTree：角色权限树组件
  - RoleDataScope：角色数据范围组件
  - RoleEmployeeList：角色员工列表组件

### 4.4 角色权限树组件 (role-tree/index.vue)
- **依赖组件**：
  - RoleTreeCheckbox：角色树复选框组件
- **依赖API**：
  - roleMenuApi：提供角色菜单数据的CRUD操作
- **依赖Store**：
  - useRoleStore：角色状态管理
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

### 4.5 角色树复选框组件 (role-tree-checkbox.vue)
- **依赖组件**：
  - RoleTreeMenu：角色树菜单组件
- **依赖Store**：
  - useRoleStore：角色状态管理

### 4.6 角色树菜单组件 (role-tree-menu.vue)
- **依赖组件**：
  - RoleTreePoint：角色树功能点组件
- **依赖Store**：
  - useRoleStore：角色状态管理
- **依赖常量**：
  - MENU_TYPE_ENUM：菜单类型枚举

### 4.7 角色数据范围组件 (role-data-scope/index.vue)
- **依赖API**：
  - roleApi：提供角色数据范围的CRUD操作
- **依赖工具**：
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

### 4.8 角色员工列表组件 (role-employee-list/index.vue)
- **依赖组件**：
  - EmployeeTableSelectModal：员工表格选择模态框
- **依赖API**：
  - roleApi：提供角色员工数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获
  - lodash：JavaScript工具库

### 4.9 角色表单模态框 (role-form-modal/index.vue)
- **依赖API**：
  - roleApi：提供角色数据的CRUD操作
- **依赖工具**：
  - SmartLoading：加载状态管理
  - smartSentry：错误捕获

## 5. 公共组件

### 5.1 部门树选择组件 (department-tree-select/index.vue)
- **依赖API**：
  - departmentApi：提供部门树数据查询
- **依赖工具**：
  - lodash：JavaScript工具库

### 5.2 员工选择组件 (employee-select/index.vue)
- **依赖API**：
  - employeeApi：提供员工数据查询
- **依赖工具**：
  - smartSentry：错误捕获

### 5.3 职位选择组件 (position-select/index.vue)
- **依赖API**：
  - positionApi：提供职位数据查询
- **依赖工具**：
  - smartSentry：错误捕获

### 5.4 员工表格选择模态框 (employee-table-select-modal/index.vue)
- **依赖组件**：
  - DepartmentTreeSelect：部门树选择组件
- **依赖API**：
  - employeeApi：提供员工数据查询
- **依赖常量**：
  - PAGE_SIZE, PAGE_SIZE_OPTIONS：分页常量
- **依赖工具**：
  - smartSentry：错误捕获

### 5.5 枚举选择组件 (smart-enum-select/index.vue)
- **依赖插件**：
  - smartEnumPlugin：枚举插件

## 6. 状态管理

### 6.1 角色状态管理 (role.js)
- **依赖工具**：
  - lodash：JavaScript工具库
  - pinia：状态管理库
- **主要功能**：
  - 管理角色权限树的选中状态
  - 提供选中/取消选中本级及子级的方法
  - 提供选中上级的方法

## 7. 组件依赖关系图

### 7.1 部门管理模块

```
department-list.vue
├── DepartmentFormModal (department-form-modal.vue)
│   ├── DepartmentTreeSelect (components/system/department-tree-select/index.vue)
│   │   └── departmentApi
│   ├── EmployeeSelect (components/system/employee-select/index.vue)
│   │   └── employeeApi
│   ├── departmentApi
│   ├── SmartLoading
│   └── smartSentry
├── departmentApi
├── SmartLoading
└── lodash
```

### 7.2 员工管理模块

```
employee/index.vue
├── DepartmentTree (components/department-tree/index.vue)
│   ├── departmentApi
│   ├── departmentEmitter
│   ├── smartSentry
│   └── lodash
├── EmployeeList (components/employee-list/index.vue)
│   ├── employeeApi
│   └── SmartLoading
└── lodash

employee-form-modal/index.vue
├── DepartmentTreeSelect
├── SmartEnumSelect
├── PositionSelect
├── employeeApi
├── roleApi
├── GENDER_ENUM
├── regular
├── SmartLoading
├── smartSentry
└── lodash
```

### 7.3 职位管理模块

```
position-list.vue
├── PositionForm (position-form.vue)
│   ├── positionApi
│   ├── SmartLoading
│   ├── smartSentry
│   └── lodash
├── TableOperator
├── positionApi
├── SmartLoading
└── TABLE_ID_CONST
```

### 7.4 角色管理模块

```
role/index.vue
├── RoleList (components/role-list/index.vue)
│   ├── RoleFormModal (components/role-form-modal/index.vue)
│   │   ├── roleApi
│   │   ├── SmartLoading
│   │   └── smartSentry
│   ├── roleApi
│   ├── SmartLoading
│   ├── smartSentry
│   └── lodash
└── RoleSetting (components/role-setting/index.vue)
    ├── RoleTree (components/role-tree/index.vue)
    │   ├── RoleTreeCheckbox (role-tree-checkbox.vue)
    │   │   ├── RoleTreeMenu (role-tree-menu.vue)
    │   │   │   ├── RoleTreePoint (role-tree-point.vue)
    │   │   │   ├── useRoleStore
    │   │   │   └── MENU_TYPE_ENUM
    │   │   └── useRoleStore
    │   ├── roleMenuApi
    │   ├── useRoleStore
    │   ├── SmartLoading
    │   ├── smartSentry
    │   └── lodash
    ├── RoleDataScope (components/role-data-scope/index.vue)
    │   ├── roleApi
    │   ├── smartSentry
    │   └── lodash
    └── RoleEmployeeList (components/role-employee-list/index.vue)
        ├── EmployeeTableSelectModal (components/system/employee-table-select-modal/index.vue)
        │   ├── DepartmentTreeSelect
        │   ├── employeeApi
        │   ├── PAGE_SIZE, PAGE_SIZE_OPTIONS
        │   └── smartSentry
        ├── roleApi
        ├── SmartLoading
        ├── smartSentry
        └── lodash
```