import api from '../utils/request.js';

export const getUserInfo = () => api.get('/api/user/info');

export const updateUserInfo = (payload) => api.put('/api/user/info', payload);

export const changePassword = (oldPassword, newPassword) =>
  api.put('/api/user/password', { oldPassword, newPassword });

// 注销账号（删除账号）
// 注意：如果后端接口不存在（404），会抛出错误，前端会提示用户
export const deleteAccount = () => api.delete('/api/user/account');



