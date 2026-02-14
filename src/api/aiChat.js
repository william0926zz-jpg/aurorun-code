import api from '../utils/request.js';

/**
 * 创建聊天会话
 * @param {string} title 对话标题（可选）
 * @returns {Promise<{code:number,message:string,data:{sessionId:string,title:string}}>}
 */
export const createSession = (title = '新对话') =>
  api.post('/api/ai/chat/sessions', { title });

/**
 * 发送消息（包含心理分析）
 * @param {string} sessionId - 会话ID（必填：后端要求）
 * @param {string} message - 用户消息
 * @returns {Promise} 返回AI回复和心理分析结果
 */
export const sendMessage = (sessionId, message) =>
  api.post('/api/ai/chat/messages', { sessionId, message });

/**
 * 获取会话历史消息
 * @param {string} sessionId - 会话ID
 * @returns {Promise} 返回消息列表和心理分析历史
 */
export const getMessages = (sessionId) =>
  api.get(`/api/ai/chat/sessions/${sessionId}/messages`);

/**
 * 保存用户信息（用于个性化AI回复）
 * @param {Object} userInfo - 用户信息对象
 * @param {string} userInfo.name - 姓名
 * @param {number} userInfo.age - 年龄
 * @param {string} userInfo.visionType - 视力类型（全盲、半盲、低视力、其他）
 * @param {number} userInfo.currentMood - 当前情绪状态 (1-10)
 * @param {string} userInfo.recentConcern - 最近困扰的事情
 * @param {Array<string>} userInfo.supportNeeds - 希望获得的支持
 * @returns {Promise}
 */
export const saveUserInfo = (userInfo) =>
  api.post('/api/ai/chat/user-info', userInfo);



