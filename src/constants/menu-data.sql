-- 菜单数据SQL脚本
-- 表名：xxx (请根据实际情况替换)
-- 数据库：MySQL

-- 清理数据（可选）
-- DELETE FROM xxx WHERE id IN ('1','2','3','4','5','6','7','8','9','31','32','33','34','35','36','37','61','62','81','82','83','84','91','92','93','94','95','96');

-- 插入根级菜单数据
INSERT INTO xxx (id, menu_name, menu_type, icon, parent_id, path, component, order_num, status) VALUES
('1', '一张图', 'C', 'Monitor', '-1', '/viewer-fullscreen', '/viewer/layout.vue', 1, 'T'),
('2', '首页', 'C', 'HomeFilled', '-1', '/main/dashboard', '/dashboard/dashboard.vue', 2, 'T'),
('3', '库闸管理', 'M', 'Lock', '-1', '/main/gate', NULL, 3, 'T'),
('4', '设备管理', 'C', 'Setting', '-1', '/main/device', '/device/DeviceManagement.vue', 4, 'T'),
('5', '视频监控', 'C', 'VideoCamera', '-1', '/main/monitor', '/monitor/MonitorControl.vue', 5, 'T'),
('6', '风险预警', 'M', 'Warning', '-1', '/main/alert', NULL, 6, 'T'),
('7', '巡查管理', 'C', 'MapLocation', '-1', '/main/inspection/inspectionManagement', '/inspection/InspectionManagement.vue', 7, 'T'),
('8', '任务管理', 'M', 'DocumentCopy', '-1', '/main/task', NULL, 8, 'T'),
('9', '系统管理', 'M', 'Management', '-1', '/main/system', NULL, 9, 'T');

-- 插入库闸管理子菜单
INSERT INTO xxx (id, menu_name, menu_type, icon, parent_id, path, component, order_num, status) VALUES
('31', '库闸总览', 'C', 'View', '3', '/main/gate/overview', '/gate/overview.vue', 1, 'T'),
('32', '环境监测', 'C', 'Cloudy', '3', '/main/gate/environment', '/gate/environment.vue', 2, 'T'),
('33', '应力监测', 'C', 'DataLine', '3', '/main/gate/stress', '/gate/stress.vue', 3, 'T'),
('34', '位移监测', 'C', 'Position', '3', '/main/gate/displacement', '/gate/displacement.vue', 4, 'T'),
('35', '渗压监测', 'C', 'Promotion', '3', '/main/gate/seepage', '/gate/seepage.vue', 5, 'T'),
('36', '渗流监测', 'C', 'Connection', '3', '/main/gate/flow', '/gate/flow.vue', 6, 'T'),
('37', '闸门管理', 'C', 'Operation', '3', '/main/gate/control', '/gate/control.vue', 7, 'T');

-- 插入风险预警子菜单
INSERT INTO xxx (id, menu_name, menu_type, icon, parent_id, path, component, order_num, status) VALUES
('61', '异常预警', 'C', 'WarningFilled', '6', '/main/alert/exception', '/alert/Alert.vue', 1, 'T'),
('62', '告警规则配置', 'C', 'Tools', '6', '/main/alert/rules', '/alert/rules.vue', 2, 'T');

-- 插入任务管理子菜单
INSERT INTO xxx (id, menu_name, menu_type, icon, parent_id, path, component, order_num, status) VALUES
('81', '任务列表', 'C', 'List', '8', '/main/task/list', '/task/TaskList.vue', 1, 'T'),
('82', '任务看板-月', 'C', 'Calendar', '8', '/main/task/board-month', '/task/TaskBoard.vue', 2, 'T'),
('83', '任务看板-周', 'C', 'Grid', '8', '/main/task/board-week', '/task/board-week.vue', 3, 'T'),
('84', '调度预案', 'C', 'DataBoard', '8', '/main/task/schedule', '/task/SchedulePlan.vue', 4, 'T');

-- 插入系统管理子菜单
INSERT INTO xxx (id, menu_name, menu_type, icon, parent_id, path, component, order_num, status) VALUES
('91', '部门管理', 'C', 'OfficeBuilding', '9', '/main/system/department', '/system/department/index.vue', 1, 'T'),
('92', '员工管理', 'C', 'User', '9', '/main/system/employee', '/system/employee/index.vue', 2, 'T'),
('93', '角色管理', 'C', 'Avatar', '9', '/main/system/role', '/system/role/index.vue', 3, 'T'),
('94', '公告管理', 'C', 'Bell', '9', '/main/system/announcement', '/system/announcement.vue', 4, 'T'),
('95', '菜单管理', 'C', 'Menu', '9', '/main/system/menu', '/system/menu/menu-list.vue', 5, 'T'),
('96', '操作日志', 'C', 'Document', '9', '/main/system/operation-log', '/system/operation-log.vue', 6, 'T');

-- 字段说明：
-- id: 菜单ID (主键)
-- menu_name: 菜单名称
-- menu_type: 菜单类型 (M=目录, C=菜单, F=按钮)
-- icon: 图标名称 (Element Plus图标名)
-- parent_id: 父级菜单ID (-1表示根节点)
-- path: 路由路径
-- component: 组件路径
-- order_num: 排序号
-- status: 状态 (T=启用, F=禁用)

-- 注意事项：
-- 1. 请将表名 'xxx' 替换为实际的菜单表名
-- 2. 请根据实际数据库表结构调整字段名称 (如：menu_name 可能是 menuName)
-- 3. 目录类型(M)的菜单 component 字段设置为 NULL
-- 4. 可根据需要添加其他字段如：permission, remark, target, url 等 