// 统一请求封装（适配 uni-app）
// 配置说明：
// 1. 开发环境：确保后端服务器运行在 http://localhost:3000
// 2. 生产环境：使用 https://fwthugojqdue.sealosbja.site/
// 3. MOCK模式：当 USE_MOCK = true 时，使用模拟数据，无需后端服务器

// ========== 配置区域 ==========
// 现在默认使用真实后端，如需本地演示可改为 true 启用 Mock
const USE_MOCK = false; // 设置为 true 使用模拟数据，false 使用真实后端

// 根据环境自动切换 BASE_URL
// 注意：小程序体验版和正式版无法访问 localhost，必须使用公网地址
let BASE_URL = 'https://fwthugojqdue.sealosbja.site'; // 默认使用生产环境（更安全）

// 判断运行环境（运行时判断，兼容所有平台）
try {
  const systemInfo = uni.getSystemInfoSync();
  
  // 判断是否为微信小程序环境
  // 在微信小程序中，可以通过 platform 判断
  // - 'devtools': 微信开发者工具
  // - 'ios' 或 'android': 真机、体验版、正式版
  if (systemInfo.platform === 'devtools') {
    // 微信开发者工具 - 使用本地后端（已配置 API Key）
    // 注意：微信开发者工具无法访问 localhost，需要使用局域网 IP
    // 后端已配置为监听 0.0.0.0:3000，可以通过局域网 IP 访问
    BASE_URL = 'http://192.168.101.200:3000';
    console.log('[API配置] 微信开发者工具环境，使用本地后端 API 地址（局域网 IP，已配置 API Key）');
  } else if (systemInfo.platform === 'ios' || systemInfo.platform === 'android') {
    // 真机、体验版、正式版 - 必须使用公网地址
    BASE_URL = 'https://fwthugojqdue.sealosbja.site';
    console.log('[API配置] 小程序真机/体验版/正式版环境，使用生产环境 API 地址');
  } else {
    // H5 或其他环境：根据域名判断
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
        // 本地开发环境 - 使用本地后端（如果本地后端在运行）
        // 如果本地后端未运行，可以手动切换到生产环境
        BASE_URL = 'http://localhost:3000';
        console.log('[API配置] 本地 H5 环境，使用本地后端 API 地址');
      } else {
        // 生产环境
        BASE_URL = 'https://fwthugojqdue.sealosbja.site';
        console.log('[API配置] 生产 H5 环境，使用生产环境 API 地址');
      }
    }
  }
} catch (e) {
  // 如果判断失败，默认使用生产环境（更安全）
  console.warn('[API配置] 无法判断运行环境，使用生产环境 API 地址', e);
  BASE_URL = 'https://fwthugojqdue.sealosbja.site';
}

// 开发调试：如果需要强制使用本地地址，取消下面的注释
// 临时使用本地后端（用于测试，确保本地后端正在运行）
// 微信开发者工具需要使用局域网 IP，不能使用 localhost
BASE_URL = 'http://192.168.101.200:3000';
console.log('[API配置] 强制使用局域网 IP:', BASE_URL);

// 开发调试：如果需要强制使用生产地址，取消下面的注释
// BASE_URL = 'https://fwthugojqdue.sealosbja.site';

console.log('[API配置] 当前 API 地址:', BASE_URL);
// ==============================

