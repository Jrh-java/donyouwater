<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-left">
        <div class="logo-container">
          <img src="../assets/reservoir-logo.svg" alt="Logo" class="logo" />
          <div class="title">
            <h1>闽江流域东游段智慧管理平台</h1>
            <p>Reservoir Operation System Platform</p>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form">
          <h2>用户登录 <span>USER LOGIN</span></h2>
          <div class="form-item">
            <el-input v-model="username" placeholder="请输入用户名称" prefix-icon="el-icon-user" size="large">
              <template #prefix>
                <i class="el-icon-user">👤</i>
              </template>
            </el-input>
          </div>
          <div class="form-item">
            <el-input v-model="password" placeholder="请输入登录密码" type="password" prefix-icon="el-icon-lock" size="large">
              <template #prefix>
                <i class="el-icon-lock">🔒</i>
              </template>
            </el-input>
          </div>
          <div class="form-item verification">
            <el-input v-model="verifyCodeInput" placeholder="请输入验证码" class="captcha-input" size="large">
              <template #prefix>
                <i class="el-icon-key">🔑</i>
              </template>
            </el-input>
            <div class="captcha-box" @click="fetchCaptcha" title="点击刷新">
              <img v-if="captchaBase64" :src="captchaBase64" alt="验证码" class="captcha-image"/>
              <span v-else>加载中...</span>
            </div>
          </div>
          <div class="form-item remember">
            <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
            <a href="javascript:void(0)" class="forget-password">忘记密码?</a>
          </div>
          <div class="form-item">
            <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../store/pinia';
import { getCaptchaApi, loginApi } from '@/api/auth'; // 引入API方法
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { queryMenuTree } from '@/api/menu';

const router = useRouter();
const store = useStore();
const userStore = useUserStore();

// 表单数据
const username = ref('');
const password = ref('');
const verifyCodeInput = ref(''); // 用户输入的验证码
const captchaBase64 = ref(''); // 验证码图片的 base64 数据
const verifyKey = ref(''); // 验证码接口返回的 uuid
const rememberPassword = ref(false);
const loading = ref(false); // 登录按钮加载状态

// 获取验证码
const fetchCaptcha = async () => {
  try {
    captchaBase64.value = ''; // 清空旧的，显示加载中
    const res = await getCaptchaApi();
    // 假设接口直接返回 { img: 'data:image/png;base64,...', uuid: '...' }
    // 在 request.ts 拦截器中，我们已处理直接返回 res，而不是 re sdatadata
    captchaBase64.value = res.data.image; 
    verifyKey.value = res.data.uuid;
  } catch (error) {
    console.error('获取验证码失败:', error);
    // ElMessage.error('获取验证码失败，请点击图片重试');
    captchaBase64.value = ''; // 清空以避免显示损坏的图片
  }
};

// 登录处理
const handleLogin = async () => {
  if (!username.value) {
    ElMessage.warning('请输入用户名');
    return;
  }
  if (!password.value) {
    ElMessage.warning('请输入密码');
    return;
  }
  if (!verifyCodeInput.value) {
    ElMessage.warning('请输入验证码');
    return;
  }
  if (!verifyKey.value) {
    ElMessage.error('未能获取验证码标识，请刷新验证码');
    return;
  }

  loading.value = true;
  try {
    const loginData = {
      username: username.value,
      password: password.value,
      verifyCode: verifyCodeInput.value,
      verifyKey: verifyKey.value,
    };
    const res = await loginApi(loginData); // request.ts 中配置，成功时返回 res.data.data
    
    // 假设登录成功后，res (即 res.data.data) 中包含 token 字段
    if (res && res.token) {
      console.log('登录成功，开始设置用户信息:', res);
      console.log('登录响应完整数据结构:', JSON.stringify(res, null, 2));
      
      store.setToken(res.token);
      console.log('Token已设置:', res.token);
      
      if (res.roleId) {
        store.setRoleId(res.roleId);
        console.log('RoleId已设置:', res.roleId);
      } else {
        console.warn('登录响应中没有roleId字段，响应数据:', res);
        console.warn('可能的字段名称:', Object.keys(res));
        
        // 尝试查找可能的角色ID字段
        const possibleRoleFields = ['role_id', 'roleIds', 'userRole', 'roles'];
        let foundRoleId = null;
        
        for (const field of possibleRoleFields) {
          if (res[field]) {
            foundRoleId = Array.isArray(res[field]) ? res[field][0] : res[field];
            console.log(`找到可能的角色字段 ${field}:`, foundRoleId);
            break;
          }
        }
        
        if (foundRoleId) {
          store.setRoleId(foundRoleId);
          console.log('使用备用字段设置RoleId:', foundRoleId);
        } else {
          console.error('未找到任何角色相关字段，用户可能无法访问受限功能');
          // 可以考虑设置一个默认角色ID或者提示用户联系管理员
        }
      }
      
      store.login(username.value); // 调用现有的 store.login 更新用户信息
      console.log('登录状态已更新，store状态:', {
        isLoggedIn: store.isLoggedIn,
        token: store.token,
        roleId: store.roleId
      });
      
      // 获取菜单数据并设置用户登录信息
       try {
         // 确保roleId已设置后再调用queryMenuTree
         if (store.roleId) {
           const menuRes = await queryMenuTree({
             key: '',
             menuType: '',
             status: 'T',
             roleId: store.roleId
           });
           if (menuRes ) {
             userStore.setUserLoginInfo({
               token: res.token,
               employeeId: res.employeeId || res.userId || '',
               avatar: res.avatar || '',
               loginName: username.value,
               actualName: res.actualName || res.realName || username.value,
               phone: res.phone || '',
               departmentId: res.departmentId || '',
               departmentName: res.departmentName || '',
               needUpdatePwdFlag: res.needUpdatePwdFlag || false,
               administratorFlag: res.administratorFlag || false,
               lastLoginIp: res.lastLoginIp || '',
               lastLoginIpRegion: res.lastLoginIpRegion || '',
               lastLoginUserAgent: res.lastLoginUserAgent || '',
               lastLoginTime: res.lastLoginTime || '',
               menuTree: menuRes
             });
             console.log('菜单权限数据已设置');
             
             // 加载用户权限到Pinia store
             await store.loadUserPermissions();
             console.log('用户权限已加载到Pinia store');
           }
         } else {
           console.warn('roleId未设置，跳过菜单数据获取');
         }
       } catch (menuError) {
         console.error('获取菜单数据失败:', menuError);
         // 即使菜单获取失败，也继续登录流程
       }
      
      // ElMessage.success('登录成功!');
      console.log('准备跳转到:', '/viewer-fullscreen');
      router.push('/viewer-fullscreen');
    } else {
      //ElMessage.error(res.data.message || '登录失败，用户名或密码错误，或验证码不正确');
      fetchCaptcha(); // 登录失败，刷新验证码
    }
  } catch (error) {
    console.error('登录请求失败:', error);
   // ElMessage.error(error.message || '登录请求失败，请稍后再试');
    fetchCaptcha(); // 异常也刷新验证码
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCaptcha(); // 组件挂载时获取验证码
});

