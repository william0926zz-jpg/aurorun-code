<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back" @tap="goBack">
        <text>&lt;</text>
      </view>
      <view class="header-content">
        <text class="contact-name">小暖</text>
        <view class="header-lines">
          <view class="line line-cyan"></view>
          <view class="line line-orange"></view>
        </view>
      </view>
      <view class="header-actions">
        <text class="icon" @tap="showChatOptions">💬</text>
        <text class="icon" @tap="scrollToBottom">▼</text>
        <text class="icon" @tap="toggleSidebar">📋</text>
        <text class="icon" @tap="showMoreOptions">⋯</text>
      </view>
    </view>

    <!-- 侧边栏：健康信息收集 -->
    <view class="sidebar" :class="{ 'sidebar-open': sidebarVisible }">
      <view class="sidebar-overlay" @tap="toggleSidebar"></view>
      <view class="sidebar-content">
        <view class="sidebar-header">
          <text class="sidebar-title">每日健康打卡</text>
          <text class="sidebar-close" @tap="toggleSidebar">✕</text>
        </view>
        <scroll-view class="sidebar-body" scroll-y>
          <view class="form-group">
            <text class="form-label">姓名</text>
            <input
              v-model="userInfo.name"
              class="form-input"
              placeholder="请输入您的姓名"
              placeholder-class="form-placeholder"
            />
          </view>
          <view class="form-group">
            <text class="form-label">年龄</text>
            <input
              v-model.number="userInfo.age"
              type="number"
              class="form-input"
              placeholder="请输入年龄"
              placeholder-class="form-placeholder"
            />
          </view>
          <view class="form-group">
            <text class="form-label">今日主要症状</text>
            <textarea
              v-model="userInfo.symptom"
              class="form-textarea"
              placeholder="请描述您今天的主要症状或困扰"
              placeholder-class="form-placeholder"
              maxlength="200"
            />
          </view>
          <view class="form-group">
            <text class="form-label">心情状态</text>
            <view class="mood-slider-wrapper">
              <text class="mood-label">{{ userInfo.mood === 1 ? '很差' : userInfo.mood === 10 ? '很好' : '一般' }}</text>
              <slider
                :value="userInfo.mood"
                min="1"
                max="10"
                step="1"
                activeColor="#5ce1e6"
                backgroundColor="rgba(255,255,255,0.1)"
                block-color="#5ce1e6"
                @change="onMoodChange"
              />
              <view class="mood-scale">
                <text class="mood-scale-item">1</text>
                <text class="mood-scale-item">5</text>
                <text class="mood-scale-item">10</text>
              </view>
            </view>
          </view>
          <view class="form-group">
            <text class="form-label">最近困扰的事情</text>
            <textarea
              v-model="userInfo.recentConcern"
              class="form-textarea"
              placeholder="请描述最近困扰您的事情"
              placeholder-class="form-placeholder"
              maxlength="300"
            />
          </view>
          <button class="save-btn" @tap="saveUserInfo" :disabled="savingInfo">
            {{ savingInfo ? '保存中...' : '保存信息' }}
          </button>
          <view v-if="userInfoSaved" class="save-success">
            <text>✓ 信息已保存</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="messages" scroll-y :scroll-top="scrollTop" scroll-with-animation>
      <view v-for="(msg, index) in messages" :key="index" class="message-wrapper">
        <!-- 时间戳 -->
        <view v-if="msg.showTime" class="timestamp">
          <text>{{ msg.time }}</text>
        </view>

        <!-- AI消息（左侧） -->
        <view v-if="msg.role === 'assistant'" class="message-row message-left">
          <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
          <view class="message-bubble bubble-left">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>

        <!-- 用户消息（右侧） -->
        <view v-else class="message-row message-right">
          <view class="message-bubble bubble-right">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="message-row message-left">
        <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
        <view class="message-bubble bubble-left">
          <text class="message-text">小暖正在思考...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="input-bar">
      <view class="input-icons">
        <text class="icon" @tap="showEmoji">😊</text>
        <text class="icon" @tap="showStickers">📦</text>
        <text class="icon" @tap="selectFile">📁</text>
        <text class="icon" @tap="showMoreInput">✂️</text>
        <text class="icon" @tap="scrollToBottom">▼</text>
      </view>
      <view class="input-field-wrapper">
        <input
          v-model="inputText"
          class="input-field"
          placeholder="告诉我你的想法和感受..."
          placeholder-class="placeholder"
          @confirm="sendMessage"
          :disabled="loading"
        />
      </view>
      <view class="action-icons">
        <text class="icon" @tap="makeCall">📞</text>
        <text class="icon" @tap="makeVideoCall">📹</text>
      </view>
    </view>
  </view>
