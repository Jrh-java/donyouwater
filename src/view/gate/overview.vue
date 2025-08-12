<template>
  <div class="gate-overview">
    <!-- 显示详情页面 -->
    <ReservoirDetail 
      v-if="showDetail" 
      :reservoir-data="selectedReservoir"
      @back="handleBackToOverview"
    />
    
    <!-- 显示列表页面 -->
    <div v-else>
      <!-- 顶部搜索和操作区域 -->
      <div class="search-container">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="名称/编码/地址">
            <el-input v-model="searchForm.nameOrCodeOrLocation" placeholder="名称/编码/地址"  />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="searchForm.type" placeholder="类型" clearable style='width:100px' :teleported='false'>
              <el-option label="大(一)型" value="large_type_1" />
              <el-option label="大(二)型" value="large_type_2" />
              <el-option label="中型" value="middle_type" />
              <el-option label="小(一)型" value="small_type_1" />
              <el-option label="小(二)型" value="small_type_2" />
            </el-select>
          </el-form-item>
          <el-form-item label="建设时间">
            <el-date-picker
            :teleported='false'
              v-model="searchForm.updateTime"
              type="date"
              placeholder="建设时间"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="operation-btns">
          <el-button type="primary" @click="handleAddReservoir" v-privilege="'gate:overviewer:add'">
            <el-icon><Plus /></el-icon>添加
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
        <div class="card-grid" v-loading="loading">
          <div v-for="reservoir in tableData" :key="reservoir.id" class="reservoir-card">
            <div class="card-header">
              <div class="reservoir-title">
                <el-icon><Location /></el-icon>
                {{ reservoir.reservoirName }}
              </div>
              <el-dropdown @command="handleCardAction" :teleported="false">
                <el-button text>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{action: 'detail', data: reservoir}">详情</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'edit', data: reservoir}" v-privilege="'gate:overviewer:edit'">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{action: 'delete', data: reservoir}" v-privilege="'gate:overviewer:delete'">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            
            <div class="reservoir-status">
              <el-tag :type="reservoir.reservoirName === '火星水库' ? 'primary' : 'info'">
                {{ reservoirTypeMap[reservoir.reservoirType] || reservoir.reservoirType }}
              </el-tag>
            </div>
            
            <!-- 水库预览图 -->
            <div class="reservoir-preview">
              <div v-if="reservoir.imageUrl" class="image-container">
                <img :src="reservoir.imageUrl" alt="水库预览图" class="preview-image" />
              </div>
              <div v-else class="image-placeholder">
                <el-icon><Location /></el-icon>
                <span>暂无预览图</span>
              </div>
            </div>
            
            <div class="reservoir-info">
              <div class="info-item">
                <span class="label">建设时间:</span>
                <span>{{ reservoir.websiteCrtTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">区域地址:</span>
                <span>{{ reservoir.address }}</span>
              </div>
              <div class="info-item">
                <span class="label">管理单位:</span>
                <span>{{ reservoir.manageUnit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="list-view">
        <div class="table-container">
          <el-table :data="tableData" border style="width: 100%" v-loading="loading">
            <el-table-column prop="reservoirName" label="区域名称"  />
            <el-table-column prop="reservoirCode" label="区域编码" />
            <el-table-column prop="reservoirType" label="区域类型">
              <template #default="scope">
                {{ reservoirTypeMap[scope.row.reservoirType] || scope.row.reservoirType }}
              </template>
            </el-table-column>
            <el-table-column prop="catchmentArea" label="集水面积(km²)" />
            <el-table-column prop="manageUnit" label="管理单位"  />
            <el-table-column prop="websiteCrtTime" label="建设时间"  />
            <el-table-column prop="address" label="区域地址"  />
            <el-table-column label="操作" >
              <template #default="scope">
                <el-button   type="primary" @click="handleEdit(scope.row)" link v-privilege="'gate:overviewer:edit'">编辑</el-button>
                <el-button   type="danger" @click="handleDelete(scope.row)" link v-privilege="'gate:overviewer:delete'">删除</el-button>
                <el-button   type="info" @click="handleDetail(scope.row)" link >详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 添加水库弹窗 -->
      <AddReservoirDialog
        v-model:visible="showAddDialog"
        @success="handleAddSuccess"
      />

      <!-- 编辑水库弹窗 -->
      <EditReservoirDialog
        v-model:visible="showEditDialog"
        :edit-data="editData"
        @success="handleEditSuccess"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus, List, Grid, Location, MoreFilled } from '@element-plus/icons-vue';
import AddReservoirDialog from '@/components/AddReservoirDialog.vue';
import EditReservoirDialog from '@/components/EditReservoirDialog.vue';
import ReservoirDetail from './ReservoirDetail.vue';
import { getReservoirPage, deleteReservoir, getReservoirDetail, getPresignedObjectUrl } from '@/api/reservoir';
import { ElMessage, ElMessageBox } from 'element-plus';

const reservoirTypeMap = {
  large_type_1: '大(一)型',
  large_type_2: '大(二)型',
  middle_type: '中型',
  small_type_1: '小(一)型',
  small_type_2: '小(二)型'
};

// 搜索表单
const searchForm = ref({
  nameOrCodeOrLocation: '',
  type: '',
  updateTime: ''
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref([]);

// 弹窗显示状态
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// 详情页面显示状态
const showDetail = ref(false);

// 当前选中的水库数据
const selectedReservoir = ref(null);

// 加载状态
const loading = ref(false);

// 编辑数据
const editData = ref({});

// 视图模式
const viewMode = ref('card');

// 获取预签名URL
const getFilePresignedUrl = async (fileStr) => {
  try {
    if (!fileStr || !fileStr.includes(',')) {
      return null;
    }
    
    const [bucket, objectName] = fileStr.split(',');
    const response = await getPresignedObjectUrl({
      bucket: bucket,
      objectName: objectName,
      expires: 3600
    });
    
    return response || null;
  } catch (error) {
    console.error('获取预签名URL失败:', error);
    return null;
  }
};

// 获取水库列表数据
const getReservoirList = async () => {
  try {
    loading.value = true;
    
    const data = {
      page: currentPage.value,
      limit: pageSize.value,
      key: searchForm.value.nameOrCodeOrLocation || undefined,
      reservoirType: searchForm.value.type || undefined,
      updateStartTime: searchForm.value.updateTime ? searchForm.value.updateTime + ' 00:00:00' : undefined,
      updateEndTime: searchForm.value.updateTime ? searchForm.value.updateTime + ' 23:59:59' : undefined
    };

    // 移除undefined的参数
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    const response = await getReservoirPage(data);
    
    if (response && response.list) {
      // 处理图片URL
      const processedList = await Promise.all(response.list.map(async (item) => {
        let imageUrl = null;
        if (item.file) {
          imageUrl = await getFilePresignedUrl(item.file);
        }
        return {
          ...item,
          imageUrl
        };
      }));
      
      tableData.value = processedList;
      total.value = response.totalCount;
    }
  } catch (error) {
    console.error('获取水库列表失败:', error);
    ElMessage.error('获取水库列表失败');
  } finally {
    loading.value = false;
  }
};

// 初始化数据
const initData = () => {
  getReservoirList();
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  getReservoirList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    nameOrCodeOrLocation: '',
    type: '',
    updateTime: ''
  };
  handleSearch();
};

// 添加水库
const handleAddReservoir = () => {
  editData.value = {};
  showAddDialog.value = true;
};

// 编辑水库
const handleEdit = async (row) => {
  try {
    loading.value = true;
    
    // 调用API获取详细数据
    const response = await getReservoirDetail({ id: row.id });
    
    if (response ) {
      editData.value = response;
      showEditDialog.value = true;
    }
  } catch (error) {
    console.error('获取水库详情失败:', error);
    ElMessage.error('获取水库详情失败');
  } finally {
    loading.value = false;
  }
};

// 删除水库
const handleDelete = (row) => {
  // 弹出确认框
  ElMessageBox.confirm(
    '确定要删除该水库吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  )
    .then(() => {
      // 用户确认后执行删除逻辑
      deleteReservoir({ids:[row.id]}).then(res => {
     
          ElMessage.success('删除成功');
          getReservoirList();
    
      });
      console.log('删除水库:', row);
      // 实际项目中这里应该调用删除接口
    })
    .catch(() => {
      // 用户取消，无需处理
    });
};

// 查看水库详情
const handleDetail = (row) => {
  console.log('查看水库详情:', row);
  // 实际项目中这里应该跳转到详情页或打开详情对话框
  selectedReservoir.value = row;
  showDetail.value = true;
};

// 返回概览页面
const handleBackToOverview = () => {
  showDetail.value = false;
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
  getReservoirList();
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getReservoirList();
};

// 添加水库成功后的处理
const handleAddSuccess = () => {
  getReservoirList();
};

// 编辑水库成功后的处理
const handleEditSuccess = () => {
  getReservoirList();
};

// 卡片操作
const handleCardAction = (command) => {
  const { action, data } = command;
  switch (action) {
    case 'detail':
      handleDetail(data);
      break;
    case 'edit':
      handleEdit(data);
      break;
    case 'delete':
      handleDelete(data);
      break;
  }
};

onMounted(() => {
  initData();
});
</script>

<style lang="scss" scoped>
.gate-overview {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100% - 60px);

  .search-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .search-form {
      display: flex;
      align-items: center;
    }

    .operation-btns {
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

    .table-container {
      margin-bottom: 20px;
    }
  }

  .card-view {
    margin-bottom: 20px;

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
      gap: 20px;
      min-height: 350px;

      .reservoir-card {
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

          .reservoir-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 500;
            color: #333;
          }
        }

        .reservoir-status {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }

        .reservoir-preview {
          margin-bottom: 15px;

          .image-container {
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

          .image-placeholder {
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

        .reservoir-info {
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