</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 25%, #90caf9 50%, #64b5f6 75%, #42a5f5 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(66, 165, 245, 0.4) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(144, 202, 249, 0.5) 0%, transparent 55%),
      radial-gradient(circle at 70% 60%, rgba(187, 222, 251, 0.4) 0%, transparent 45%);
    z-index: 0;
    animation: breathe 10s ease-in-out infinite, drift 20s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.2" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: 120% 60%;
    z-index: 0;
    animation: float 8s ease-in-out infinite, wave 12s linear infinite;
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-15px) translateX(5px);
  }
  50% {
    transform: translateY(-25px) translateX(-3px);
  }
  75% {
    transform: translateY(-10px) translateX(8px);
  }
}

@keyframes wave {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-100px);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  33% {
    opacity: 0.7;
    transform: scale(1.08) rotate(1deg);
  }
  66% {
    opacity: 0.9;
    transform: scale(0.95) rotate(-0.5deg);
  }
}

@keyframes drift {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  25% {
    transform: translateX(20px) translateY(-10px);
  }
  50% {
    transform: translateX(-15px) translateY(15px);
  }
  75% {
    transform: translateX(10px) translateY(-5px);
  }
  100% {
    transform: translateX(0px) translateY(0px);
  }
}

@keyframes buttonGlow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  }
  50% {
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.6), 0 0 30px rgba(79, 172, 254, 0.3);
  }
}

@keyframes buttonPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes boxFloat {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.login-box {
  display: flex;
  width: 900px;
  height: 500px;
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
  position: relative;
  animation: boxFloat 6s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
    border-radius: 20px;
    z-index: -1;
  }
}

.login-left {
  flex: 1;
  background: linear-gradient(180deg, rgb(0 144 168 / 34%) 0%
0%
, rgb(255 255 255 / 30%) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.25" d="M0,224L40,213.3C80,203,160,181,240,181.3C320,181,400,203,480,224C560,245,640,267,720,261.3C800,256,880,224,960,218.7C1040,213,1120,235,1200,245.3C1280,256,1360,256,1400,256L1440,256L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320,400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path></svg>');
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: 100%;
    z-index: 0;
    animation: float 8s ease-in-out infinite;
  }
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
}

.title {
  text-align: center;
  
  h1 {
    font-size: 28px;
    margin-bottom: 10px;
    font-family: 'YouSheBiaoTiHei', sans-serif;
  }
  
  p {
    font-size: 16px;
    opacity: 0.8;
    font-family: 'DINCond-Bold', sans-serif;
  }
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  border-left: 1px solid rgba(255, 255, 255, 0.25);
}

.login-form {
  width: 100%;
  
  h2 {
    font-size: 24px;
    margin-bottom: 30px;
    color: #1f2937;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.06);
    font-family: 'YouSheBiaoTiHei', sans-serif;
    
    span {
      font-size: 14px;
      color: rgba(0,0,0,0.45);
      margin-left: 10px;
      font-family: 'DINCond-Bold', sans-serif;
    }
  }
}

.form-item {
  margin-bottom: 20px;
}

.verification {
  display: flex;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 40px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: 'DINCond-Bold', sans-serif;
  font-size: 20px;
  color: #333;
  user-select: none;
  cursor: pointer; /* 添加点击手势 */
}

.captcha-image {
  max-width: 100%;
  max-height: 100%;
}

.remember {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forget-password {
  color: #1976d2;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}

.login-button {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border: none;
  font-size: 16px;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.6), 0 0 30px rgba(79, 172, 254, 0.3);
    animation: buttonPulse 1.5s ease-in-out infinite;
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0px);
    box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.3);
  }
}
</style>