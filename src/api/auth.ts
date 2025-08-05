import request from '@/utils/request';

/**
 * 获取图形验证码
 */
export function getCaptchaApi() {
  return request({
    url: '/authApi/reservoir/auth/captcha/getBase64', // 使用代理
    method: 'get',
  });
}

/**
 * 登录接口
 * @param data {{username: string, password: string, verifyCode: string, verifyKey: string}}
 */
export function loginApi(data: {username: string, password: string, verifyCode: string, verifyKey: string}) {
  return request({
    url: '/authApi/reservoir/auth/loginAuth/login', // 使用代理
    method: 'post',
    data,
  });
}

/**
 * 修改用户密码接口
 * @param data {{password: string, userIds: string[]}}
 */
export function updateUsersStatusOrPass(data: {password: string, userIds: string[]}) {
  return request({
    url: 'authApi/reservoir/sys/sysAdminUser/updateUsersStatusOrPass',
    method: 'post',
    data,
  });
}