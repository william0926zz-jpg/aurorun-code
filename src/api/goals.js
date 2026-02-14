import api from '../utils/request.js';

export const getGoals = (page = 1, pageSize = 10) =>
  api.get('/api/goals', { page, pageSize });

export const createGoal = (payload) => api.post('/api/goals', payload);

export const updateGoal = (goalId, payload) =>
  api.put(`/api/goals/${goalId}`, payload);

export const deleteGoal = (goalId) => api.delete(`/api/goals/${goalId}`);