</template>

<script>
import { sendMessage as sendChatMessage, createSession, saveUserInfo as saveUserInfoAPI } from '@/api/aiChat.js';
import api from '@/utils/request.js';

export default {
  data() {
    return {
      messages: [],
      inputText: '',
      loading: false,
      sessionId: null,
      scrollTop: 0,
      sidebarVisible: false,
      userInfo: {
        name: '',
        age: null,
        symptom: '',
        mood: 5,
        recentConcern: '',
      },
      savingInfo: false,
      userInfoSaved: false,
    };
  },
  async onLoad() {
    // 检查是否已登录
    const token = api.getToken();
    if (!token) {
      uni.showModal({
        title: '需要登录',
        content: '使用AI聊天功能需要先登录，是否前往登录页面？',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({ url: '/pages/login/login' });
          } else {
            // 取消则返回上一页
            uni.navigateBack();
          }
        },
      });
      return;
    }

    // 验证token是否有效（通过健康检查接口）
    try {
      const healthRes = await api.get('/health');
      console.log('AI调试 /health 响应:', healthRes);
      if (healthRes && healthRes.__http) {
        console.log('AI调试 命中后端URL:', healthRes.__http.requestUrl);
        console.log('AI调试 RequestId:', healthRes.__http.requestId);
      }
    } catch (e) {
      console.warn('AI调试 /health 失败:', e);
      // 如果是401错误，说明token无效，清除token并提示重新登录
      if (e.statusCode === 401 || e.code === 401) {
        // 清除无效的token
        api.setToken('');
        api.setRefreshToken('');
        uni.showModal({
          title: '登录已过期',
          content: '您的登录已过期或token无效，请重新登录后使用AI聊天功能。',
          confirmText: '去登录',
          cancelText: '取消',
          showCancel: true,
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({ url: '/pages/login/login' });
            } else {
              uni.navigateBack();
            }
          },
        });
        return;
      }
    }
    
    // 初始化欢迎消息
    this.addMessage('assistant', '你好，我是小暖，你的心理辅导伙伴。有什么想和我聊聊的吗？', true);
  },
  methods: {
    async sendMessage() {
      if (!this.inputText.trim() || this.loading) return;

      // 检查Token是否存在
      const token = api.getToken();
      if (!token) {
        uni.showModal({
          title: '登录已过期',
          content: '您的登录已过期，请重新登录后使用AI聊天功能。',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({ url: '/pages/login/login' });
            }
          },
        });
        return;
      }

      const userMessage = this.inputText.trim();
      this.inputText = '';

      // 添加用户消息
      this.addMessage('user', userMessage, true);
      this.scrollToBottom();

      // 显示加载状态
      this.loading = true;

      try {
        // 如果还没有会话，先创建会话
        if (!this.sessionId) {
          try {
            const createRes = await createSession('与小暖的对话');
            
            // 检查响应状态 - 只有当 code 为 200 且有 sessionId 时才认为成功
            if (createRes.code === 200 && createRes.data && createRes.data.sessionId) {
              this.sessionId = createRes.data.sessionId;
            } else {
            // 创建会话失败，提取错误信息
            const errorMsg = createRes.message || createRes.data?.message || '创建会话失败';
            
            // 如果是401错误（HTTP状态码或响应体code），需要重新登录
            if (createRes.code === 401 || createRes.statusCode === 401) {
              uni.showModal({
                title: '登录已过期',
                content: '您的登录已过期，请重新登录后继续使用AI聊天功能。',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    // 清除本地token
                    api.setToken('');
                    api.setRefreshToken('');
                    uni.reLaunch({ url: '/pages/login/login' });
                  }
                },
              });
              return;
            }
            
            // 其他错误，显示错误消息（但不作为AI消息显示）
            uni.showToast({
              title: errorMsg,
              icon: 'none',
              duration: 3000,
            });
            this.loading = false;
            return; // 停止执行，不继续发送消息
          }
          } catch (createError) {
            // 创建会话时发生网络错误
            console.error('创建会话失败:', createError);
            
            // 检查是否是 401 错误（token 无效或过期）
            if (createError.statusCode === 401 || createError.code === 401 || 
                (createError.message && createError.message.includes('Token无效')) ||
                (createError.message && createError.message.includes('已过期'))) {
              uni.showModal({
                title: '登录已过期',
                content: '您的登录已过期，请重新登录后继续使用AI聊天功能。',
                confirmText: '去登录',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    // 清除本地token
                    api.setToken('');
                    api.setRefreshToken('');
                    uni.reLaunch({ url: '/pages/login/login' });
                  }
                },
              });
              this.loading = false;
              return;
            }
            
            // 检查是否是连接错误
            if (createError.errMsg && (createError.errMsg.includes('EMPTY_RESPONSE') || createError.errMsg.includes('request:fail'))) {
              uni.showModal({
                title: '连接失败',
                content: '无法连接到后端服务器，请检查后端服务是否正在运行。',
                showCancel: false,
                confirmText: '我知道了',
              });
            } else {
              // 其他错误
              const errorMsg = createError.message || createError.errMsg || '创建会话失败，请稍后重试';
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 3000,
              });
            }
            this.loading = false;
            return;
          }
        }

        // 调用发送消息 API（此时 sessionId 一定存在）
        const result = await sendChatMessage(this.sessionId, userMessage);

        // 调试：打印完整响应（开发环境）
        console.log('AI聊天响应:', {
          code: result.code,
          message: result.message,
          data: result.data,
          fullResult: result
        });

        // 检查是否是真正的成功响应（code 为 200）
        console.log('检查响应结果:', {
          code: result.code,
          hasData: !!result.data,
          dataType: typeof result.data,
          data: result.data
        });
        
        if (result.code === 200 && result.data) {
          // 尝试多种可能的字段名获取 AI 回复
          const aiResponse = result.data.aiResponse || 
                            result.data.response || 
                            result.data.content || 
                            result.data.text ||
                            result.data.message ||
                            '';
          
          // 调试：打印解析后的AI回复
          console.log('解析后的AI回复:', {
            aiResponse: aiResponse,
            hasResponse: !!aiResponse,
            aiResponseLength: aiResponse ? aiResponse.length : 0,
            dataKeys: Object.keys(result.data || {}),
            rawData: result.data
          });
          
          // 检查是否是错误消息（后端可能返回 200 但内容是错误消息）
          const responseText = aiResponse ? aiResponse.toLowerCase() : '';
          const isErrorMessage = responseText && (
            (responseText.includes('抱歉') && responseText.includes('暂不可用')) ||
            (responseText.includes('暂不可用') && (responseText.includes('api') || responseText.includes('key'))) ||
            (responseText.includes('请确保已配置') && (responseText.includes('环境变量') || responseText.includes('openai_api_key'))) ||
            (responseText.includes('无法回复') && responseText.includes('稍后再试')) ||
            (responseText.includes('openai_api_key') && (responseText.includes('未配置') || responseText.includes('环境变量'))) ||
            (responseText.includes('api key') && (responseText.includes('not') || responseText.includes('missing') || responseText.includes('未配置'))) ||
            (responseText.includes('api服务') && responseText.includes('不可用'))
          );

          // 如果有有效的 AI 回复且不是错误消息，则显示
          if (aiResponse && !isErrorMessage) {
            console.log('✅ AI回复有效，准备添加到消息列表');
            console.log('准备添加AI回复到消息列表:', aiResponse);
            // 保存sessionId（如果存在）
            if (result.data.sessionId) {
              this.sessionId = result.data.sessionId;
            }

            // 添加AI回复
            this.addMessage('assistant', aiResponse, true);

            // 可选：显示心理分析结果（调试用）
            if (result.data.analysis) {
              console.log('心理分析:', result.data.analysis);
            }
            
            // 成功处理完成，直接返回
            return;
          } else if (isErrorMessage) {
            // 是错误消息，但 code 是 200，说明后端返回了错误内容
            console.warn('⚠️ 检测到错误消息:', aiResponse);
            const errorMsg = aiResponse || 'AI服务暂不可用';
            
            // 检查是否是 API Key 配置错误
            const isApiKeyError = errorMsg.includes('OPENAI_API_KEY') || 
                                 (errorMsg.includes('API') && errorMsg.includes('Key')) ||
                                 errorMsg.includes('环境变量');
            
            if (isApiKeyError) {
              console.error('❌ API Key配置错误，显示错误提示');
              // 清除 loading 状态
              this.loading = false;
              uni.showModal({
                title: 'AI服务配置问题',
                content: '后端服务器未配置 OpenAI API Key。\n\n请检查后端服务器环境变量配置（OPENAI_API_KEY）。\n\n如果已配置但仍显示此错误，请查看后端日志获取详细信息。\n\n提示：如果使用本地开发，请确保本地后端服务正在运行并配置了 API Key。',
                showCancel: false,
                confirmText: '我知道了',
              });
              return;
            } else {
              // 清除 loading 状态
              this.loading = false;
              uni.showToast({
                title: errorMsg,
                icon: 'none',
                duration: 3000,
              });
              return;
            }
          } else {
            // code 是 200，但没有有效的 aiResponse
            console.warn('后端返回成功，但缺少 AI 回复内容:', {
              result: result,
              data: result.data,
              aiResponse: aiResponse,
              isErrorMessage: isErrorMessage
            });
            uni.showToast({
              title: 'AI回复为空，请重试',
              icon: 'none',
              duration: 2000,
            });
            return;
          }
        } else {
          // code 不是 200，或者 result.data 不存在
          console.warn('响应不是成功状态或缺少data:', {
            code: result.code,
            hasData: !!result.data,
            result: result
          });
          // code 不是 200，处理错误
          // 发送消息失败，提取错误信息
          let errorMsg = result.message || result.data?.message || aiResponse || '发送失败，请稍后重试';
          
          // 如果是401错误，需要重新登录
          if (result.code === 401 || result.statusCode === 401) {
            uni.showModal({
              title: '登录已过期',
              content: '您的登录已过期，请重新登录后继续使用AI聊天功能。',
              confirmText: '去登录',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  // 清除本地token
                  api.setToken('');
                  api.setRefreshToken('');
                  uni.reLaunch({ url: '/pages/login/login' });
                }
              },
            });
            return;
          }
          
          // 只在明确是 API Key 配置错误时才显示特殊提示
          // 只有当错误消息明确提到 API Key 配置问题时才显示
          const isApiKeyError = errorMsg && (
            (errorMsg.includes('OPENAI_API_KEY') && errorMsg.includes('未配置')) ||
            (errorMsg.includes('OPENAI_API_KEY') && errorMsg.includes('环境变量')) ||
            (errorMsg.includes('请确保已配置') && errorMsg.includes('OPENAI_API_KEY')) ||
            (result.code === 500 && errorMsg.includes('API') && errorMsg.includes('Key') && errorMsg.includes('未配置'))
          );
          
          if (isApiKeyError) {
            uni.showModal({
              title: 'AI服务配置问题',
              content: '后端服务器未配置 OpenAI API Key。\n\n请检查后端服务器环境变量配置（OPENAI_API_KEY）。\n\n如果已配置但仍显示此错误，请查看后端日志获取详细信息。',
              showCancel: false,
              confirmText: '我知道了',
            });
            return;
          }
          
          // 其他错误，显示详细错误信息
          console.error('AI聊天错误详情:', {
            code: result.code,
            statusCode: result.statusCode,
            message: errorMsg,
            data: result.data
          });
          
          uni.showToast({
            title: errorMsg.length > 50 ? errorMsg.substring(0, 50) + '...' : errorMsg,
            icon: 'none',
            duration: 4000,
          });
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        console.error('错误详情:', {
          errMsg: error.errMsg,
          statusCode: error.statusCode,
          data: error.data,
          message: error.message
        });
        
        // 处理空响应错误（ERR_EMPTY_RESPONSE）
        if (error.errMsg && (error.errMsg.includes('EMPTY_RESPONSE') || error.errMsg.includes('request:fail'))) {
          uni.showModal({
            title: '连接失败',
            content: '无法连接到后端服务器，请检查：\n1. 后端服务是否正在运行\n2. 网络连接是否正常\n3. 稍后重试',
            showCancel: false,
            confirmText: '我知道了',
          });
          this.loading = false;
          return;
        }
        
        // 优先显示后端返回的 message（如参数缺失、鉴权失败等）
        let errorMsg = error.message || (error.data && error.data.message) || '';

        // HTTP 400/401/403 等明确的业务错误
        if (!errorMsg && error.statusCode) {
          if (error.statusCode === 400) {
            errorMsg = '请求参数不正确或缺少必要字段';
          } else if (error.statusCode === 401) {
            // 401 未授权：可能是token过期或无效，提示重新登录
            uni.showModal({
              title: '登录已过期',
              content: '您的登录已过期，请重新登录后继续使用AI聊天功能。',
              confirmText: '去登录',
              cancelText: '取消',
              success: (res) => {
                if (res.confirm) {
                  // 清除本地token
                  api.setToken('');
                  api.setRefreshToken('');
                  uni.reLaunch({ url: '/pages/login/login' });
                }
              },
            });
            return; // 直接返回，不再显示toast
          } else if (error.statusCode === 403) {
            errorMsg = '没有权限访问该功能';
          } else if (error.statusCode === 500) {
            errorMsg = '服务器错误，请稍后再试';
          }
        }

        // 网络层错误兜底
        if (!errorMsg && error.errMsg && error.errMsg.includes('fail')) {
          // 检查是否是域名解析失败或SSL错误
          if (error.errMsg.includes('SSL') || error.errMsg.includes('certificate')) {
            errorMsg = 'SSL证书验证失败，请检查网络连接';
          } else if (error.errMsg.includes('timeout') || error.errMsg.includes('超时')) {
            errorMsg = '请求超时，AI回复可能需要更长时间，请稍后重试';
          } else {
            errorMsg = '无法连接到后端服务器，请检查网络连接或稍后重试';
          }
        } else if (!errorMsg && error.errMsg && error.errMsg.includes('timeout')) {
          errorMsg = '请求超时，AI回复可能需要更长时间，请稍后重试';
        }

        if (!errorMsg) {
          errorMsg = '网络错误，请稍后再试';
        }
        
        // 显示错误提示（但不作为AI消息显示）
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },

    addMessage(role, content, showTime = false) {
      console.log('addMessage 被调用:', { role, content: content.substring(0, 50) + '...', showTime, messagesCount: this.messages.length });
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      this.messages.push({
        role,
        content,
        time: timeStr,
        showTime,
      });
      console.log('addMessage 完成，当前消息数量:', this.messages.length);
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 99999;
      });
    },

    goBack() {
      // 返回主页
      uni.reLaunch({
        url: '/pages/home/home',
      });
    },

    showChatOptions() {
      uni.showActionSheet({
        itemList: ['清空聊天记录', '查看心理分析', '设置'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.clearChat();
          } else if (res.tapIndex === 1) {
            this.showAnalysis();
          } else if (res.tapIndex === 2) {
            uni.showToast({
              title: '设置功能开发中',
              icon: 'none',
            });
          }
        },
      });
    },

    showMoreOptions() {
      uni.showActionSheet({
        itemList: ['查看聊天记录', '导出聊天', '关于小暖'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.showToast({
              title: '聊天记录功能开发中',
              icon: 'none',
            });
          } else if (res.tapIndex === 1) {
            uni.showToast({
              title: '导出功能开发中',
              icon: 'none',
            });
          } else if (res.tapIndex === 2) {
            uni.showModal({
              title: '关于小暖',
              content: '小暖是一位专门为盲人群体提供心理辅导的AI伙伴，温暖、理解、专业。',
              showCancel: false,
            });
          }
        },
      });
    },

    clearChat() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有聊天记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = [];
            this.sessionId = null;
            this.addMessage('assistant', '你好，我是小暖，你的心理辅导伙伴。有什么想和我聊聊的吗？', true);
            uni.showToast({
              title: '已清空',
              icon: 'success',
            });
          }
        },
      });
    },

    showAnalysis() {
      uni.showToast({
        title: '心理分析功能开发中',
        icon: 'none',
      });
    },

    showEmoji() {
      uni.showToast({
        title: '表情功能开发中',
        icon: 'none',
      });
    },

    showStickers() {
      uni.showToast({
        title: '贴纸功能开发中',
        icon: 'none',
      });
    },

    selectFile() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showToast({
            title: '图片选择功能开发中',
            icon: 'none',
          });
        },
      });
    },

    showMoreInput() {
      uni.showActionSheet({
        itemList: ['语音输入', '图片', '位置'],
        success: (res) => {
          uni.showToast({
            title: '功能开发中',
            icon: 'none',
          });
        },
      });
    },

    makeCall() {
      uni.showToast({
        title: '语音通话功能开发中',
        icon: 'none',
      });
    },

    makeVideoCall() {
      uni.showToast({
        title: '视频通话功能开发中',
        icon: 'none',
      });
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },

    onMoodChange(e) {
      this.userInfo.mood = e.detail.value;
    },

    async saveUserInfo() {
      if (!this.userInfo.name || !this.userInfo.age) {
        uni.showToast({
          title: '请填写姓名和年龄',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      if (this.userInfo.age < 1 || this.userInfo.age > 120) {
        uni.showToast({
          title: '年龄范围应在1-120之间',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      this.savingInfo = true;
      this.userInfoSaved = false;

      try {
        // 构建符合后端API要求的用户信息对象
        const userInfoPayload = {
          name: this.userInfo.name,
          age: Number(this.userInfo.age),
          currentMood: Number(this.userInfo.mood),
          recentConcern: this.userInfo.recentConcern || this.userInfo.symptom || '',
        };

        // 如果有症状信息，也添加到 recentConcern
        if (this.userInfo.symptom && !this.userInfo.recentConcern) {
          userInfoPayload.recentConcern = this.userInfo.symptom;
        }

        const result = await saveUserInfoAPI(userInfoPayload);

        if (result.code === 200) {
          this.userInfoSaved = true;
          uni.showToast({
            title: '信息保存成功',
            icon: 'success',
            duration: 2000,
          });

          // 3秒后自动隐藏成功提示
          setTimeout(() => {
            this.userInfoSaved = false;
          }, 3000);

          // 可选：保存成功后关闭侧边栏
          // this.sidebarVisible = false;
        } else {
          throw new Error(result.message || '保存失败');
        }
      } catch (error) {
        console.error('保存用户信息失败:', error);
        uni.showToast({
          title: error.message || '保存失败，请稍后重试',
          icon: 'none',
          duration: 3000,
        });
      } finally {
        this.savingInfo = false;
      }
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #1a2744;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.4;
  pointer-events: none;
}

.glow-a {
  background: rgba(92, 225, 230, 0.3);
  top: -100rpx;
  right: -60rpx;
}

.glow-b {
  background: rgba(250, 140, 22, 0.3);
  bottom: 400rpx;
  left: -80rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: rgba(26, 39, 68, 0.95);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 10;
}

.back {
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 16rpx;
  margin-left: -16rpx;
}

.header-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #e8ecf5;
}

.header-lines {
  display: flex;
  gap: 4rpx;
  margin-top: 4rpx;
}

.line {
  width: 24rpx;
  height: 2rpx;
}

.line-cyan {
  background: #5ce1e6;
}

.line-orange {
  background: #fa8c16;
}

.header-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.header-actions .icon {
  font-size: 32rpx;
  color: #e8ecf5;
  padding: 8rpx;
  cursor: pointer;
}

/* 消息列表 */
.messages {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

.message-wrapper {
  margin-bottom: 24rpx;
}

.timestamp {
  text-align: center;
  margin: 24rpx 0;
}

.timestamp text {
  font-size: 24rpx;
  color: #6f7ea2;
}

.message-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.message-left {
  justify-content: flex-start;
}

.message-right {
  justify-content: flex-end;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background: rgba(92, 225, 230, 0.2);
}

.message-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  word-wrap: break-word;
}

.bubble-left {
  background: rgba(255, 255, 255, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.bubble-right {
  background: linear-gradient(135deg, #5ce1e6, #4dd0d5);
  border: 1rpx solid rgba(92, 225, 230, 0.3);
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #e8ecf5;
}

/* 底部输入栏 */
.input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: rgba(26, 39, 68, 0.95);
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
}

.input-icons {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.input-icons .icon {
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 8rpx;
  cursor: pointer;
}

.input-field-wrapper {
  flex: 1;
  margin: 0 16rpx;
}

.input-field {
  width: 100%;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 36rpx;
  padding: 0 24rpx;
  color: #e8ecf5;
  font-size: 28rpx;
}

.input-field:focus {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.1);
}

.placeholder {
  color: #6f7ea2;
}

.action-icons {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.action-icons .icon {
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 8rpx;
  cursor: pointer;
}

/* 侧边栏样式 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.sidebar-open {
  pointer-events: auto;
}

.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-open .sidebar-overlay {
  opacity: 1;
}

.sidebar-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 600rpx;
  max-width: 80%;
  height: 100%;
  background: #1a2744;
  box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-open .sidebar-content {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.sidebar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #e8ecf5;
}

.sidebar-close {
  font-size: 40rpx;
  color: #6f7ea2;
  padding: 8rpx;
  cursor: pointer;
}

.sidebar-body {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #e8ecf5;
  margin-bottom: 16rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 12rpx;
  padding: 20rpx;
  color: #e8ecf5;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.1);
}

.form-textarea {
  min-height: 160rpx;
  resize: none;
}

.form-placeholder {
  color: #6f7ea2;
}

.mood-slider-wrapper {
  padding: 16rpx 0;
}

.mood-label {
  display: block;
  font-size: 28rpx;
  color: #5ce1e6;
  margin-bottom: 16rpx;
  text-align: center;
}

.mood-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  padding: 0 20rpx;
}

.mood-scale-item {
  font-size: 24rpx;
  color: #6f7ea2;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #5ce1e6, #4dd0d5);
  border: none;
  border-radius: 12rpx;
  color: #1a2744;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 32rpx;
}

.save-btn:disabled {
  opacity: 0.6;
  background: rgba(92, 225, 230, 0.3);
}

.save-success {
  margin-top: 24rpx;
  text-align: center;
  padding: 16rpx;
  background: rgba(92, 225, 230, 0.1);
  border-radius: 8rpx;
}

.save-success text {
  font-size: 28rpx;
  color: #5ce1e6;
}
</style>

