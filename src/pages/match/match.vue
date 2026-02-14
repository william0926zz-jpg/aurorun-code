<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <view class="back" @tap="goBack">
        <text>&lt;</text>
      </view>
      <text class="title">匹配</text>
    </view>

    <scroll-view class="content" scroll-y v-if="!matching && !matchResult">
      <view class="match-intro">
        <text class="intro-title">寻找你的跑步伙伴</text>
        <text class="intro-desc">系统将根据您的个人信息，为您匹配合适的跑步伙伴</text>
      </view>

      <!-- 匹配偏好设置 -->
      <view class="preferences-section">
        <text class="section-title">匹配偏好（可选）</text>
        
        <view class="preference-item">
          <text class="preference-label">年龄范围</text>
          <view class="range-inputs">
            <input
              v-model="preferences.ageMin"
              class="range-input"
              type="number"
              placeholder="最小"
              placeholder-class="placeholder"
            />
            <text class="range-separator">-</text>
            <input
              v-model="preferences.ageMax"
              class="range-input"
              type="number"
              placeholder="最大"
              placeholder-class="placeholder"
            />
          </view>
        </view>

        <view class="preference-item">
          <text class="preference-label">视力类型</text>
          <view class="radio-group">
            <view
              class="radio-item"
              :class="{ active: preferences.visionType === 'half' }"
              @tap="preferences.visionType = 'half'"
            >
              <view class="radio-dot">
                <view v-if="preferences.visionType === 'half'" class="radio-inner"></view>
              </view>
              <text>半盲</text>
            </view>
            <view
              class="radio-item"
              :class="{ active: preferences.visionType === 'full' }"
              @tap="preferences.visionType = 'full'"
            >
              <view class="radio-dot">
                <view v-if="preferences.visionType === 'full'" class="radio-inner"></view>
              </view>
              <text>全盲</text>
            </view>
            <view
              class="radio-item"
              :class="{ active: preferences.visionType === '' }"
              @tap="preferences.visionType = ''"
            >
              <view class="radio-dot">
                <view v-if="preferences.visionType === ''" class="radio-inner"></view>
              </view>
              <text>不限</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 开始匹配按钮 -->
      <view class="match-btn-wrapper">
        <view class="match-btn" @tap="startMatch">
          <text>开始匹配</text>
        </view>
      </view>
    </scroll-view>

    <!-- 匹配中 -->
    <view class="matching-view" v-if="matching">
      <view class="matching-animation">
        <view class="pulse-circle"></view>
        <view class="pulse-circle delay-1"></view>
        <view class="pulse-circle delay-2"></view>
      </view>
      <text class="matching-text">正在为您寻找合适的伙伴...</text>
    </view>

    <!-- 匹配结果 -->
    <scroll-view class="content" scroll-y v-if="matchResult && !matching">
      <view class="match-success">
        <text class="success-title">匹配成功！</text>
        <text class="success-desc">为您找到了合适的跑步伙伴</text>
      </view>

      <!-- 匹配用户信息 -->
      <view class="matched-user-card">
        <view class="user-header">
          <image
            class="user-avatar"
            :src="matchResult.matchedUser.avatar || '/static/logo.png'"
            mode="aspectFill"
          />
          <view class="user-info">
            <text class="user-nickname">{{ matchResult.matchedUser.nickname || '用户' }}</text>
            <text class="match-score">匹配度: {{ matchResult.matchScore || 0 }}%</text>
          </view>
        </view>
      </view>

      <!-- 信息对比 -->
      <view class="comparison-section">
        <text class="section-title">信息对比</text>
        
        <view class="comparison-item" v-if="matchResult.comparison">
          <!-- 年龄对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.age">
            <view class="comparison-label">
              <text>年龄</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ matchResult.comparison.age.mine }}岁</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ matchResult.comparison.age.other }}岁</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.age.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.age.match) }}</text>
            </view>
          </view>

          <!-- 身高对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.height">
            <view class="comparison-label">
              <text>身高</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ matchResult.comparison.height.mine }}cm</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ matchResult.comparison.height.other }}cm</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.height.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.height.match) }}</text>
            </view>
          </view>

          <!-- 体重对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.weight">
            <view class="comparison-label">
              <text>体重</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ matchResult.comparison.weight.mine }}kg</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ matchResult.comparison.weight.other }}kg</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.weight.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.weight.match) }}</text>
            </view>
          </view>

          <!-- 视力类型对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.visionType">
            <view class="comparison-label">
              <text>视力类型</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ formatVisionType(matchResult.comparison.visionType.mine) }}</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ formatVisionType(matchResult.comparison.visionType.other) }}</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.visionType.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.visionType.match) }}</text>
            </view>
          </view>

          <!-- 跑步经验对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.experience">
            <view class="comparison-label">
              <text>跑步经验</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ matchResult.comparison.experience.mine || '未填写' }}</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ matchResult.comparison.experience.other || '未填写' }}</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.experience.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.experience.match) }}</text>
            </view>
          </view>

          <!-- 跑步地区对比 -->
          <view class="comparison-row" v-if="matchResult.comparison.runningArea">
            <view class="comparison-label">
              <text>跑步地区</text>
            </view>
            <view class="comparison-values">
              <text class="value-mine">{{ matchResult.comparison.runningArea.mine || '未填写' }}</text>
              <text class="value-separator">vs</text>
              <text class="value-other">{{ matchResult.comparison.runningArea.other || '未填写' }}</text>
            </view>
            <view class="match-badge" :class="getMatchLevelClass(matchResult.comparison.runningArea.match)">
              <text>{{ getMatchLevelText(matchResult.comparison.runningArea.match) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn secondary" @tap="startMatch">
          <text>重新匹配</text>
        </view>
        <view class="action-btn primary" @tap="viewMatchList">
          <text>查看匹配列表</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { startMatch, getMatchList } from '@/api/match.js';
import { getUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      matching: false,
      matchResult: null,
      preferences: {
        ageMin: '',
        ageMax: '',
        visionType: '', // 'half', 'full', ''(不限)
      },
    };
  },
  onLoad() {
    // 加载时可以预填充一些偏好设置
  },
  methods: {
    async startMatch() {
      // 检查用户信息是否完整
      const userProfile = uni.getStorageSync('userProfile');
      if (!userProfile) {
        uni.showModal({
          title: '提示',
          content: '请先完善个人信息后再进行匹配',
          showCancel: true,
          confirmText: '去完善',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/user/profile' });
            }
          },
        });
        return;
      }

      this.matching = true;
      this.matchResult = null;

      try {
        // 构建匹配偏好
        const preferences = {};
        if (this.preferences.ageMin && this.preferences.ageMax) {
          preferences.ageRange = [
            parseInt(this.preferences.ageMin),
            parseInt(this.preferences.ageMax),
          ];
        }
        if (this.preferences.visionType) {
          preferences.visionType = this.preferences.visionType;
        }

        // 携带当前用户角色，便于后端只做“盲人 ↔ 志愿者”匹配
        try {
          const role = uni.getStorageSync('userRole') || 'blind';
          preferences.role = role;
          // 期望后端按 role 和 targetRole 做过滤，例如：blind 匹配 volunteer，volunteer 匹配 blind
        } catch (e) {}

        // 调用匹配接口
        const res = await startMatch(preferences);
        
        if (res.code === 200 && res.data) {
          // 模拟匹配延迟效果
          setTimeout(() => {
            this.matchResult = res.data;
            this.matching = false;
          }, 1500);
        } else {
          this.matching = false;
          uni.showToast({
            title: res.message || '匹配失败',
            icon: 'none',
          });
        }
      } catch (error) {
        console.error('匹配失败:', error);
        this.matching = false;
        uni.showToast({
          title: '匹配失败，请稍后重试',
          icon: 'none',
        });
      }
    },
    viewMatchList() {
      // 跳转到匹配列表页面（如果存在）
      uni.showToast({
        title: '功能开发中',
        icon: 'none',
      });
    },
    getMatchLevelClass(matchLevel) {
      if (matchLevel >= 0.8) return 'match-excellent';
      if (matchLevel >= 0.6) return 'match-good';
      if (matchLevel >= 0.4) return 'match-normal';
      return 'match-low';
    },
    getMatchLevelText(matchLevel) {
      if (matchLevel >= 0.8) return '高度匹配';
      if (matchLevel >= 0.6) return '良好匹配';
      if (matchLevel >= 0.4) return '一般匹配';
      return '较低匹配';
    },
    formatVisionType(type) {
      if (type === 'half') return '半盲';
      if (type === 'full') return '全盲';
      return type || '未填写';
    },
    goBack() {
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
  display: flex;
  flex-direction: column;
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
  padding: 0 24rpx;
  z-index: 10;
}

