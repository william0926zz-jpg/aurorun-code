<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <view class="back" @tap="goBack">
        <text>&lt;</text>
      </view>
      <text class="title">设置</text>
    </view>

    <view class="avatar-section">
      <view class="avatar">
        <text class="avatar-icon">👤</text>
      </view>
    </view>

    <view class="menu">
      <view class="menu-item" @tap="goProfile">
        <view class="menu-left">
          <view class="icon icon-profile">👤</view>
          <text>用户信息</text>
        </view>
        <text class="arrow">›</text>
      </view>
      <view class="menu-item" @tap="goAccountManage">
        <view class="menu-left">
          <view class="icon icon-account">◎</view>
          <text>账号管理</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @tap="goFeedback">
        <view class="menu-left">
          <view class="icon icon-feedback">💬</view>
          <text>反馈与帮助</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @tap="goAbout">
        <view class="menu-left">
          <view class="icon icon-about">ℹ</view>
          <text>关于我们</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <view class="danger-section">
      <view class="delete-account-btn" @tap="doDeleteAccount">
        <text>注销账号</text>
      </view>
    <view class="logout-btn" @tap="doLogout">
      <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { logout } from '../../api/auth.js';
import { deleteAccount } from '../../api/user.js';
import api from '../../utils/request.js';

export default {
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goProfile() {
      uni.navigateTo({ url: '/pages/user/profile' });
    },
    goAccountManage() {
      // 预留：账号管理页
    },
    goFeedback() {
      // 预留：反馈页
    },
    goAbout() {
      // 预留：关于我们页
    },
    doLogout() {
      uni.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: async (res) => {
          if (!res.confirm) return;
          try {
            await logout();
          } catch (e) {
            // 即使接口报错也继续清理本地登录状态
          } finally {
            api.setToken('');
            api.setRefreshToken && api.setRefreshToken('');
            uni.reLaunch({ url: '/pages/login/login' });
          }
        }
      });
    },
    async doDeleteAccount() {
      uni.showModal({
        title: '注销账号',
        content: '注销账号将永久删除您的所有数据，此操作不可恢复。确定要注销吗？',
        confirmText: '确定注销',
        cancelText: '取消',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (!res.confirm) return;
          
          // 显示加载提示
          uni.showLoading({
            title: '注销中...',
            mask: true,
          });
          
          try {
            // 先调用后端API删除账号
            await deleteAccount();
            
            // 账号删除成功后，清除所有本地存储数据
            try {
              // 先获取账号，用于清除账号相关的数据
              const account = uni.getStorageSync('account') || '';
              
              // 清除认证相关
              uni.removeStorageSync('token');
              uni.removeStorageSync('refreshToken');
              
              // 清除用户信息
              uni.removeStorageSync('userProfile');
              uni.removeStorageSync('userRole');
              
              // 清除账号相关的角色信息
              if (account) {
                uni.removeStorageSync('userRole_' + account);
              }
              uni.removeStorageSync('account');
              
              // 清除其他可能的数据
              uni.removeStorageSync('totalPoints');
              uni.removeStorageSync('targetRecords');
              uni.removeStorageSync('audioVolume');
              
              // 清除 request.js 中的 token
              api.setToken('');
              if (api.setRefreshToken) {
                api.setRefreshToken('');
              }
              
              // 清除所有可能的存储key（遍历所有可能的key）
              try {
                const allKeys = uni.getStorageInfoSync().keys || [];
                allKeys.forEach(key => {
                  // 清除所有用户相关的key
                  if (key.includes('user') || key.includes('token') || key.includes('role') || 
                      key.includes('account') || key.includes('profile') || key.includes('points') ||
                      key.includes('target') || key.includes('audio')) {
                    uni.removeStorageSync(key);
                  }
                });
              } catch (e) {
                // 如果获取存储信息失败，忽略
              }
              
            } catch (e) {
              console.error('清除本地数据失败:', e);
            }
            
            uni.hideLoading();
            
            // 立即跳转到登录页
            uni.reLaunch({ 
              url: '/pages/login/login',
              success: () => {
                uni.showToast({
                  title: '账号已注销',
                  icon: 'success',
                  duration: 1500,
                });
              }
            });
            
          } catch (error) {
            uni.hideLoading();
            console.error('注销账号失败:', error);
            
            // 处理错误
            let errorMsg = '注销失败，请重试';
            if (error.statusCode === 404) {
              errorMsg = '后端删除账号接口未实现（404）。\n\n请联系后端开发人员添加 DELETE /api/user/account 接口，或暂时使用"退出登录"功能。';
            } else if (error.statusCode === 401) {
              errorMsg = '登录已过期，请重新登录';
            } else if (error.data && error.data.message) {
              errorMsg = error.data.message;
            } else if (error.errMsg && error.errMsg.includes('fail')) {
              errorMsg = '网络错误，请检查网络连接';
            }
            
            uni.showModal({
              title: '注销失败',
              content: errorMsg,
              showCancel: false,
              confirmText: '确定',
            });
          }
        }
      });
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
  padding-bottom: 60rpx;
}

.glow {
  position: absolute;
  width: 420rpx;
  height: 420rpx;
  border-radius: 50%;
  filter: blur(120rpx);
  opacity: 0.5;
}

.glow-a {
  background: rgba(92, 225, 230, 0.35);
  top: -100rpx;
  right: -60rpx;
}

.glow-b {
  background: rgba(250, 140, 22, 0.35);
  bottom: 100rpx;
  left: -80rpx;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  position: relative;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.08);
}

.back {
  position: absolute;
  left: 24rpx;
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 16rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #e8ecf5;
}

.avatar-section {
  display: flex;
  justify-content: center;
  padding: 48rpx 0;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(92, 225, 230, 0.4);
}

.avatar-icon {
  font-size: 56rpx;
}

.menu {
  background: rgba(255, 255, 255, 0.05);
  margin: 0 32rpx;
  border-radius: 24rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.icon-profile {
  background: rgba(92, 225, 230, 0.2);
  color: #5ce1e6;
}

.icon-account {
  background: rgba(92, 225, 230, 0.2);
  color: #5ce1e6;
}

.icon-feedback {
  background: rgba(250, 140, 22, 0.2);
  color: #fa8c16;
}

.icon-about {
  background: rgba(92, 225, 230, 0.15);
  color: #5ce1e6;
}

.menu-left text {
  font-size: 30rpx;
  color: #e8ecf5;
}

.arrow {
  font-size: 32rpx;
  color: #8ea0c2;
}

.danger-section {
  margin-top: 60rpx;
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.delete-account-btn {
  height: 96rpx;
  background: rgba(255, 77, 79, 0.15);
  border: 2rpx solid rgba(255, 77, 79, 0.4);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.delete-account-btn:active {
  background: rgba(255, 77, 79, 0.25);
  border-color: rgba(255, 77, 79, 0.6);
}

.delete-account-btn text {
  color: #ff4d4f;
  font-size: 32rpx;
  font-weight: 600;
}

.logout-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #fa8c16, #ff4d4f);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(250, 140, 22, 0.35);
}

.logout-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
