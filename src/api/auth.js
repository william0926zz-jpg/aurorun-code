import api from '../utils/request.js';

// 用户注册（增加角色：blind / volunteer）
export const register = (account, password, role = 'blind') => {
  return api.post('/api/auth/register', { account, password, role });
};

// 用户登录
export const login = (account, password, remember = false) => {
  return api.post('/api/auth/login', { account, password, remember });
};

// 退出登录
export const logout = () => {
  return api.post('/api/auth/logout');
};