.back {
  position: absolute;
  left: 24rpx;
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 16rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #e8ecf5;
}

.content {
  flex: 1;
  padding: 40rpx 32rpx;
  box-sizing: border-box;
}

.match-intro {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.intro-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #e8ecf5;
}

.intro-desc {
  font-size: 28rpx;
  color: #8ea0c2;
  line-height: 1.6;
}

.preferences-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #e8ecf5;
  margin-bottom: 24rpx;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preference-label {
  font-size: 28rpx;
  color: #e8ecf5;
  font-weight: 500;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.range-input {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 0 24rpx;
  color: #e8ecf5;
  font-size: 28rpx;
}

.range-separator {
  color: #8ea0c2;
  font-size: 28rpx;
}

.radio-group {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  color: #e8ecf5;
  font-size: 26rpx;
  transition: all 0.3s;
}

.radio-item.active {
  border-color: #fa8c16;
  background: rgba(250, 140, 22, 0.15);
}

.radio-dot {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.radio-item.active .radio-dot {
  border-color: #fa8c16;
}

.radio-inner {
  width: 18rpx;
  height: 18rpx;
  background: #fa8c16;
  border-radius: 50%;
}

.match-btn-wrapper {
  padding: 32rpx 0;
}

.match-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(92, 225, 230, 0.35);
}

.match-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

/* 匹配中动画 */
.matching-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.matching-animation {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-circle {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  border: 4rpx solid #5ce1e6;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.pulse-circle.delay-1 {
  animation-delay: 0.5s;
  border-color: #fa8c16;
}

.pulse-circle.delay-2 {
  animation-delay: 1s;
  border-color: rgba(92, 225, 230, 0.5);
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.matching-text {
  font-size: 28rpx;
  color: #8ea0c2;
}

/* 匹配成功 */
.match-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
  padding: 40rpx 0;
}

.success-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #5ce1e6;
}

.success-desc {
  font-size: 28rpx;
  color: #8ea0c2;
}

.matched-user-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(92, 225, 230, 0.3);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3rpx solid #5ce1e6;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: #e8ecf5;
}

