<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <view class="back-btn" @tap="goHome">
        <text>&lt;</text>
      </view>
      <text class="logo">Aurorun</text>
      <view class="header-right">
        <view class="volume-control" @tap="toggleVolumePanel">
          <text class="volume-icon">{{ volumeIcon }}</text>
        </view>
        <view class="history-btn" @tap="goHistory">
          <text>历史记录</text>
        </view>
      </view>
    </view>

    <!-- 音量控制遮罩 -->
    <view v-if="showVolumePanel" class="volume-mask" @tap="closeVolumePanel"></view>

    <!-- 音量控制面板 -->
    <view v-if="showVolumePanel" class="volume-panel">
      <view class="volume-header">
        <text class="volume-title">音量控制</text>
        <view class="volume-close" @tap="closeVolumePanel">
          <text>×</text>
        </view>
      </view>
      <view class="volume-content">
        <view class="volume-slider-wrapper">
          <text class="volume-label">音量: {{ Math.round(volume * 100) }}%</text>
          <slider
            :value="volume * 100"
            min="0"
            max="100"
            step="5"
            activeColor="#5ce1e6"
            backgroundColor="rgba(255,255,255,0.2)"
            block-color="#fa8c16"
            @change="onVolumeChange"
            class="volume-slider"
          />
        </view>
        <view class="volume-buttons">
          <view class="volume-btn" @tap="setVolume(0)">
            <text>🔇</text>
            <text class="btn-label">静音</text>
          </view>
          <view class="volume-btn" @tap="setVolume(0.3)">
            <text>🔉</text>
            <text class="btn-label">低</text>
          </view>
          <view class="volume-btn" @tap="setVolume(0.6)">
            <text>🔊</text>
            <text class="btn-label">中</text>
          </view>
          <view class="volume-btn" @tap="setVolume(1)">
            <text>🔊</text>
            <text class="btn-label">高</text>
          </view>
        </view>
      </view>
    </view>

    <view class="content">
      <!-- Level 1 -->
      <view class="level-card level-1" :class="{ selected: selectedLevel === 1 }">
        <view class="level-header">
          <text class="level-title">Level1</text>
          <text class="level-points">1积分</text>
        </view>
        <text class="level-desc">(卧室到家门口)</text>
        <view class="times-selector">
          <view
            v-for="time in [1, 2, 5]"
            :key="time"
            class="time-btn"
            :class="{ active: selectedLevel === 1 && selectedTimes === time }"
            @tap="selectLevel(1, time)"
          >
            <text>{{ time }}次</text>
          </view>
        </view>
      </view>

      <!-- Level 2 -->
      <view class="level-card level-2" :class="{ selected: selectedLevel === 2 }">
        <view class="level-header">
          <text class="level-title">Level2</text>
          <text class="level-points">2积分</text>
        </view>
        <text class="level-desc">(家门口到小区公园)</text>
        <view class="times-selector">
          <view
            v-for="time in [1, 2, 5]"
            :key="time"
            class="time-btn"
            :class="{ active: selectedLevel === 2 && selectedTimes === time }"
            @tap="selectLevel(2, time)"
          >
            <text>{{ time }}次</text>
          </view>
        </view>
      </view>

      <!-- Level 3 -->
      <view class="level-card level-3" :class="{ selected: selectedLevel === 3 }">
        <view class="level-header">
          <text class="level-title">Level3</text>
          <text class="level-points">5积分</text>
        </view>
        <text class="level-desc">(家门口到小区门口)</text>
        <view class="times-selector">
          <view
            v-for="time in [1, 2, 5]"
            :key="time"
            class="time-btn"
            :class="{ active: selectedLevel === 3 && selectedTimes === time }"
            @tap="selectLevel(3, time)"
          >
            <text>{{ time }}次</text>
          </view>
        </view>
      </view>

      <!-- 开始/结束按钮 -->
      <view class="action-btn" @tap="handleAction">
        <text>{{ isRunning ? '结束' : '开始' }}</text>
      </view>

      <!-- 计时显示 -->
      <view v-if="isRunning" class="timer-display">
        <text class="timer-text">{{ formatTime(elapsedTime) }}</text>
      </view>

      <!-- 当前积分和称号 -->
      <view class="stats">
        <view class="stat-item">
          <text class="stat-label">当前积分</text>
          <text class="stat-value">{{ totalPoints }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">当前称号</text>
          <text class="stat-value">{{ currentTitle }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import audioManager from '../../utils/audio.js';
import { AUDIO_CDN, useCDN } from '../../utils/cdn.js';

export default {
  data() {
    return {
      selectedLevel: null,
      selectedTimes: null,
      isRunning: false,
      startTime: null,
      elapsedTime: 0,
      timer: null,
      totalPoints: 0,
      records: [],
      // 背景音乐列表 - 使用 CDN URL
      backgroundAudios: [
        AUDIO_CDN.forest1,
        AUDIO_CDN.forest2,
      ],
      // 音量控制
      volume: 0.5,
      showVolumePanel: false,
    };
  },
  computed: {
    // 称号系统：根据积分显示称号，未达到下一级时保留当前称号
    // 0-29积分：新手跑者
    // 30-99积分：小有经验的跑者
    // 100-299积分：跑步健将
    // 300+积分：天生的跑者
    currentTitle() {
      if (this.totalPoints >= 300) return '天生的跑者';
      if (this.totalPoints >= 100) return '跑步健将';
      if (this.totalPoints >= 30) return '小有经验的跑者';
      return '新手跑者';
    },
  },
  onLoad() {
    this.loadData();
    this.loadVolume();
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    // 页面卸载时停止音频
    audioManager.stopBackground();
  },
  methods: {
    loadData() {
      // 从本地存储加载数据
      try {
        const points = uni.getStorageSync('totalPoints');
        if (points) this.totalPoints = parseInt(points) || 0;

        const records = uni.getStorageSync('targetRecords');
        if (records) this.records = JSON.parse(records) || [];
      } catch (e) {
        console.error('加载数据失败:', e);
      }
    },
    saveData() {
      try {
        uni.setStorageSync('totalPoints', this.totalPoints.toString());
        uni.setStorageSync('targetRecords', JSON.stringify(this.records));
      } catch (e) {
        console.error('保存数据失败:', e);
      }
    },
    selectLevel(level, times) {
      if (this.isRunning) {
        uni.showToast({
          title: '请先结束当前计时',
          icon: 'none',
        });
        return;
      }
      this.selectedLevel = level;
      this.selectedTimes = times;
    },
    handleAction() {
      if (!this.selectedLevel || !this.selectedTimes) {
        uni.showToast({
          title: '请先选择难度和次数',
          icon: 'none',
        });
        return;
      }

      if (!this.isRunning) {
        // 开始计时
        this.startTimer();
      } else {
        // 结束计时
        this.stopTimer();
      }
    },
    startTimer() {
      this.isRunning = true;
      this.startTime = Date.now();
      this.elapsedTime = 0;

      // 确保音量设置正确
      audioManager.setVolume(this.volume);

      // 随机选择并播放背景音乐
      const randomIndex = Math.floor(Math.random() * this.backgroundAudios.length);
      const selectedAudio = this.backgroundAudios[randomIndex];
      console.log('开始播放背景音乐:', selectedAudio, '音量:', this.volume);
      audioManager.playBackground(selectedAudio, true); // 循环播放

      this.timer = setInterval(() => {
        this.elapsedTime = Date.now() - this.startTime;
      }, 100);
    },
    stopTimer() {
      if (!this.isRunning) return;

      this.isRunning = false;
      
      // 停止背景音乐
      audioManager.stopBackground();
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      // 计算积分
      const levelPoints = { 1: 1, 2: 2, 3: 5 };
      const points = levelPoints[this.selectedLevel] * this.selectedTimes;
      const oldTotal = this.totalPoints;
      this.totalPoints += points;

      // 保存记录
      const record = {
        id: Date.now().toString(),
        level: this.selectedLevel,
        times: this.selectedTimes,
        points: points,
        duration: this.elapsedTime,
        date: new Date().toISOString(),
        formattedTime: this.formatTime(this.elapsedTime),
      };

      this.records.unshift(record);
      this.saveData();

      // 检查称号升级和功能解锁
      const oldTitle = this.getTitleByPoints(oldTotal);
      const newTitle = this.currentTitle;
      
      // 称号升级提示
      if (oldTitle !== newTitle) {
        let unlockMessage = '';
        // 如果达到100积分，同时提示匹配功能解锁
        if (oldTotal < 100 && this.totalPoints >= 100) {
          unlockMessage = '\n\n🎊 同时解锁匹配功能！';
        }
        
        uni.showModal({
          title: '🎉 恭喜！',
          content: `您获得了新称号：${newTitle}${unlockMessage}`,
          showCancel: false,
          success: () => {
            // 如果只解锁匹配功能（没有称号升级），单独提示
            if (oldTitle === newTitle && oldTotal < 100 && this.totalPoints >= 100) {
              setTimeout(() => {
                uni.showModal({
                  title: '🎊 功能解锁',
                  content: '恭喜！您已解锁匹配功能！\n现在可以在首页使用匹配功能了。',
                  showCancel: false,
                });
              }, 500);
            }
          },
        });
      } else if (oldTotal < 100 && this.totalPoints >= 100) {
        // 如果没有称号升级，但解锁了匹配功能
        uni.showModal({
          title: '🎊 功能解锁',
          content: '恭喜！您已解锁匹配功能！\n现在可以在首页使用匹配功能了。',
          showCancel: false,
        });
      }

      uni.showToast({
        title: `完成！获得${points}积分`,
        icon: 'success',
      });

      // 重置选择
      this.selectedLevel = null;
      this.selectedTimes = null;
      this.elapsedTime = 0;
    },
    formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    // 根据积分获取称号（用于判断是否升级）
    // 称号会保留，直到达到下一级
    getTitleByPoints(points) {
      if (points >= 300) return '天生的跑者';
      if (points >= 100) return '跑步健将';
      if (points >= 30) return '小有经验的跑者';
      return '新手跑者';
    },
    goHistory() {
      uni.navigateTo({ url: '/pages/target/history' });
    },
    goHome() {
      uni.reLaunch({ url: '/pages/home/home' });
    },
    toggleVolumePanel() {
      this.showVolumePanel = !this.showVolumePanel;
    },
    closeVolumePanel() {
      this.showVolumePanel = false;
    },
    onVolumeChange(e) {
      const newVolume = e.detail.value / 100;
      this.setVolume(newVolume);
    },
    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume));
      audioManager.setVolume(this.volume);
      // 保存音量设置
      try {
        uni.setStorageSync('audioVolume', this.volume.toString());
      } catch (e) {
        console.error('保存音量设置失败:', e);
      }
    },
    loadVolume() {
      // 从本地存储加载音量设置
      try {
        const savedVolume = uni.getStorageSync('audioVolume');
        if (savedVolume !== null && savedVolume !== '') {
          this.volume = parseFloat(savedVolume) || 0.5;
        }
        audioManager.setVolume(this.volume);
      } catch (e) {
        console.error('加载音量设置失败:', e);
      }
    },
  },
  computed: {
    volumeIcon() {
      if (this.volume === 0) return '🔇';
      if (this.volume < 0.3) return '🔉';
      if (this.volume < 0.7) return '🔊';
      return '🔊';
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
  padding: 40rpx 28rpx 40rpx;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  font-size: 36rpx;
  color: #e8ecf5;
  padding: 16rpx;
  z-index: 1;
}

.logo {
  font-size: 44rpx;
  font-weight: 700;
  color: #e8ecf5;
  font-style: italic;
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.volume-control {
  padding: 12rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.volume-icon {
  font-size: 28rpx;
}

.history-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.history-btn text {
  color: #e8ecf5;
  font-size: 26rpx;
}

.volume-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.volume-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background: rgba(26, 39, 68, 0.95);
  border: 2rpx solid rgba(92, 225, 230, 0.5);
  border-radius: 24rpx;
  padding: 32rpx;
  z-index: 1000;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10rpx);
}

.volume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.volume-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #e8ecf5;
}