// Mock 数据生成器
const mockData = {
  // 模拟注册
  register: (account, password, role = 'blind') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '注册成功',
          data: {
            userId: 'mock_user_' + Date.now(),
            token: 'mock_token_' + Date.now(),
            refreshToken: 'mock_refresh_' + Date.now(),
            role,
          },
        });
      }, 800);
    });
  },

  // 模拟登录
  login: (account, password, remember) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            userId: 'mock_user_123456',
            token: 'mock_token_' + Date.now(),
            refreshToken: 'mock_refresh_' + Date.now(),
            userInfo: {
              nickname: account.includes('@') ? account.split('@')[0] : '用户' + account.slice(-4),
              avatar: '',
            },
            // mock 环境下尝试读取本地已保存的角色
            role: (() => {
              try {
                const storedByAccount = uni.getStorageSync('userRole_' + account);
                const storedGlobal = uni.getStorageSync('userRole');
                return storedByAccount || storedGlobal || 'blind';
              } catch (e) {
                return 'blind';
              }
            })(),
          },
        });
      }, 800);
    });
  },

  // 模拟退出
  logout: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '退出成功',
        });
      }, 300);
    });
  },

  // 模拟AI聊天
  sendMessage: (sessionId, message) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 简单的回复逻辑
        let aiResponse = '';
        const msg = message.toLowerCase();
        
        if (msg.includes('你好') || msg.includes('hello') || msg.includes('hi')) {
          aiResponse = '你好！我是小暖，很高兴和你聊天。有什么想和我分享的吗？';
        } else if (msg.includes('焦虑') || msg.includes('担心') || msg.includes('紧张')) {
          aiResponse = '我理解你的感受。焦虑是很正常的情绪反应。你可以试着深呼吸，或者告诉我更多关于你现在的感受，我们一起面对。';
        } else if (msg.includes('难过') || msg.includes('伤心') || msg.includes('不开心')) {
          aiResponse = '听到你这么说，我为你感到心疼。难过的时候，有人陪伴是很重要的。我在这里陪着你，你可以慢慢说给我听。';
        } else if (msg.includes('谢谢') || msg.includes('感谢')) {
          aiResponse = '不客气，能帮到你我很开心。记住，你并不孤单，我会一直在这里支持你。';
        } else if (msg.includes('帮助') || msg.includes('怎么办')) {
          aiResponse = '我很愿意帮助你。虽然我不能直接解决所有问题，但我可以倾听你的想法，和你一起思考。你可以详细说说你的情况吗？';
        } else {
          // 默认回复
          const responses = [
            '我理解你的感受。能告诉我更多细节吗？',
            '听起来你正在经历一些困难。我在这里陪着你，你可以慢慢说。',
            '感谢你愿意和我分享。每个人的感受都很重要，你的也不例外。',
            '我明白这不容易。让我们一起面对，好吗？',
            '你的感受我听到了。无论发生什么，你都不是一个人。',
          ];
          aiResponse = responses[Math.floor(Math.random() * responses.length)];
        }

        resolve({
          code: 200,
          message: '发送成功',
          data: {
            sessionId: sessionId || 'session_' + Date.now(),
            userMessage: message,
            aiResponse: aiResponse,
            analysis: {
              emotionalState: '平静',
              riskLevel: '低',
              psychologicalIssues: [],
              keyConcerns: [],
              suggestedApproach: '继续倾听和陪伴',
              supportiveKeywords: ['理解', '陪伴', '支持'],
            },
          },
        });
      }, 1500); // 模拟网络延迟
    });
  },

  // 个人信息对比函数
  compareUserInfo: (myInfo, otherInfo) => {
    const comparison = {};
    let totalScore = 0;
    let compareCount = 0;

    // 年龄对比
    if (myInfo.age && otherInfo.age) {
      const ageDiff = Math.abs(parseInt(myInfo.age) - parseInt(otherInfo.age));
      const ageMatch = Math.max(0, 1 - ageDiff / 20); // 年龄差越小匹配度越高
      comparison.age = {
        mine: myInfo.age,
        other: otherInfo.age,
        match: ageMatch,
      };
      totalScore += ageMatch;
      compareCount++;
    }

    // 身高对比
    if (myInfo.height && otherInfo.height) {
      const heightDiff = Math.abs(parseInt(myInfo.height) - parseInt(otherInfo.height));
      const heightMatch = Math.max(0, 1 - heightDiff / 30); // 身高差越小匹配度越高
      comparison.height = {
        mine: myInfo.height,
        other: otherInfo.height,
        match: heightMatch,
      };
      totalScore += heightMatch;
      compareCount++;
    }

    // 体重对比
    if (myInfo.weight && otherInfo.weight) {
      const weightDiff = Math.abs(parseInt(myInfo.weight) - parseInt(otherInfo.weight));
      const weightMatch = Math.max(0, 1 - weightDiff / 20); // 体重差越小匹配度越高
      comparison.weight = {
        mine: myInfo.weight,
        other: otherInfo.weight,
        match: weightMatch,
      };
      totalScore += weightMatch;
      compareCount++;
    }

    // 视力类型对比
    if (myInfo.visionType && otherInfo.visionType) {
      const visionMatch = myInfo.visionType === otherInfo.visionType ? 1 : 0.5; // 相同类型匹配度更高
      comparison.visionType = {
        mine: myInfo.visionType,
        other: otherInfo.visionType,
        match: visionMatch,
      };
      totalScore += visionMatch;
      compareCount++;
    }

    // 跑步经验对比（简单文本相似度）
    if (myInfo.experience && otherInfo.experience) {
      const exp1 = myInfo.experience.toLowerCase();
      const exp2 = otherInfo.experience.toLowerCase();
      // 简单的关键词匹配
      const keywords1 = exp1.match(/\d+/g) || [];
      const keywords2 = exp2.match(/\d+/g) || [];
      let expMatch = 0.3; // 基础匹配度
      if (keywords1.length > 0 && keywords2.length > 0) {
        // 如果有数字，比较数字范围
        const num1 = parseInt(keywords1[0]) || 0;
        const num2 = parseInt(keywords2[0]) || 0;
        const numDiff = Math.abs(num1 - num2);
        expMatch = Math.max(0.3, 1 - numDiff / 10);
      }
      comparison.experience = {
        mine: myInfo.experience,
        other: otherInfo.experience,
        match: expMatch,
      };
      totalScore += expMatch;
      compareCount++;
    }

    // 跑步地区对比
    if (myInfo.runningArea && otherInfo.runningArea) {
      const area1 = myInfo.runningArea.toLowerCase();
      const area2 = otherInfo.runningArea.toLowerCase();
      // 简单的文本匹配
      const areaMatch = area1.includes(area2) || area2.includes(area1) ? 0.9 : 0.3;
      comparison.runningArea = {
        mine: myInfo.runningArea,
        other: otherInfo.runningArea,
        match: areaMatch,
      };
      totalScore += areaMatch;
      compareCount++;
    }

    // 计算总体匹配度
    const matchScore = compareCount > 0 ? Math.round((totalScore / compareCount) * 100) : 0;

    return {
      comparison,
      matchScore,
    };
  },

  // 模拟匹配
  startMatch: (preferences, myProfile) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟匹配到的用户信息
        const mockMatchedUser = {
          userId: 'matched_user_' + Date.now(),
          nickname: '跑步伙伴' + Math.floor(Math.random() * 1000),
          avatar: '',
          profile: {
            age: String(20 + Math.floor(Math.random() * 20)),
            height: String(160 + Math.floor(Math.random() * 20)),
            weight: String(50 + Math.floor(Math.random() * 20)),
            visionType: Math.random() > 0.5 ? 'half' : 'full',
            experience: `${Math.floor(Math.random() * 5) + 1}年到${Math.floor(Math.random() * 5) + 3}年`,
            runningArea: ['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)],
            remarks: '',
          },
        };

        // 进行个人信息对比
        const compareResult = mockData.compareUserInfo(myProfile, mockMatchedUser.profile);

        resolve({
          code: 200,
          message: '匹配成功',
          data: {
            matchId: 'match_' + Date.now(),
            matchedUser: {
              userId: mockMatchedUser.userId,
              nickname: mockMatchedUser.nickname,
              avatar: mockMatchedUser.avatar,
            },
            matchScore: compareResult.matchScore,
            comparison: compareResult.comparison,
          },
        });
      }, 2000); // 模拟匹配延迟
    });
  },
};

