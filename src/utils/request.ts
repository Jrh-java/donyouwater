import axios from 'axios';
import { useStore } from '@/store/pinia'; // 假设你的 Pinia store 路径
import { ElMessage } from 'element-plus';

// 创建 Axios 实例
const service = axios.create({
  baseURL: '/', // 基础URL，代理会处理实际请求地址
  timeout: 50000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const store = useStore();
    if (store.token) {
      config.headers['Authorization'] = `Bearer ${store.token}`; // 或者后端要求的其他 Token 格式
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 如果响应类型是blob，直接返回data
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    
    const res = response.data;
    // 根据您的后端接口实际返回结构进行调整, 一般来说 code 为 0 或 200 代表成功
    // 验证码接口可能直接返回 data 对象，不一定有 code 和 message
    if (response.config.url?.includes('/reservoir/auth/captcha/getBase64')) {
        // 对于验证码接口，我们期望直接返回 data 对象，其中包含 img 和 uuid
        if (res && res.data.image && res.data.uuid) {
            return res; // 直接返回整个响应体，因为验证码接口结构特殊
        }
        // 如果验证码接口返回的不是预期结构，也按错误处理
        console.error('Captcha API Error: Invalid response structure', res);
        return Promise.reject(new Error('获取验证码失败:响应结构错误'));
    }

    // 对于其他接口，我们检查通用的 code
    // 假设 code 为 0 或 200 是成功的标志 (请根据您的后端调整)
    if (res.code !== 200 && res.code !== 0) { 
      console.error('API Error:', res.message || 'Unknown error');
      // 可在此处添加全局错误提示，如 Element Plus 的 Message
      // import { ElMessage } from 'element-plus';
      ElMessage.error(res.data || '操作失败');
      return Promise.reject(new Error(res.message || 'Error'));
    } else {
      return res.data; // 对于成功的业务接口，通常返回 res.data
    }
  },
  (error) => {
    console.error('Response Error:', error);
    
    // 处理401错误 - token过期或无效
    if (error.response && error.response.status === 401) {
      console.log('检测到401错误，token可能已过期');
      
      // 清除本地存储的登录信息
      const store = useStore();
      store.logout();
      
      // 只有在不是登录页面时才跳转到登录页
      if (window.location.pathname !== '/login') {
        console.log('跳转到登录页面');
        // 使用window.location.href而不是router.push，确保完全刷新页面
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }
    
    // import { ElMessage } from 'element-plus';
    // ElMessage.error(error.message || '网络错误，请稍后再试');
    return Promise.reject(error);
  }
);

export default service; 