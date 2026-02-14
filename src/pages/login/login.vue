<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="panel">
      <view class="device-card">
        <view class="status-bar">
          <text>09:41</text>
          <text>LTE · 80%</text>
        </view>

        <view class="pill">
          <view class="dot"></view>
          <text>登录 · 安全态</text>
        </view>

        <view class="hero">
          <view class="icon">UX</view>
          <view>
            <view class="title">欢迎回来</view>
            <view class="subtitle">请使用您的账号密码登录</view>
          </view>
        </view>

        <view class="form-card">
          <view class="field">
            <view class="label">账号</view>
            <view class="input-box">
              <text class="prefix">@</text>
              <input
                v-model.trim="account"
                class="input"
                placeholder="输入邮箱或手机号"
                placeholder-class="placeholder"
                confirm-type="next"
              />
            </view>
          </view>

          <view class="field">
            <view class="label">密码</view>
            <view class="input-box">
              <text class="prefix">••</text>
              <input
                v-model="password"
                class="input"
                :password="!showPwd"
                placeholder="至少 8 位，含数字"
                placeholder-class="placeholder"
                confirm-type="done"
              />
              <view class="eye" @tap="togglePwd">{{ showPwd ? '隐藏' : '显示' }}</view>
            </view>
          </view>

          <view class="helper">
            <view class="toggle" :class="{ active: remember }" @tap="remember = !remember">
              <view class="capsule">
                <view class="ball"></view>
              </view>
              <text>记住我</text>
            </view>
            <text class="link">忘记密码？</text>
          </view>

          <button
            class="btn primary"
            :class="{ ready: isReady, loading: isLoading }"
            :disabled="!isReady || isLoading"
            @tap="doLogin"
          >
            {{ btnText }}
          </button>

          <view class="sub-link">
            <text>还没有账号？</text>
            <text class="link" @tap="goRegister">去注册</text>
          </view>

          <view class="footnote">提示：填写账号与密码后，按钮自动激活</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/auth.js';
import api from '../../utils/request.js';

