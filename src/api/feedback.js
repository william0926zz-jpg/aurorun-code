import api from '../utils/request.js';

export const submitFeedback = (payload) => api.post('/api/feedback', payload);



