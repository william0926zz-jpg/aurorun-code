<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <text class="logo">Aurorun</text>
      <text class="role-tag">志愿者端</text>
    </view>

    <view class="content">
      <view class="card-row single">
        <view class="card" @tap="goMatch">
          <view class="card-inner">
            <text class="card-title">匹配</text>
            <text class="card-desc">陪伴盲人跑者</text>
          </view>
        </view>
      </view>
    </view>

    <view class="tabbar">
      <view class="tab active">
        <text>主页</text>
      </view>
      <view class="tab" @tap="goUser">
        <text>用户</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goMatch() {
      // 志愿者匹配，与盲人端共用匹配页面
      uni.navigateTo({ url: '/pages/match/match' });
    },
    goUser() {
      uni.navigateTo({ url: '/pages/user/user' });
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
  padding: 40rpx 28rpx 0;
  display: flex;
  flex-direction: column;
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
  bottom: 200rpx;
  right: -40rpx;
}

.header {
  padding: 20rpx 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 44rpx;
  font-weight: 700;
  color: #e8ecf5;
  font-style: italic;
}

.role-tag {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid rgba(92, 225, 230, 0.6);
  color: #5ce1e6;
  font-size: 24rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card-row {
  display: flex;
  gap: 24rpx;
}

.card-row.single {
  justify-content: center;
}

.card {
  flex: 1;
  aspect-ratio: 1 / 1.3;
  background: linear-gradient(145deg, rgba(92, 225, 230, 0.15), rgba(92, 225, 230, 0.05));
  border: 2rpx solid rgba(92, 225, 230, 0.3);
  border-radius: 28rpx;
  display: flex;
  align-items: flex-end;
  padding: 28rpx;
  box-sizing: border-box;
}

.card-orange {
  background: linear-gradient(145deg, rgba(250, 140, 22, 0.15), rgba(250, 140, 22, 0.05));
  border-color: rgba(250, 140, 22, 0.3);
}

.card-inner {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #e8ecf5;
}

.card-desc {
  font-size: 26rpx;
  color: #8ea0c2;
}

.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #1a2744;
  border-top: 2rpx solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tab {
  flex: 1;
  text-align: center;
  color: #8ea0c2;
  font-size: 28rpx;
}

.tab.active {
  color: #5ce1e6;
  font-weight: 600;
}
</style>