class ApiRequest {
  constructor() {
    this.baseURL = BASE_URL;
    this.useMock = USE_MOCK;
  }

  // Token 存取使用 uni 存储，兼容小程序和 H5
  getToken() {
    try {
      return uni.getStorageSync('token') || '';
    } catch (e) {
      return '';
    }
  }

  setToken(token) {
    try {
      uni.setStorageSync('token', token || '');
    } catch (e) {}
  }

  getRefreshToken() {
    try {
      return uni.getStorageSync('refreshToken') || '';
    } catch (e) {
      return '';
    }
  }

  setRefreshToken(refreshToken) {
    try {
      uni.setStorageSync('refreshToken', refreshToken || '');
    } catch (e) {}
  }

  // 核心请求方法：基于 uni.request
  request(url, { method = 'GET', data = {}, header = {} } = {}) {
    // 更新 baseURL（因为 BASE_URL 可能在运行时根据环境变化）
    this.baseURL = BASE_URL;
    
    // AI 聊天相关接口：即使 mock 模式也调用真实后端（需要真实 AI 回复）
    // 这里覆盖 /api/ai/chat 下的所有接口，避免 sessions/user-info 等仍走 mock 或缺少统一处理
    const isAiChat = url.startsWith('/api/ai/chat/');
    
    // Mock 模式处理（AI聊天接口除外）
    if (this.useMock && !isAiChat) {
      return this.handleMockRequest(url, method, data);
    }

    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...header,
    };

