// 专门用于服务端的身份验证设置
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  // 服务器端的认证实现
  return {
    provide: {
      auth: {
        isLoggedIn: () => false,
        getCurrentUser: () => ({ userId: null, nickname: null }),
        logout: () => {}
      }
    }
  };
}); 