.volume-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #8ea0c2;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.volume-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.volume-slider-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.volume-label {
  font-size: 26rpx;
  color: #8ea0c2;
  text-align: center;
}

.volume-slider {
  width: 100%;
  margin: 0;
}

.volume-buttons {
  display: flex;
  justify-content: space-around;
  gap: 16rpx;
}

.volume-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  transition: all 0.3s;
}

.volume-btn:active {
  background: rgba(92, 225, 230, 0.2);
  border-color: #5ce1e6;
}

.volume-btn text:first-child {
  font-size: 36rpx;
}

.btn-label {
  font-size: 22rpx;
  color: #8ea0c2;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.level-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 24rpx;
  padding: 32rpx;
  transition: all 0.3s;
}

.level-card.selected {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.15);
  box-shadow: 0 8rpx 24rpx rgba(92, 225, 230, 0.3);
}

.level-1 {
  border-color: rgba(92, 225, 230, 0.3);
}

.level-2 {
  border-color: rgba(250, 140, 22, 0.3);
}

.level-3 {
  border-color: rgba(250, 140, 22, 0.5);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.level-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #e8ecf5;
}

.level-points {
  font-size: 28rpx;
  font-weight: 600;
  color: #fa8c16;
}

.level-desc {
  font-size: 24rpx;
  color: #fa8c16;
  margin-bottom: 24rpx;
}

.times-selector {
  display: flex;
  gap: 16rpx;
}

.time-btn {
  flex: 1;
  padding: 16rpx;
  background: rgba(92, 225, 230, 0.1);
  border: 2rpx solid rgba(92, 225, 230, 0.3);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s;
}

.time-btn text {
  color: #5ce1e6;
  font-size: 26rpx;
  font-weight: 600;
}

.time-btn.active {
  background: #5ce1e6;
  border-color: #5ce1e6;
}

.time-btn.active text {
  color: #1a2744;
}

.action-btn {
  margin-top: 20rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(92, 225, 230, 0.35);
}

.action-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}

.timer-display {
  text-align: center;
  margin-top: 20rpx;
}

.timer-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #5ce1e6;
  font-family: 'Courier New', monospace;
}

.stats {
  margin-top: 40rpx;
  display: flex;
  gap: 24rpx;
}

.stat-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #8ea0c2;
  margin-bottom: 8rpx;
}

.stat-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #fa8c16;
}
</style>