export default {
  data() {
    return {
      account: '',
      password: '',
      showPwd: false,
      remember: true,
      isLoading: false,
      message: '',
    };
  },
  computed: {
    isReady() {
      const acc = this.account.trim();
      const pwd = this.password.trim();
      const hasNumber = /\d/.test(pwd);
      return acc.length > 0 && pwd.length >= 8 && hasNumber;
    },
    btnText() {
      if (this.isLoading) return '验证中...';
      if (this.message) return this.message;
      return this.isReady ? '登录' : '请完善信息';
    },
  },
  methods: {
    togglePwd() {
      this.showPwd = !this.showPwd;
    },
    async doLogin() {
      if (!this.isReady || this.isLoading) return;
      this.isLoading = true;
      this.message = '';
      try {
        const acc = this.account.trim();
        const res = await login(acc, this.password.trim(), this.remember);
        if (res.code === 200 && res.data) {
          // 保存 token
          api.setToken(res.data.token);
          if (res.data.refreshToken) {
            api.setRefreshToken(res.data.refreshToken);
          }
          // 根据本地存储的角色决定入口
          let role = 'blind';
          try {
            const storedByAccount = uni.getStorageSync('userRole_' + acc);
            const storedGlobal = uni.getStorageSync('userRole');
            role = storedByAccount || storedGlobal || 'blind';
            uni.setStorageSync('userRole', role);
          } catch (e) {}

          if (role === 'volunteer') {
            uni.reLaunch({ url: '/pages/volunteer/home' });
          } else {
          uni.reLaunch({ url: '/pages/home/home' });
          }
          return;
        } else {
          // 显示后端返回的错误信息
          this.message = res.message || '登录失败';
        }
      } catch (e) {
        console.error('登录错误:', e);
        
        // 获取后端返回的错误消息
        const errorMessage = (e.data && e.data.message) || e.message || '';
        
        // 1. 检查是否是账号未注册的情况（404 或消息中包含"不存在"、"未注册"等关键词）
        if (e.statusCode === 404 || 
            errorMessage.includes('不存在') || 
            errorMessage.includes('未注册') ||
            errorMessage.includes('not found') ||
            errorMessage.toLowerCase().includes('not registered')) {
          this.message = '还未注册';
        }
        // 2. 处理密码不正确 / 未授权等情况（HTTP 401）
        else if (e.statusCode === 401) {
          this.message = errorMessage || '账号或密码错误';
        }
        // 3. 其他带有后端 message 的业务错误
        else if (e.statusCode && e.data && e.data.message) {
          this.message = e.data.message;
        }
        // 4. 网络层错误
        else if (e.errMsg && (e.errMsg.includes('fail') || e.errMsg.includes('CONNECTION'))) {
          this.message = '无法连接到服务器，请检查网络或后端服务';
        } else if (e.errMsg && e.errMsg.includes('EMPTY_RESPONSE')) {
          this.message = '服务器无响应，请稍后重试';
        } else {
          this.message = errorMessage || '网络错误，请稍后重试';
        }
      } finally {
        this.isLoading = false;
        if (this.message) {
          setTimeout(() => {
            this.message = '';
          }, 2000);
        }
      }
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/register/register' });
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
  padding: 40rpx 28rpx 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
}

.glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.6;
}

.glow-a {
  background: rgba(92, 225, 230, 0.4);
  top: -80rpx;
  left: 60rpx;
}

.glow-b {
  background: rgba(250, 140, 22, 0.4);
  bottom: -60rpx;
  right: -40rpx;
}

.panel {
  width: 100%;
  max-width: 1200rpx;
  background: rgba(26, 39, 68, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28rpx;
  padding: 26rpx;
  box-shadow: 0 25rpx 80rpx rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  box-sizing: border-box;
}

.device-card {
  background: linear-gradient(180deg, #1e3050 0%, #162238 100%);
  border-radius: 24rpx;
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 24rpx 22rpx;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 18rpx 40rpx rgba(0, 0, 0, 0.38);
  position: relative;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  color: #8ea0c2;
  font-size: 26rpx;
  margin-bottom: 16rpx;
}

.pill {
  height: 54rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(92, 225, 230, 0.15);
  color: #5ce1e6;
  font-size: 24rpx;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 18rpx;
}

.pill .dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  box-shadow: 0 0 20rpx rgba(92, 225, 230, 0.8);
}

.hero {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-bottom: 18rpx;
}

.icon {
  width: 74rpx;
  height: 74rpx;
  border-radius: 20rpx;
  background: linear-gradient(145deg, #5ce1e6, #fa8c16);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.5rpx;
  box-shadow: 0 8rpx 20rpx rgba(92, 225, 230, 0.4);
}

.title {
  color: #e8ecf5;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
}

.subtitle {
  color: #8ea0c2;
  font-size: 26rpx;
}

.form-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 18rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.3);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.label {
  color: #8ea0c2;
  font-size: 26rpx;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #2a3f5f;
  border-radius: 14rpx;
  padding: 18rpx 14rpx;
  transition: border-color 0.2s, background 0.2s;
}

.input-box:active {
  border-color: rgba(92, 225, 230, 0.7);
  background: rgba(92, 225, 230, 0.08);
}

.prefix {
  color: #fa8c16;
  font-weight: 600;
  font-size: 26rpx;
}

.input {
  flex: 1;
  color: #e8ecf5;
  font-size: 30rpx;
}

.placeholder {
  color: #6f7ea2;
}

.eye {
  padding: 10rpx 18rpx;
  background: rgba(92, 225, 230, 0.12);
  border-radius: 12rpx;
  color: #5ce1e6;
  font-size: 24rpx;
}

.helper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8ea0c2;
  font-size: 26rpx;
  margin-top: 4rpx;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
}

.capsule {
  width: 70rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: #1e3050;
  border: 1px solid #2a3f5f;
  position: relative;
  transition: all 0.25s;
}

.ball {
  position: absolute;
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #3a5070;
  top: 2rpx;
  left: 2rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.35);
  transition: all 0.25s;
}

.toggle.active .capsule {
  background: rgba(92, 225, 230, 0.3);
  border-color: rgba(92, 225, 230, 0.8);
}

.toggle.active .ball {
  left: 34rpx;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
}

.link {
  color: #fa8c16;
}

.btn {
  height: 96rpx;
  border-radius: 16rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 700;
  text-align: center;
  line-height: 96rpx;
  color: #fff;
}

.btn.primary {
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  box-shadow: 0 18rpx 36rpx rgba(92, 225, 230, 0.35);
  opacity: 0.6;
}

.btn.primary.ready {
  opacity: 1;
}

.btn.primary.loading {
  opacity: 0.8;
}

.btn:disabled {
  color: #fff;
}

.footnote {
  text-align: center;
  color: #8ea0c2;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.sub-link {
  margin-top: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  color: #8ea0c2;
  font-size: 26rpx;
}

.sub-link .link {
  color: #fa8c16;
}
</style>
