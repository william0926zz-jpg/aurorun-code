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
          <text>注册 · 创建账号</text>
        </view>

        <view class="hero">
          <view class="icon">UX</view>
          <view>
            <view class="title">注册新账号</view>
            <view class="subtitle">仅需账号与密码即可创建</view>
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

          <!-- 角色选择：盲人 / 志愿者 -->
          <view class="field">
            <view class="label">角色</view>
            <view class="role-group">
              <view
                class="role-item"
                :class="{ active: role === 'blind' }"
                @tap="role = 'blind'"
              >
                <view class="radio-dot">
                  <view v-if="role === 'blind'" class="radio-inner"></view>
                </view>
                <view class="role-texts">
                  <text class="role-title">盲人用户</text>
                  <text class="role-desc">需要他人协助的跑者</text>
                </view>
              </view>
              <view
                class="role-item"
                :class="{ active: role === 'volunteer' }"
                @tap="role = 'volunteer'"
              >
                <view class="radio-dot">
                  <view v-if="role === 'volunteer'" class="radio-inner"></view>
                </view>
                <view class="role-texts">
                  <text class="role-title">志愿者</text>
                  <text class="role-desc">愿意陪跑和引导的伙伴</text>
                </view>
              </view>
            </view>
          </view>

          <button
            class="btn primary"
            :class="{ ready: isReady, loading: isLoading }"
            :disabled="!isReady || isLoading"
            @tap="doRegister"
          >
            {{ btnText }}
          </button>

          <view class="sub-link">
            <text>已有账号？</text>
            <text class="link" @tap="goLogin">去登录</text>
          </view>

          <view class="footnote">提示：填写账号与密码后，按钮自动激活</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { register } from '../../api/auth.js';
import api from '../../utils/request.js';

export default {
  data() {
    return {
      account: '',
      password: '',
      showPwd: false,
      isLoading: false,
      message: '',
      role: 'blind', // blind: 盲人（默认），volunteer: 志愿者
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
      if (this.isLoading) return '提交中...';
      if (this.message) return this.message;
      return this.isReady ? '注册' : '请完善信息';
    },
  },
  methods: {
    togglePwd() {
      this.showPwd = !this.showPwd;
    },
    async doRegister() {
      if (!this.isReady || this.isLoading) return;
      this.isLoading = true;
      this.message = '';
      try {
        const res = await register(this.account.trim(), this.password.trim(), this.role);
        if (res.code === 200 && res.data) {
          api.setToken(res.data.token);
          if (res.data.refreshToken) {
            api.setRefreshToken(res.data.refreshToken);
          }
          // 本地记录当前账号的角色，便于登录后区分入口
          try {
            const acc = this.account.trim();
            uni.setStorageSync('userRole_' + acc, this.role);
            uni.setStorageSync('userRole', this.role);
          } catch (e) {}
          this.message = '注册成功 ✓';
          setTimeout(() => {
            if (this.role === 'volunteer') {
              uni.reLaunch({ url: '/pages/volunteer/home' });
            } else {
            uni.reLaunch({ url: '/pages/home/home' });
            }
          }, 600);
        } else {
          // 显示后端返回的错误信息
          this.message = res.message || '注册失败';
        }
      } catch (e) {
        console.error('注册错误:', e);
        // 优先展示后端返回的业务错误信息（如账号格式不正确、密码过短等）
        if (e.statusCode && e.data && e.data.message) {
          this.message = e.data.message;
        } else if (e.errMsg && (e.errMsg.includes('fail') || e.errMsg.includes('CONNECTION'))) {
          this.message = '无法连接到服务器，请检查网络或后端服务';
        } else if (e.errMsg && e.errMsg.includes('EMPTY_RESPONSE')) {
          this.message = '服务器无响应，请稍后重试';
        } else {
          this.message = e.message || '网络错误，请稍后重试';
        }
      } finally {
        this.isLoading = false;
        if (this.message && !this.message.includes('成功')) {
          setTimeout(() => {
            this.message = '';
          }, 2000);
        }
      }
    },
    goLogin() {
      uni.navigateBack();
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
  background: rgba(250, 140, 22, 0.15);
  color: #fa8c16;
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
  background: linear-gradient(135deg, #fa8c16, #5ce1e6);
  box-shadow: 0 0 20rpx rgba(250, 140, 22, 0.8);
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
  background: linear-gradient(145deg, #fa8c16, #5ce1e6);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: 700;
  letter-spacing: -0.5rpx;
  box-shadow: 0 8rpx 20rpx rgba(250, 140, 22, 0.4);
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

.role-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 16rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14rpx;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.role-item.active {
  background: rgba(250, 140, 22, 0.1);
  border-color: rgba(250, 140, 22, 0.7);
}

.radio-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-inner {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #fa8c16, #5ce1e6);
}

.role-texts {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.role-title {
  font-size: 28rpx;
  color: #e8ecf5;
  font-weight: 600;
}

.role-desc {
  font-size: 24rpx;
  color: #8ea0c2;
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
  border-color: rgba(250, 140, 22, 0.7);
  background: rgba(250, 140, 22, 0.08);
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
  background: rgba(250, 140, 22, 0.12);
  border-radius: 12rpx;
  color: #fa8c16;
  font-size: 24rpx;
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
  background: linear-gradient(135deg, #fa8c16, #5ce1e6);
  box-shadow: 0 18rpx 36rpx rgba(250, 140, 22, 0.35);
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
  color: #5ce1e6;
}

.footnote {
  text-align: center;
  color: #8ea0c2;
  font-size: 24rpx;
  margin-top: 4rpx;
}
</style>
