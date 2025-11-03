<template>
  <div class="route-management-container">
    <!-- 顶部操作区域 -->
    <div class="header-section">
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="路线状态:">
            <el-select v-model="filterForm.status" placeholder="全部" style="width: 100px" :teleported="false">
              <el-option label="全部" value="" />
              <el-option label="启用" value="T" />
              <el-option label="停用" value="F" />
            </el-select>
          </el-form-item>
          <el-form-item label="路线名称:">
            <el-input 
              v-model="filterForm.searchKey" 
              placeholder="输入路线名称" 
              style="width: 180px"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="action-section">
        <el-button type="primary" @click="handleCreateRoute">
          <el-icon><Plus /></el-icon>创建路线
        </el-button>
        
        <!-- 视图切换按钮 -->
        <div class="view-toggle">
          <el-button-group>
            <el-button 
              :type="viewMode === 'card' ? 'primary' : 'default'"
              @click="viewMode = 'card'"
            >
              <el-icon><Grid /></el-icon> &nbsp;图示
            </el-button>  
            <el-button 
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="viewMode = 'list'"
            >
              <el-icon><List /></el-icon> &nbsp;列表
            </el-button>
          
          </el-button-group>
        </div>
      </div>
    </div>
   <!-- 卡片视图 -->
   <div v-if="viewMode === 'card'" class="card-view">
      <div class="card-grid">
        <div v-for="route in routeList" :key="route.id" class="route-card">
          <div class="card-header">
            <div class="route-title">
              <el-icon><Location /></el-icon>
              {{ route.routeName }}
            </div>
            <el-dropdown @command="handleCardAction" :teleported="false">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{action: 'view', data: route}">查看</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'edit', data: route}">编辑</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'delete', data: route}">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <div class="route-status">
            <el-tag :type="route.reservoir === '火星水库' ? 'primary' : 'info'" >
              {{ route.reservoir }}
            </el-tag>
            <el-tag type="success"  v-if="route.isActive">使用中</el-tag>
            <el-tag type="info"  v-else>停用</el-tag>
          </div>
          
          <!-- 路线预览图 -->
          <div class="route-preview">
            <div v-if="route.previewImage" class="map-image">
              <img :src="route.previewImage" alt="路线预览图" class="preview-image" />
            </div>
            <div v-else class="map-placeholder">
              <el-icon><MapLocation /></el-icon>
              <span>暂无预览图</span>
            </div>
          </div>
          
          <div class="route-info">
            <div class="info-item">
              <span class="label">任务类型:</span>
              <span>{{ route.taskType }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span>{{ route.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="list-view">
      <el-table :data="routeList" v-loading="loading" style="width: 100%">
        <el-table-column label="序号" width="80">
          <template #default="scope">
            {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="routeName" label="路线名称"  />
        <el-table-column prop="reservoir" label="所属水库" />
        <el-table-column prop="taskType" label="任务类型"  />
        <el-table-column prop="createTime" label="创建时间"  />
        <el-table-column label="路线状态" >
          <template #default="scope">
            <el-switch 
              v-model="scope.row.isActive" 
              :active-value="true"
              :inactive-value="false"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" >
          <template #default="scope">
            <el-button link type="primary"  @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary"  @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger"  @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
         <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    </div>

 

 

    <!-- 创建路线弹窗 -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="创建路线" 
      width="1000px" 
      :before-close="handleCloseCreateDialog"
      destroy-on-close
      :lock-scroll="false"
    >
      <PatrolRouteForm
        v-model="showCreateDialog"
        mode="create"
        @success="handleDialogSuccess"
      />
    </el-dialog>

    <!-- 查看路线弹窗 -->
    <el-dialog 
      v-model="showViewDialog" 
      title="路线详情" 
      width="1000px"
      :before-close="handleCloseViewDialog"
      destroy-on-close
      :lock-scroll="false"
    >
      <PatrolRouteForm
        v-model="showViewDialog"
        mode="view"
        :route-id="currentRouteId"
      />
    </el-dialog>

    <!-- 编辑路线弹窗 -->
    <el-dialog 
      v-model="showEditDialog" 
      title="编辑路线" 
      width="1000px"
      :before-close="handleCloseEditDialog"
      destroy-on-close
      :lock-scroll="false"
    >
      <PatrolRouteForm
        v-model="showEditDialog"
        mode="edit"
        :route-id="currentRouteId"
        @success="handleDialogSuccess"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { 
  Search, Plus, List, Grid, Location, MoreFilled, 
  MapLocation
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getReservoirPage } from '@/api/reservoir'; // 导入水库API
import { 
  getPatrolRoutePage,
  deletePatrolRoute,
  type PatrolRoutePageQuery 
} from '@/api/patrol'; // 导入巡检路线API
import PatrolRouteForm from './components/PatrolRouteForm.vue';

// 类型定义
interface Route {
  id: string;
  routeName: string;
  reservoir: string;
  taskType: string;
  createTime: string;
  isActive: boolean;
  previewImage?: string; // 路线预览图的base64数据
}

// 水库选项数据
const reservoirOptions = ref<Array<{ label: string; value: string }>>([]);

// 视图模式
const viewMode = ref<'list' | 'card'>('card');

// 筛选表单
const filterForm = reactive({
  status: '',
  searchKey: ''
});

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

// 路线列表数据
const routeList = ref<Route[]>([]);

// 弹窗控制
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const showViewDialog = ref(false);
const currentRouteId = ref('');

// 搜索处理
const handleSearch = async () => {
  console.log('搜索:', filterForm);
  loading.value = true;
  
  try {
    const searchParams: PatrolRoutePageQuery = {
      page: currentPage.value,
      limit: pageSize.value,
      routeName: filterForm.searchKey || undefined,
      status: filterForm.status || undefined // 使用筛选表单的状态
    };
    
    const response = await getPatrolRoutePage(searchParams);
    
    routeList.value = response.list.map(item => ({
      id: item.id!,
      routeName: item.routeName,
      reservoir: getReservoirNameById(item.belongReservoirId || ''),
      taskType: getRouteTypeText(item.routeType),
      createTime: item.crtTime || '',
      isActive: item.status === 'T',
      previewImage: item.file // 使用API返回的file字段作为预览图
    }));
    
    total.value = response.totalCount;
    
    console.log('路线列表加载完成:', routeList.value.length, '条记录');
  } catch (error) {
    console.error('获取路线列表失败:', error);
    ElMessage.error('获取路线列表失败');
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const handleReset = () => {
  filterForm.status = '';
  filterForm.searchKey = '';
  currentPage.value = 1;
  handleSearch();
};

// 状态变更
const handleStatusChange = (row: Route) => {
  ElMessage.success(`路线状态已${row.isActive ? '启用' : '停用'}`);
};

// 删除路线
const handleDelete = async (row: Route) => {
  try {
    await ElMessageBox.confirm(
    `确定删除路线 "${row.routeName}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
    );
    
    await deletePatrolRoute([row.id]);
    ElMessage.success('删除成功');
    handleSearch(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除路线失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 查看路线
const handleView = (row: Route) => {
  currentRouteId.value = row.id;
  showViewDialog.value = true;
};

// 编辑路线
const handleEdit = (row: Route) => {
  currentRouteId.value = row.id;
  showEditDialog.value = true;
};

// 创建路线
const handleCreateRoute = () => {
  showCreateDialog.value = true;
};

// 获取水库名称（通过ID）
const getReservoirNameById = (id: string): string => {
  const reservoir = reservoirOptions.value.find((item) => item.value === id);
  return reservoir ? reservoir.label : '未知水库';
};

// 获取水库ID（通过名称）
const getReservoirIdByName = (name: string): string => {
  const reservoir = reservoirOptions.value.find((item) => item.label === name);
  return reservoir ? reservoir.value : '';
};

// 关闭创建弹窗
const handleCloseCreateDialog = () => {
  showCreateDialog.value = false;
};

// 获取水库数据
const getReservoirData = async () => {
  try {
    const response = await getReservoirPage({
      page: 1,
      limit: 100
    });
    
    if (response && (response as any).list) {
      // 将API数据转换为下拉选项格式
      reservoirOptions.value = (response as any).list.map((item: any) => ({
        label: item.reservoirName,
        value: item.id
      }));
      
      console.log('水库选项数据加载完成:', reservoirOptions.value.length, '个水库');
    }
  } catch (error) {
    console.error('获取水库数据失败:', error);
    ElMessage.error('获取水库数据失败');
  }
};

// 处理弹窗成功事件
const handleDialogSuccess = () => {
  handleSearch(); // 刷新列表
};

// 关闭查看弹窗
const handleCloseViewDialog = () => {
  showViewDialog.value = false;
};

// 关闭编辑弹窗
const handleCloseEditDialog = () => {
  showEditDialog.value = false;
};

// 卡片操作
interface CardCommand {
  action: 'view' | 'edit' | 'delete';
  data: Route;
}

const handleCardAction = (command: CardCommand) => {
  const { action, data } = command;
  switch (action) {
    case 'view':
      handleView(data);
      break;
    case 'edit':
      handleEdit(data);
      break;
    case 'delete':
      handleDelete(data);
      break;
  }
};

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  handleSearch();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  handleSearch();
};

// 添加getRouteTypeText方法
const getRouteTypeText = (routeType: string): string => {
  const typeMap: Record<string, string> = {
    '1': '日常巡检',
    '2': '年度巡检',
    '3': '特殊巡检',
    '4': '维修',
    '5': '保养'
  };
  return typeMap[routeType] || routeType || '-';
};

// 组件挂载时获取数据
onMounted(() => {
  getReservoirData();
  handleSearch(); // 加载路线列表
});
</script>

<style lang="scss" scoped>
.route-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100% - 60px);

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .filter-section {
      // 移除flex: 1，让筛选表单自然宽度
    }

    .action-section {
      display: flex;
      align-items: center;
      gap: 15px;

      .view-toggle {
        border-left: 1px solid #e4e7ed;
        padding-left: 15px;
      }
    }
  }

  .list-view {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .card-view {
    margin-bottom: 20px;

    .card-grid {
         display: grid;
    grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
    gap: 20px;
    min-height: 350px;

      .route-card {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          .route-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }
        }

        .route-status {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .route-preview {
          margin-bottom: 15px;

          .map-image {
            height: 250px;
            background-color: #f5f7fa;
            border: 1px solid #e4e7ed;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;

            .preview-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .map-placeholder {
            height: 250px;
            background-color: #f5f7fa;
            border: 2px dashed #d3d3d3;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #999;

            .el-icon {
              font-size: 24px;
              margin-bottom: 8px;
            }
          }
        }

        .route-info {
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;

            .label {
              color: #666;
            }
          }
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: right;
    padding: 25px;
    border-radius: 8px;
  }
}
</style>