<!--
  * 菜单 表单弹窗
  *
  * @Author:    1024创新实验室-主任：卓大
  * @Date:      2022-06-12 20:11:39
  * @Wechat:    zhuda1024
  * @Email:     lab1024@163.com
  * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
-->
<template>
  <el-drawer
    :title="form.id ? '编辑' : '添加'"
    v-model="visible"
    size="600px"
    :lock-scroll="false"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="form.menuType">
          <el-radio-button v-for="item in MENU_TYPE_ENUM_LIST" :key="item.value" :value="item.value">
            {{ item.desc }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item :label="form.menuType === MENU_TYPE_ENUM.CATALOG.value ? '上级目录' : '上级菜单'">
        <MenuTreeSelect ref="parentMenuTreeSelect" v-model:value="form.parentId" />
      </el-form-item>
      
      <!--      目录 菜单 start   -->
      <template v-if="form.menuType === MENU_TYPE_ENUM.CATALOG.value || form.menuType === MENU_TYPE_ENUM.MENU.value">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        
        <el-form-item label="菜单图标" prop="icon">
          <IconSelect @updateIcon="selectIcon">
            <template #iconSelect>
              <div class="icon-selector">
                <el-input 
                  v-model="form.icon" 
                  placeholder="请选择菜单图标" 
                  readonly
                  style="flex: 1;"
                >
                  <template #suffix>
                    <div class="icon-display">
                      <component 
                        v-if="form.icon"
                        :is="ElementPlusIconsVue[form.icon]" 
                        class="selected-icon"
                      />
                      <el-icon v-else class="arrow-icon">
                        <ArrowDown />
                      </el-icon>
                    </div>
                  </template>
                </el-input>
              </div>
            </template>
          </IconSelect>
        </el-form-item>
        
        <el-form-item label="路由地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入路由地址" />
          <div class="form-hint">
            {{ form.menuType === MENU_TYPE_ENUM.CATALOG.value ? '目录路由地址，如：/main/system' : '菜单路由地址，如：/main/system/user' }}
          </div>
        </el-form-item>
        
        <el-form-item label="组件地址" prop="component">
          <el-input v-model="form.component" placeholder="请输入组件地址" />
          <div class="form-hint">
            {{ form.menuType === MENU_TYPE_ENUM.CATALOG.value 
              ? '目录布局组件，如：/system/index.vue 或留空使用默认布局' 
              : '页面组件地址，如：/system/user/index.vue' 
            }}
          </div>
        </el-form-item>
        
        <el-form-item v-if="form.menuType === MENU_TYPE_ENUM.MENU.value" label="是否外链" prop="frameFlag">
          <el-switch v-model="form.frameFlag" active-text="是外链" inactive-text="不是外链" />
        </el-form-item>
        
        <el-form-item label="显示状态" prop="status">
          <el-switch 
            v-model="form.status" 
            active-value="T"
            inactive-value="F"
            active-text="显示" 
            inactive-text="不显示" 
          />
        </el-form-item>
        

      </template>
      <!--      目录 菜单 end   -->
      
      <!--      功能点 start   -->
      <template v-if="form.menuType === MENU_TYPE_ENUM.POINTS.value">
        <el-form-item label="功能点名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入功能点名称" />
        </el-form-item>
<!--         
        <el-form-item label="功能关联菜单">
          <MenuTreeSelect ref="contextMenuTreeSelect" v-model:value="form.contextMenuId" />
        </el-form-item>
         -->
   
        
        <!-- <el-form-item label="权限类型" prop="permsType">
          <el-radio-group v-model="form.permsType">
            <el-radio v-for="item in MENU_PERMS_TYPE_ENUM_LIST" :key="item.value" :value="item.value">
              {{ item.desc }}
            </el-radio>
          </el-radio-group>
        </el-form-item> -->
        
        <el-form-item label="权限" prop="permission">
          <el-input v-model="form.permission" placeholder="请输入权限标识" />
          <div class="form-hint">用于前后端按钮等功能的展示和隐藏，搭配v-privilege使用,多个以英文冒号</div>
        </el-form-item>
        
   
      </template>
      <!--      功能点 end   -->
      
      <el-form-item label="排序" prop="orderNum">
        <el-input-number v-model="form.orderNum" :min="0" placeholder="请输入排序" style="width: 120px" />
        <div class="form-hint">值越小越靠前</div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit(false)">提交</el-button>
        <el-button v-if="!form.id" type="primary" @click="onSubmit(true)">提交并添加下一个</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup>
  import { ElMessage, ElLoading } from 'element-plus'
  import _ from 'lodash'
  import { nextTick, reactive, ref } from 'vue'
  import MenuTreeSelect from './menu-tree-select.vue'
  import * as menuApi from '@/api/menu'
  import { MENU_DEFAULT_PARENT_ID, MENU_PERMS_TYPE_ENUM, MENU_TYPE_ENUM } from '@/constants/menu-const'
  import IconSelect from './icon-select/index.vue'
  import * as ElementPlusIconsVue from '@element-plus/icons-vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  // 转换枚举为数组
  const MENU_TYPE_ENUM_LIST = Object.values(MENU_TYPE_ENUM)
  // const MENU_PERMS_TYPE_ENUM_LIST = Object.values(MENU_PERMS_TYPE_ENUM)

  // ----------------------- 以下是字段定义 emits props ------------------------
  // emit
  const emit = defineEmits(['reloadList'])

  // ----------------------- 展开、隐藏编辑窗口 ------------------------

  // 是否展示抽屉
  const visible = ref(false)

  const contextMenuTreeSelect = ref()
  const parentMenuTreeSelect = ref()

  //展开编辑窗口
  async function showDrawer(rowData) {
    Object.assign(form, formDefault)
    if (rowData && !_.isEmpty(rowData)) {
      if (rowData.id) {
        // 如果是编辑，先调用详情接口获取完整数据
        try {
          const detailRes = await menuApi.getMenuDetail(rowData.id)
          if (detailRes && detailRes.data) {
            Object.assign(form, detailRes.data)
          } else {
            // 如果详情接口失败，使用传入的数据
            Object.assign(form, rowData)
          }
        } catch (error) {
          console.warn('获取菜单详情失败，使用默认数据:', error)
          Object.assign(form, rowData)
        }
      } else {
        // 如果是新增，直接使用传入的数据
        Object.assign(form, rowData)
      }
      
      if (form.parentId === MENU_DEFAULT_PARENT_ID) {
        form.parentId = null
      }
    }
    visible.value = true
    refreshParentAndContext()
  }

  function refreshParentAndContext() {
    nextTick(() => {
      if (contextMenuTreeSelect.value) {
        contextMenuTreeSelect.value.queryMenuTree()
      }
      if (parentMenuTreeSelect.value) {
        parentMenuTreeSelect.value.queryMenuTree()
      }
    })
  }

  // 隐藏窗口
  function onClose() {
    Object.assign(form, formDefault)
    formRef.value.resetFields()
    visible.value = false
  }

  // ----------------------- form表单相关操作 ------------------------

  const formRef = ref()
  const formDefault = {
    id: undefined,
    menuName: undefined,
    menuType: MENU_TYPE_ENUM.CATALOG.value,
    icon: undefined,
    parentId: undefined,
    url: undefined,
    permission: undefined,
    orderNum: undefined,
    status: 'T',
    component: undefined,
    // contextMenuId: undefined,
    remark: undefined,
    frameFlag: false,
  }
  let form = reactive({ ...formDefault })

  function continueResetForm() {
    refreshParentAndContext()
    const menuType = form.menuType
    const parentId = form.parentId
    const permission = form.permission
    Object.assign(form, formDefault)
    formRef.value.resetFields()
    form.menuType = menuType
    form.parentId = parentId
    // if (form.menuType === MENU_TYPE_ENUM.POINTS.value) {
    //   form.contextMenuId = parentId
    // }
    // 移除最后一个：后面的内容
    if (permission && permission.lastIndexOf(':')) {
      form.permission = permission.substring(0, permission.lastIndexOf(':') + 1)
    }
  }

  const rules = {
    menuType: [{ required: true, message: '菜单类型不能为空' }],
    menuName: [
      { required: true, message: '菜单名称不能为空' },
      { max: 20, message: '菜单名称不能大于20个字符', trigger: 'blur' },
    ],
    url: [
      { 
        required: false,
        message: '路由地址不能为空',
        validator: (rule, value, callback) => {
          if (form.menuType === MENU_TYPE_ENUM.POINTS.value) {
            callback()
            return
          }
          
          if (!value) {
            callback(new Error('路由地址不能为空'))
          } else if (value.length > 100) {
            callback(new Error('路由地址不能大于100个字符'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    component: [
      {
        required: false,
        validator: (rule, value, callback) => {
          if (form.menuType === MENU_TYPE_ENUM.POINTS.value) {
            callback()
            return
          }
          
          if (form.menuType === MENU_TYPE_ENUM.MENU.value && !value) {
            console.warn(`菜单 "${form.menuName}" 没有指定组件地址`)
          }
          
          callback()
        },
        trigger: 'blur'
      }
    ],
    permission: [
      {
        required: false,
        validator: (rule, value, callback) => {
          if (form.menuType === MENU_TYPE_ENUM.POINTS.value && !value) {
            console.warn(`按钮 "${form.menuName}" 没有指定权限标识`)
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  }

  function validateForm(formRef) {
    return new Promise((resolve) => {
      formRef
        .validate()
        .then(() => {
          resolve(true)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  const onSubmit = async (continueFlag) => {
    let validateFormRes = await validateForm(formRef.value)
    if (!validateFormRes) {
      ElMessage.error('参数验证错误，请仔细填写表单数据!')
      return
    }
    
    const loading = ElLoading.service({
      lock: true,
      text: '保存中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    try {
      let params = _.cloneDeep(form)
      // 若无父级ID 默认设置为-1
      if (!params.parentId) {
        params.parentId = MENU_DEFAULT_PARENT_ID
      }
      
      // 根据是否有id判断是新增还是编辑
      if (params.id) {
        await menuApi.updateMenu(params)
      } else {
        await menuApi.saveMenu(params)
      }
      
      ElMessage.success(`${params.id ? '修改' : '添加'}成功`)
      if (continueFlag) {
        continueResetForm()
      } else {
        onClose()
      }
      emit('reloadList')
    } catch (error) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    } finally {
      loading.close()
    }
  }

  // ----------------------- 图标选择处理 ------------------------
  const selectIcon = (iconName) => {
    form.icon = iconName
  }

  // ----------------------- 以下是暴露的方法内容 ------------------------
  defineExpose({
    showDrawer,
  })
</script>
<style lang="scss" scoped>
  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px;
    border-top: 1px solid #e9e9e9;
    background: #fff;
  }
  
  .form-hint {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .icon-selector {
    cursor: pointer;
    
    :deep(.el-input__wrapper) {
      cursor: pointer;
    }
    
    :deep(.el-input__inner) {
      cursor: pointer;
    }
  }

  .icon-display {
    display: flex;
    align-items: center;
    padding-right: 8px;
    
    .selected-icon {
      font-size: 16px;
      color: #409EFF;
    }
    
    .arrow-icon {
      font-size: 14px;
      color: #c0c4cc;
    }
  }
</style>
