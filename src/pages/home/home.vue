<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <text class="logo">Aurorun</text>
    </view>

    <view class="content">
      <view class="card-row">
        <view class="card" @tap="goTarget">
          <view class="card-inner">
            <text class="card-title">目标</text>
            <text class="card-desc">新的一天也要加油！</text>
          </view>
        </view>
        <view class="card card-orange" @tap="goMatch">
          <view class="card-inner">
            <text class="card-title">匹配</text>
            <text class="card-desc">遇见更多的人</text>
          </view>
        </view>
      </view>

      <view class="card-full" @tap="goAI">
        <view class="card-inner">
          <text class="card-title">AI聊天</text>
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
    goTarget() {
      uni.navigateTo({ url: '/pages/target/target' });
    },
    goMatch() {
      // 暂时取消积分限制，直接进入匹配页面
      uni.navigateTo({ url: '/pages/match/match' });
    },
    goAI() {
      uni.navigateTo({ url: '/pages/ai/ai' });
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
}

.logo {
  font-size: 44rpx;
  font-weight: 700;
  color: #e8ecf5;
  font-style: italic;
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

.card-full {
  background: linear-gradient(135deg, rgba(92, 225, 230, 0.12), rgba(250, 140, 22, 0.12));
  border: 2rpx solid rgba(92, 225, 230, 0.2);
  border-radius: 28rpx;
  padding: 40rpx 28rpx;
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