.match-score {
  font-size: 26rpx;
  color: #5ce1e6;
}

/* 信息对比 */
.comparison-section {
  margin-bottom: 40rpx;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.comparison-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.05);
}

.comparison-label {
  min-width: 120rpx;
}

.comparison-label text {
  font-size: 28rpx;
  color: #8ea0c2;
}

.comparison-values {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.value-mine,
.value-other {
  font-size: 28rpx;
  color: #e8ecf5;
  font-weight: 500;
}

.value-separator {
  font-size: 24rpx;
  color: #6f7ea2;
}

.match-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.match-badge text {
  color: #fff;
}

.match-excellent {
  background: rgba(92, 225, 230, 0.3);
  border: 1rpx solid #5ce1e6;
}

.match-good {
  background: rgba(76, 175, 80, 0.3);
  border: 1rpx solid #4caf50;
}

.match-normal {
  background: rgba(250, 140, 22, 0.3);
  border: 1rpx solid #fa8c16;
}

.match-low {
  background: rgba(158, 158, 158, 0.3);
  border: 1rpx solid #9e9e9e;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  padding: 32rpx 0;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.action-btn.secondary text {
  color: #e8ecf5;
  font-size: 28rpx;
  font-weight: 600;
}

.action-btn.primary {
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  box-shadow: 0 8rpx 20rpx rgba(92, 225, 230, 0.3);
}

.action-btn.primary text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.placeholder {
  color: #6f7ea2;
}
</style>