    // 避免 H5 / 代理层对请求做缓存（尤其是调试期间）
    // 对 AI 聊天接口额外加 no-cache + 请求 ID，便于后端排查“是否命中旧实例”
    if (isAiChat) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
      headers['X-Request-Id'] = `ai_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: this.baseURL + url,
        method,
        data,
        header: headers,
        success: (res) => {
          // HTTP 状态码检查
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const respData = res.data || {};

            // 附加最小可观测信息（不影响后端返回结构；仅用于前端调试）
            // 注意：不要在业务逻辑里依赖 __http
            try {
              respData.__http = {
                statusCode: res.statusCode,
                requestUrl: this.baseURL + url,
                requestId: headers['X-Request-Id'] || '',
              };
            } catch (e) {}

            // 如果未授权并且有 refreshToken，尝试刷新
            if (respData.code === 401 && this.getRefreshToken()) {
              this.refreshToken()
                .then((ok) => {
                  if (ok) {
                    // 重新请求一次
                    this.request(url, { method, data, header })
                      .then(resolve)
                      .catch(reject);
                  } else {
                    // 刷新失败，清除无效的token
                    this.setToken('');
                    this.setRefreshToken('');
                    resolve(respData);
                  }
                })
                .catch(() => {
                  // 刷新失败，清除无效的token
                  this.setToken('');
                  this.setRefreshToken('');
                  resolve(respData);
                });
            } else if (respData.code === 401) {
              // 401错误且没有refreshToken，清除token
              this.setToken('');
              this.setRefreshToken('');
              resolve(respData);
            } else {
              resolve(respData);
            }
          } else {
            // HTTP 错误状态码（包括 401、403、404、500 等）
            // 尝试从响应体中提取错误信息
            const errorData = res.data || {};
            reject({
              errMsg: `请求失败: HTTP ${res.statusCode}`,
              statusCode: res.statusCode,
              data: errorData,
              message: errorData.message || errorData.error || `请求失败: HTTP ${res.statusCode}`,
            });
          }
        },
        fail: (err) => {
          // 网络错误或其他错误
          // 对于登录/注册接口，如果连接失败，自动降级到 mock 数据
          const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register');
          if (isAuthEndpoint && (err.errMsg && (err.errMsg.includes('CONNECTION') || err.errMsg.includes('fail')))) {
            console.warn('[API] 后端连接失败，登录/注册接口自动使用 Mock 数据');
            return this.handleMockRequest(url, method, data)
              .then(resolve)
              .catch(reject);
          }
          
          reject({
            errMsg: err.errMsg || '网络请求失败',
            ...err,
          });
        },
      });
    });
  }

  // Mock 请求处理
  handleMockRequest(url, method, data) {
    return new Promise((resolve, reject) => {
      // 注册接口
      if (url === '/api/auth/register' && method === 'POST') {
        const { account, password, role = 'blind' } = data;
        if (!account || !password) {
          resolve({
            code: 400,
            message: '账号和密码不能为空',
          });
          return;
        }
        if (password.length < 6) {
          resolve({
            code: 400,
            message: '密码长度至少8位',
          });
          return;
        }
        mockData.register(account, password, role).then(resolve);
        return;
      }

      // 登录接口
      if (url === '/api/auth/login' && method === 'POST') {
        const { account, password } = data;
        if (!account || !password) {
          resolve({
            code: 400,
            message: '账号和密码不能为空',
          });
          return;
        }
        // 模拟账号密码错误
        if (password === 'wrong') {
          resolve({
            code: 401,
            message: '账号或密码错误',
          });
          return;
        }
        mockData.login(account, password, data.remember).then(resolve);
        return;
      }

      // 退出接口
      if (url === '/api/auth/logout' && method === 'POST') {
        mockData.logout().then(resolve);
        return;
      }

      // 删除账号接口
      if (url === '/api/user/account' && method === 'DELETE') {
        // 模拟删除账号成功
        setTimeout(() => {
          resolve({
            code: 200,
            message: '账号已删除',
          });
        }, 500);
        return;
      }

      // 匹配接口
      if (url === '/api/matches/start' && method === 'POST') {
        // 获取当前用户的个人信息
        try {
          const userProfileStr = uni.getStorageSync('userProfile');
          if (!userProfileStr) {
            resolve({
              code: 400,
              message: '请先完善个人信息',
            });
            return;
          }
          const myProfile = JSON.parse(userProfileStr);
          mockData.startMatch(data.preferences || {}, myProfile).then(resolve);
        } catch (e) {
          resolve({
            code: 400,
            message: '获取用户信息失败',
          });
        }
        return;
      }

      // 匹配列表接口
      if (url === '/api/matches' && method === 'GET') {
        resolve({
          code: 200,
          message: '获取成功',
          data: {
            list: [],
            total: 0,
            page: data.page || 1,
            pageSize: data.pageSize || 10,
          },
        });
        return;
      }

      // 其他接口返回模拟数据
      resolve({
        code: 200,
        message: 'Mock 模式：此接口需要真实后端支持',
        data: {},
      });
    });
  }

  // 刷新 Token
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await this.request('/api/auth/refresh', {
        method: 'POST',
        data: { refreshToken },
        header: { Authorization: '' }, // 刷新接口不需要旧 token
      });

      if (res.code === 200 && res.data) {
        this.setToken(res.data.token);
        this.setRefreshToken(res.data.refreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  get(url, params = {}) {
    return this.request(url, { method: 'GET', data: params });
  }

  post(url, data = {}) {
    return this.request(url, { method: 'POST', data });
  }

  put(url, data = {}) {
    return this.request(url, { method: 'PUT', data });
  }

  delete(url, data = {}) {
    return this.request(url, { method: 'DELETE', data });
  }
}

export default new ApiRequest();
