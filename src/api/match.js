import api from '../utils/request.js';

export const getMatchList = (page = 1, pageSize = 10) =>
  api.get('/api/matches', { page, pageSize });

export const startMatch = (preferences = {}) =>
  api.post('/api/matches/start', { preferences });



