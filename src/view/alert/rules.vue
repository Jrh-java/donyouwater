<template>
  <div class="rules-container">


    <el-card shadow="never" style="margin-top: 20px;">
      <el-form :inline="true" :model="formInline" class="rule-form-inline">
        <el-form-item label="规则名称">
          <el-input v-model="formInline.ruleName" placeholder="请输入规则名称" clearable />
        </el-form-item>
        <el-form-item label="告警等级">
          <el-select v-model="formInline.warnLevel" placeholder="请选择告警等级" clearable :teleported="false">
            <el-option label="I级告警" value="I" />
            <el-option label="II级告警" value="II" />
            <el-option label="III级告警" value="III" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-select v-model="formInline.isActive" placeholder="请选择是否启用" clearable :teleported="false">
            <el-option label="是" value="T" />
            <el-option label="否" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="formInline.warnType" placeholder="请选择告警类型" clearable :teleported="false">
            <el-option label="位移监测" value="displacement" />
            <el-option label="应力监测" value="stress" />
            <!-- <el-option label="环境监测" value="env" /> -->
            <el-option label="渗压监测" value="seepage" />
            <el-option label="渗流监测" value="flow" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
        <el-form-item style="float: right;">
           <el-button type="success" @click="onAdd">+ 新增</el-button>
        </el-form-item>
      </el-form>
      <el-divider />
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="序号" width="180" />
        <el-table-column prop="ruleName" label="规则名称" />
        <el-table-column prop="warnType" label="告警类型">
          <template #default="scope">
            {{ getWarnTypeText(scope.row.warnType) }}
          </template>
        </el-table-column>
        <el-table-column prop="warnLevel" label="告警等级">
          <template #default="scope">
            {{ getWarnLevelText(scope.row.warnLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="reamrks" label="规则描述" />
        <el-table-column prop="receiveType" label="接收者类型">
          <template #default="scope">
            {{ scope.row.receiveType === 'U' ? '用户' : '角色' }}
          </template>
        </el-table-column>
        <el-table-column prop="receiverCode" label="接收者" />
        <el-table-column prop="notifyType" label="通知方式">
          <template #default="scope">
            {{ getNotifyTypeText(scope.row.notifyType) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="是否启用">
          <template #default="scope">
            {{ scope.row.isActive === 'T' ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button link type="primary"   @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary"   @click="handleEdit(scope.row)">修改</el-button>
            <el-button link type="danger"   @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="margin-top: 20px; justify-content: flex-end;"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="totalItems"
        layout="total, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="600px" 
      :lock-scroll="false"
      @closed="resetForm"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="formData.ruleName" placeholder="请输入..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警类型" prop="warnType">
              <el-select v-model="formData.warnType" placeholder="请选择" :teleported="false">
                <el-option label="位移监测" value="displacement" />
                <el-option label="应力监测" value="stress" />
                <!-- <el-option label="环境监测" value="env" /> -->
                <el-option label="渗压监测" value="seepage" />
                <el-option label="渗流监测" value="flow" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="触发阈值" prop="warnValue">
              <el-input v-model="formData.warnValue" placeholder="请输入...">
                <template #append>
                  <span v-if="formData.warnType === 'displacement'">mm</span>
                  <span v-else-if="formData.warnType === 'seepage'">kPa</span>
                  <span v-else-if="formData.warnType === 'stress'">MPa</span>
                  <span v-else-if="formData.warnType === 'flow'">L/S</span>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警级别" prop="warnLevel">
              <el-select v-model="formData.warnLevel" placeholder="请选择" :teleported="false">
                <el-option label="I级告警" value="I" />
                <el-option label="II级告警" value="II" />
                <el-option label="III级告警" value="III" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="规则描述" prop="reamrks">
          <el-input 
            v-model="formData.reamrks" 
            type="textarea" 
            placeholder="请输入..." 
            :rows="3"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属流域" prop="reservoirManagementId">
              <el-tree-select 
                v-model="formData.reservoirManagementId" 
                :data="reservoirTreeData"
                placeholder="请选择所属流域" 
                :teleported="false"
                :loading="damDataLoading"
                filterable
                check-strictly
                :render-after-expand="false"
                node-key="value"
                :props="{ label: 'label', value: 'value', children: 'children' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属闸站" prop="gateStationId">
              <el-tree-select 
                v-model="formData.gateStationId" 
                :data="gateStationTreeData"
                placeholder="请选择所属闸站" 
                :expand-all="true"
                :teleported="false"
                clearable
                filterable
                check-strictly
                :render-after-expand="false"
                node-key="value"
                :props="{ label: 'label', value: 'value', children: 'children' }"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接收者类型" prop="receiveType">
              <el-select v-model="formData.receiveType" placeholder="请选择" :teleported="false">
                <el-option label="用户" value="U" />
                <el-option label="角色" value="R" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收者" prop="receiverCode">
              <el-select 
                v-model="formData.receiverCode" 
                placeholder="请选择接收者" 
                :teleported="false"
                :loading="userRoleLoading"
                filterable
                clearable
                @focus="handleReceiverFocus"
              >
                <el-option 
                  v-if="formData.receiveType === 'U'"
                  v-for="user in userList" 
                  :key="user.userId" 
                  :label="user.name" 
                  :value="user.name" 
                />
                <el-option 
                  v-if="formData.receiveType === 'R'"
                  v-for="role in roleList" 
                  :key="role.id" 
                  :label="role.roleName" 
                  :value="role.roleName" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通知方式" prop="notifyType">
              <el-select v-model="formData.notifyType" placeholder="请选择" :teleported="false">
                <el-option label="移动端" value="1" />
                <el-option label="站内通知" value="2" />
                <!-- <el-option label="邮件" value="3" /> -->
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="isActive">
              <el-radio-group v-model="formData.isActive">
                <el-radio value="T">是</el-radio>
                <el-radio value="F">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog 
      v-model="viewDialogVisible" 
      title="查看详情" 
      width="600px" 
      :lock-scroll="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="规则名称" align="center">{{ viewData.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="告警类型" align="center">{{ getWarnTypeText(viewData.warnType) }}</el-descriptions-item>
        <el-descriptions-item label="触发阈值" align="center">
          {{ viewData.warnValue }}
          <span v-if="viewData.warnType === 'displacement'">mm</span>
          <span v-else-if="viewData.warnType === 'seepage'">kPa</span>
          <span v-else-if="viewData.warnType === 'stress'">MPa</span>
          <span v-else-if="viewData.warnType === 'flow'">L/S</span>
        </el-descriptions-item>
        <el-descriptions-item label="告警级别" align="center">{{ getWarnLevelText(viewData.warnLevel) }}</el-descriptions-item>
        <el-descriptions-item label="规则描述" :span="2" align="center">{{ viewData.reamrks }}</el-descriptions-item>
        <el-descriptions-item label="所属流域" align="center">{{ getReservoirLabel(viewData.reservoirManagementId || '') }}</el-descriptions-item>
        <el-descriptions-item label="所属闸站" align="center">{{ getGateStationLabel(viewData.gateStationId || '') }}</el-descriptions-item>
        <el-descriptions-item label="接收者类型" align="center">{{ viewData.receiveType === 'U' ? '用户' : '角色' }}</el-descriptions-item>
        <el-descriptions-item label="接收者" align="center">{{ viewData.receiverCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="通知方式" align="center">{{ getNotifyTypeText(viewData.notifyType || '') }}</el-descriptions-item>
        <el-descriptions-item label="是否启用" align="center">{{ viewData.isActive === 'T' ? '是' : '否' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { 
  getAlertRulePage, 
  saveAlertRule, 
  updateAlertRule, 
  deleteAlertRule, 
  getAlertRuleDetail,
  type AlertRule 
} from '@/api/alert';
import { getDamDirectoryListApi } from '@/api/reservoir';
import { getEmployeePage, type Employee } from '@/api/employee';
import { getAllRole, type Role } from '@/api/role';

const formInline = reactive({
  ruleName: '',
  warnLevel: '',
  isActive: '',
  warnType: '',
});

const tableData = ref<AlertRule[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

// 流域和闸站数据
const reservoirTreeData = ref<any[]>([]);
const gateStationTreeData = ref<any[]>([]);
const damDataLoading = ref(false);
// 用于存储code到name的映射
const reservoirCodeMap = ref<Map<string, string>>(new Map());
const gateStationCodeMap = ref<Map<string, string>>(new Map());

// 用户和角色数据
const userList = ref<Employee[]>([]);
const roleList = ref<Role[]>([]);
const userRoleLoading = ref(false);

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('新增');
const isEdit = ref(false);
const formRef = ref<FormInstance>();

// 表单数据
const formData = reactive<AlertRule>({
  ruleName: '',
  warnType: '',
  warnLevel: '',
  warnValue: '',
  reamrks: '',
  receiveType: '',
  receiverCode: '',
  notifyType: '',
  isActive: 'T',
  reservoirManagementId: '',
  gateStationId: '',
});

// 查看详情
const viewDialogVisible = ref(false);
const viewData = reactive<AlertRule>({
  ruleName: '',
  warnType: '',
  warnLevel: '',
  warnValue: '',
  reamrks: '',
  receiveType: '',
  receiverCode: '',
  notifyType: '',
  isActive: 'T',
  reservoirManagementId: '',
  gateStationId: '',
});

// 表单验证规则
const rules = reactive<FormRules<AlertRule>>({
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  warnType: [{ required: true, message: '请选择告警类型', trigger: 'change' }],
  warnLevel: [{ required: true, message: '请选择告警级别', trigger: 'change' }],
  warnValue: [{ required: true, message: '请输入触发阈值', trigger: 'blur' }],
  receiveType: [{ required: true, message: '请选择接收者类型', trigger: 'change' }],
  receiverCode: [{ required: true, message: '请输入接收者', trigger: 'blur' }],
  notifyType: [{ required: true, message: '请选择通知方式', trigger: 'change' }],
  isActive: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
  reamrks: [{ required: true, message: '请输入规则描述', trigger: 'blur' }],
  reservoirManagementId: [{ required: true, message: '请选择所属流域', trigger: 'change' }],
});

// 告警类型映射
const warnTypeMap: Record<string, string> = {
  displacement: '位移监测',
  stress: '应力监测',
  env: '环境监测',
  seepage: '渗压监测',
  flow: '渗流监测'
};

// 告警级别映射
const warnLevelMap: Record<string, string> = {
  I: 'I级告警',
  II: 'II级告警',
  III: 'III级告警'
};

// 通知方式映射
const notifyTypeMap: Record<string, string> = {
  '1': '站内通知',
  '2': '移动端'
};

// 获取告警类型中文名称
const getWarnTypeText = (warnType: string) => {
  return warnTypeMap[warnType] || warnType;
};

// 获取告警级别中文名称
const getWarnLevelText = (warnLevel: string) => {
  return warnLevelMap[warnLevel] || warnLevel;
};

// 获取通知方式中文名称
const getNotifyTypeText = (notifyType: string) => {
  return notifyTypeMap[notifyType] || notifyType;
};

// 获取流域标签
const getReservoirLabel = (reservoirCode: string) => {
  if (!reservoirCode) return '-';
  return reservoirCodeMap.value.get(reservoirCode) || reservoirCode;
};

// 获取闸站标签
const getGateStationLabel = (gateStationCode: string) => {
  if (!gateStationCode) return '-';
  return gateStationCodeMap.value.get(gateStationCode) || gateStationCode;
};

// 递归查找树形数据中的节点
const findNodeInTree = (tree: any[], value: string): any => {
  for (const node of tree) {
    if (node.value === value) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeInTree(node.children, value);
      if (found) return found;
    }
  }
  return null;
};

// 获取用户数据
const fetchUserData = async () => {
  try {
    userRoleLoading.value = true;
    const response = await getEmployeePage({
      page: 1,
      limit: 1000
    });
    userList.value = response.list || [];
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败');
  } finally {
    userRoleLoading.value = false;
  }
};

// 获取角色数据
const fetchRoleData = async () => {
  try {
    userRoleLoading.value = true;
    const response = await getAllRole();
    roleList.value = response || [];
  } catch (error) {
    console.error('获取角色数据失败:', error);
    ElMessage.error('获取角色数据失败');
  } finally {
    userRoleLoading.value = false;
  }
};

// 处理接收者下拉框焦点事件
const handleReceiverFocus = () => {
  if (formData.receiveType === 'U' && userList.value.length === 0) {
    fetchUserData();
  } else if (formData.receiveType === 'R' && roleList.value.length === 0) {
    fetchRoleData();
  }
};

// 获取流域数据（树形结构到水库级别）
const fetchReservoirData = async () => {
  try {
    damDataLoading.value = true;
    const response = await getDamDirectoryListApi();
    
    // 转换为树形结构（省-市-区-镇-水库）
    const treeData: any[] = [];
    const dataArray = response.data || response;
    dataArray.forEach((provinceData: any) => {
      const provinceNode = {
        value: `province_${provinceData.id}`,
        label: provinceData.province,
        children: [] as any[]
      };
      
      provinceData.envMcsCityVOS.forEach((cityData: any) => {
        const cityNode = {
          value: `city_${cityData.id}`,
          label: cityData.city,
          children: [] as any[]
        };
        
        cityData.envMcsAreaVOS.forEach((areaData: any) => {
          const areaNode = {
            value: `area_${areaData.id}`,
            label: areaData.area,
            children: [] as any[]
          };
          
          areaData.envMcsTownVOS.forEach((townData: any) => {
            const townNode = {
              value: `town_${townData.id}`,
              label: townData.town,
              children: [] as any[]
            };
            
            townData.reservoirInfoVOS.forEach((reservoir: any) => {
              const reservoirNode = {
                value: reservoir.reservoirCode,
                label: reservoir.reservoirName,
                reservoirCode: reservoir.reservoirCode,
                reservoirName: reservoir.reservoirName
              };
              
              // 建立code到name的映射
              reservoirCodeMap.value.set(reservoir.reservoirCode, reservoir.reservoirName);
              
              townNode.children.push(reservoirNode);
            });
            
            if (townNode.children.length > 0) {
              areaNode.children.push(townNode);
            }
          });
          
          if (areaNode.children.length > 0) {
            cityNode.children.push(areaNode);
          }
        });
        
        if (cityNode.children.length > 0) {
          provinceNode.children.push(cityNode);
        }
      });
      
      if (provinceNode.children.length > 0) {
        treeData.push(provinceNode);
      }
    });
    
    reservoirTreeData.value = treeData;
  } catch (error) {
    console.error('获取流域数据失败:', error);
    ElMessage.error('获取流域数据失败');
  } finally {
    damDataLoading.value = false;
  }
};

// 获取闸站数据（树形结构到闸站级别）
const fetchGateStationData = async () => {
  try {
    const response = await getDamDirectoryListApi();
    
    // 转换为树形结构（省-市-区-镇-水库-闸站）
    const treeData: any[] = [];
    const dataArray = response.data || response;
    dataArray.forEach((provinceData: any) => {
      const provinceNode = {
        value: `province_${provinceData.id}`,
        label: provinceData.province,
        children: [] as any[]
      };
      
      provinceData.envMcsCityVOS.forEach((cityData: any) => {
        const cityNode = {
          value: `city_${cityData.id}`,
          label: cityData.city,
          children: [] as any[]
        };
        
        cityData.envMcsAreaVOS.forEach((areaData: any) => {
          const areaNode = {
            value: `area_${areaData.id}`,
            label: areaData.area,
            children: [] as any[]
          };
          
          areaData.envMcsTownVOS.forEach((townData: any) => {
            const townNode = {
              value: `town_${townData.id}`,
              label: townData.town,
              children: [] as any[]
            };
            
            townData.reservoirInfoVOS.forEach((reservoir: any) => {
              const reservoirNode = {
                value: reservoir.reservoirCode,
                label: reservoir.reservoirName,
                reservoirCode: reservoir.reservoirCode,
                reservoirName: reservoir.reservoirName,
                children: [] as any[]
              };
              
              // 处理闸站数据
              if (reservoir.deviceGateStationInfoNodeVOS) {
                reservoir.deviceGateStationInfoNodeVOS.forEach((gateStation: any) => {
                  const gateStationNode = {
                    value: gateStation.gateStationCode,
                    label: gateStation.gateStationName,
                    gateStationCode: gateStation.gateStationCode,
                    gateStationName: gateStation.gateStationName,
                    reservoirManagementNo: gateStation.reservoirManagementNo
                  };
                  
                  // 建立code到name的映射
                  gateStationCodeMap.value.set(gateStation.gateStationCode, gateStation.gateStationName);
                  
                  reservoirNode.children.push(gateStationNode);
                });
              }
              
              if (reservoirNode.children.length > 0 || true) { // 即使没有闸站也显示水库节点
                townNode.children.push(reservoirNode);
              }
            });
            
            if (townNode.children.length > 0) {
              areaNode.children.push(townNode);
            }
          });
          
          if (areaNode.children.length > 0) {
            cityNode.children.push(areaNode);
          }
        });
        
        if (cityNode.children.length > 0) {
          provinceNode.children.push(cityNode);
        }
      });
      
      if (provinceNode.children.length > 0) {
        treeData.push(provinceNode);
      }
    });
    
    gateStationTreeData.value = treeData;
  } catch (error) {
    console.error('获取闸站数据失败:', error);
    ElMessage.error('获取闸站数据失败');
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...formInline
    };
    const result = await getAlertRulePage(params);
    tableData.value = result.list;
    totalItems.value = result.totalCount;
  } catch (error) {
    ElMessage.error('获取数据失败');
  } finally {
    loading.value = false;
  }
};

// 查询
const onSubmit = () => {
  currentPage.value = 1;
  loadData();
};

// 重置
const onReset = () => {
  formInline.ruleName = '';
  formInline.warnLevel = '';
  formInline.isActive = '';
  formInline.warnType = '';
  loadData();
};

// 新增
const onAdd = () => {
  dialogTitle.value = '新增';
  isEdit.value = false;
  dialogVisible.value = true;
};

// 查看
const handleView = async (row: AlertRule) => {
  try {
    const result = await getAlertRuleDetail(String(row.id || ''));
    // 处理数据映射：将code字段映射到对应的字段
    const mappedResult = {
      ...result,
      reservoirManagementId: result.reservoirManagementNo || '',
      gateStationId: result.gateStationCode || ''
    };
    Object.assign(viewData, mappedResult);
    viewDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取详情失败');
  }
};

// 编辑
const handleEdit = async (row: AlertRule) => {
  try {
    const result = await getAlertRuleDetail(String(row.id || ''));
    // 处理数据映射：将code字段映射到对应的字段
    const mappedResult = {
      ...result,
      reservoirManagementId: result.reservoirManagementNo || '',
      gateStationId: result.gateStationCode || ''
    };
    Object.assign(formData, mappedResult);
    dialogTitle.value = '修改';
    isEdit.value = true;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取详情失败');
  }
};

// 删除
const handleDelete = (row: AlertRule) => {
  ElMessageBox.confirm(
    `确定要删除规则"${row.ruleName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      lockScroll: false
    }
  ).then(async () => {
    try {
      await deleteAlertRule([String(row.id || '')]);
      ElMessage.success('删除成功');
      loadData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 确认提交
const confirmSubmit = () => {
  if (!formRef.value) return;
  
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 准备提交数据，将ID字段映射回code字段
        const submitData = {
          ...formData,
          reservoirManagementNo: formData.reservoirManagementId,
          gateStationCode: formData.gateStationId
        };
        
        if (isEdit.value) {
          await updateAlertRule(submitData);
          ElMessage.success('修改成功');
        } else {
          await saveAlertRule(submitData);
          ElMessage.success('新增成功');
        }
        dialogVisible.value = false;
        loadData();
      } catch (error) {
        ElMessage.error(isEdit.value ? '修改失败' : '新增失败');
        console.error('提交失败:', error);
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  Object.assign(formData, {
    ruleName: '',
    warnType: '',
    warnLevel: '',
    warnValue: '',
    reamrks: '',
    receiveType: '',
    receiverCode: '',
    notifyType: '',
    isActive: 'T',
    reservoirManagementId: '',
    gateStationId: '',
  });
};

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  loadData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  loadData();
};

// 监听接收者类型变化
watch(() => formData.receiveType, (newType) => {
  // 清空接收者选择
  formData.receiverCode = '';
  // 根据类型预加载数据
  if (newType === 'U' && userList.value.length === 0) {
    fetchUserData();
  } else if (newType === 'R' && roleList.value.length === 0) {
    fetchRoleData();
  }
});

// 初始化
onMounted(() => {
  loadData();
  fetchReservoirData();
  fetchGateStationData();
  // 预加载角色数据
  fetchRoleData();
});
</script>

<style lang="scss" scoped>
.rules-container {
  padding: 20px;
}

.rule-form-inline .el-form-item {
  margin-right: 10px; 
}

.el-card {
  border: none; // Remove card border if not desired
}
//所有select width:100px;
.el-select{
  width:120px;
}
</style>