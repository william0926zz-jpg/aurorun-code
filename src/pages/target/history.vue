<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <view class="back" @tap="goBack">
        <text>&lt;</text>
      </view>
      <text class="title">历史记录</text>
    </view>

    <view class="content">
      <view v-if="records.length === 0" class="empty">
        <text>暂无记录</text>
      </view>

      <view v-for="(record, index) in records" :key="record.id" class="record-card" :class="{ active: index === 0 }">
        <view class="record-header">
          <view class="record-info">
            <text class="record-number">{{ index + 1 }}</text>
            <view class="record-details">
              <text class="record-type">Level{{ record.level }} · {{ record.times }}次</text>
              <text class="record-points">{{ record.points }}积分</text>
            </view>
          </view>
          <view class="record-date">{{ formatDate(record.date) }}</view>
        </view>
        <view class="record-footer">
          <text class="record-time">{{ record.formattedTime || formatTime(record.duration) }}</text>
          <view class="delete-btn" @tap="deleteRecord(record.id)">
            <text>🗑️</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      records: [],
    };
  },
  onLoad() {
    this.loadRecords();
  },
  methods: {
    loadRecords() {
      try {
        const records = uni.getStorageSync('targetRecords');
        if (records) {
          this.records = JSON.parse(records) || [];
        }
      } catch (e) {
        console.error('加载记录失败:', e);
      }
    },
    deleteRecord(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.records = this.records.filter((r) => r.id !== id);
            try {
              uni.setStorageSync('targetRecords', JSON.stringify(this.records));
              uni.showToast({
                title: '删除成功',
                icon: 'success',
              });
            } catch (e) {
              console.error('保存失败:', e);
            }
          }
        },
      });
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${month}月${day}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },
    formatTime(ms) {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  padding-bottom: 40rpx;
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
  margin-bottom: 32rpx;
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

.content {
  padding: 0 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty {
  text-align: center;
  padding: 100rpx 0;
  color: #8ea0c2;
  font-size: 28rpx;
}

.record-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 24rpx;
  transition: all 0.3s;
}

.record-card.active {
  background: rgba(92, 225, 230, 0.15);
  border-color: #5ce1e6;
  box-shadow: 0 8rpx 24rpx rgba(92, 225, 230, 0.3);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.record-number {
  width: 48rpx;
  height: 48rpx;
  background: rgba(92, 225, 230, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5ce1e6;
  font-size: 24rpx;
  font-weight: 700;
}

.record-card.active .record-number {
  background: #5ce1e6;
  color: #1a2744;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.record-type {
  font-size: 28rpx;
  color: #e8ecf5;
  font-weight: 600;
}

.record-points {
  font-size: 24rpx;
  color: #fa8c16;
}

.record-date {
  font-size: 22rpx;
  color: #8ea0c2;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
}

.record-time {
  font-size: 32rpx;
  font-weight: 700;
  color: #5ce1e6;
  font-family: 'Courier New', monospace;
}

.delete-btn {
  width: 56rpx;
  height: 56rpx;
  background: rgba(250, 140, 22, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}
</style>

