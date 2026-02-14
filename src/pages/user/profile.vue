<template>
  <view class="page">
    <view class="glow glow-a"></view>
    <view class="glow glow-b"></view>

    <view class="header">
      <view class="back" @tap="goBack">
        <text>&lt;</text>
      </view>
      <text class="title">用户信息录入</text>
    </view>

    <scroll-view class="content" scroll-y>
      <view class="form">
        <!-- 年龄 -->
        <view class="form-item">
          <text class="label">年龄</text>
          <input
            v-model="formData.age"
            class="input"
            type="number"
            placeholder="请输入年龄"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 身高 -->
        <view class="form-item">
          <text class="label">身高 (cm)</text>
          <input
            v-model="formData.height"
            class="input"
            type="number"
            placeholder="请输入身高"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 体重 -->
        <view class="form-item">
          <text class="label">体重 (kg)</text>
          <input
            v-model="formData.weight"
            class="input"
            type="number"
            placeholder="请输入体重"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 视力类型（仅盲人端显示） -->
        <view class="form-item" v-if="role === 'blind'">
          <text class="label">视力类型</text>
          <view class="radio-group">
            <view
              class="radio-item"
              :class="{ active: formData.visionType === 'half' }"
              @tap="formData.visionType = 'half'"
            >
              <view class="radio-dot">
                <view v-if="formData.visionType === 'half'" class="radio-inner"></view>
              </view>
              <text>半盲</text>
            </view>
            <view
              class="radio-item"
              :class="{ active: formData.visionType === 'full' }"
              @tap="formData.visionType = 'full'"
            >
              <view class="radio-dot">
                <view v-if="formData.visionType === 'full'" class="radio-inner"></view>
              </view>
              <text>全盲</text>
            </view>
          </view>
        </view>

        <!-- 志愿经验（仅志愿者端显示） -->
        <view class="form-item" v-if="role === 'volunteer'">
          <text class="label">志愿经验</text>
          <input
            v-model="formData.volunteerExperience"
            class="input"
            placeholder="例如：志愿陪跑1年、参加3次马拉松陪跑"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 跑步经验 -->
        <view class="form-item">
          <text class="label">跑步经验</text>
          <input
            v-model="formData.experience"
            class="input"
            placeholder="例如：6个月到2年、1年到3年"
            placeholder-class="placeholder"
          />
        </view>

        <!-- 适合跑步的地区 -->
        <view class="form-item">
          <text class="label">适合跑步的地区</text>
          <view class="location-selector">
            <picker
              mode="selector"
              :range="cityList"
              :value="cityIndex"
              @change="onCityChange"
            >
              <view class="picker">
                <text :class="formData.runningArea ? 'picker-text' : 'picker-placeholder'">
                  {{ formData.runningArea || '请选择城市' }}
                </text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
            <view class="map-btn" @tap="chooseLocation">
              <text>📍 地图选择</text>
            </view>
          </view>
          <view v-if="formData.locationDetail" class="location-detail">
            <text class="location-detail-text">{{ formData.locationDetail }}</text>
          </view>
        </view>

        <!-- 其他备注 -->
        <view class="form-item">
          <text class="label">其他</text>
          <textarea
            v-model="formData.remarks"
            class="textarea"
            placeholder="请输入其他备注信息"
            placeholder-class="placeholder"
            :maxlength="500"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="footer">
      <view class="save-btn" @tap="saveProfile">
        <text>保存用户信息</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      role: 'blind', // blind: 盲人，volunteer: 志愿者
      cityList: [
        '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆',
        '天津', '苏州', '长沙', '郑州', '济南', '青岛', '大连', '厦门', '福州', '合肥',
        '石家庄', '太原', '沈阳', '长春', '哈尔滨', '南昌', '南宁', '海口', '昆明', '贵阳',
        '其他城市'
      ],
      formData: {
        age: '',
        height: '',
        weight: '',
        visionType: 'half', // half: 半盲, full: 全盲
        experience: '',
        runningArea: '',
        locationDetail: '', // 地图选择的详细地址
        remarks: '',
        volunteerExperience: '',
      },
    };
  },
  computed: {
    cityIndex() {
      const index = this.cityList.indexOf(this.formData.runningArea);
      return index >= 0 ? index : 0;
    },
  },
  onLoad() {
    // 读取当前角色，控制表单字段显示
    try {
      const storedRole = uni.getStorageSync('userRole');
      if (storedRole) {
        this.role = storedRole;
      }
    } catch (e) {}
    this.loadProfile();
  },
  methods: {
    loadProfile() {
      // 从本地存储加载用户信息
      try {
        const profile = uni.getStorageSync('userProfile');
        if (profile) {
          const data = JSON.parse(profile);
          this.formData = { ...this.formData, ...data };
        }
      } catch (e) {
        console.error('加载用户信息失败:', e);
      }
    },
    onCityChange(e) {
      const index = e.detail.value;
      this.formData.runningArea = this.cityList[index];
      // 选择城市后，清空地图选择的详细地址
      this.formData.locationDetail = '';
    },
    chooseLocation() {
      // 使用 uni-app 的地图选择位置 API
      uni.chooseLocation({
        success: (res) => {
          // 从详细地址中提取城市名（简单处理）
          const address = res.address || '';
          const name = res.name || '';
          
          // 尝试从地址中提取城市名
          let cityName = '';
          for (let city of this.cityList) {
            if (address.includes(city) || name.includes(city)) {
              cityName = city;
              break;
            }
          }
          
          // 如果找到匹配的城市，更新城市选择
          if (cityName) {
            this.formData.runningArea = cityName;
          } else {
            // 如果没有匹配，使用地址中的第一个城市或使用"其他城市"
            const match = address.match(/([\u4e00-\u9fa5]+(?:市|省))/);
            if (match) {
              this.formData.runningArea = match[1].replace('省', '').replace('市', '');
            } else {
              this.formData.runningArea = '其他城市';
            }
          }
          
          // 保存详细地址信息
          this.formData.locationDetail = `${name} - ${address}`;
          
          uni.showToast({
            title: '位置选择成功',
            icon: 'success',
          });
        },
        fail: (err) => {
          console.error('选择位置失败:', err);
          // 在某些平台（如H5）可能不支持，提示用户
          if (err.errMsg && err.errMsg.includes('not support')) {
            uni.showToast({
              title: '当前平台不支持地图选择',
              icon: 'none',
            });
          } else {
            uni.showToast({
              title: '选择位置失败，请重试',
              icon: 'none',
            });
          }
        },
      });
    },
    saveProfile() {
      // 验证必填项
      if (!this.formData.age || !this.formData.height || !this.formData.weight) {
        uni.showToast({
          title: '请填写年龄、身高、体重',
          icon: 'none',
        });
        return;
      }

      if (!this.formData.experience || this.formData.experience.trim() === '') {
        uni.showToast({
          title: '请填写跑步经验',
          icon: 'none',
        });
        return;
      }

      // 保存到本地存储
      try {
        uni.setStorageSync('userProfile', JSON.stringify(this.formData));
        uni.showToast({
          title: '保存成功',
          icon: 'success',
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        console.error('保存失败:', e);
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none',
        });
      }
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

.form {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.label {
  font-size: 30rpx;
  font-weight: 600;
  color: #e8ecf5;
}

.input {
  height: 96rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 0 24rpx;
  color: #e8ecf5;
  font-size: 28rpx;
  transition: all 0.3s;
}

.input:focus {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.1);
}

.placeholder {
  color: #6f7ea2;
}

.radio-group {
  display: flex;
  gap: 32rpx;
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
  font-size: 28rpx;
  transition: all 0.3s;
}

.radio-item.active {
  border-color: #fa8c16;
  background: rgba(250, 140, 22, 0.15);
}

.radio-dot {
  width: 40rpx;
  height: 40rpx;
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
  width: 24rpx;
  height: 24rpx;
  background: #fa8c16;
  border-radius: 50%;
}

.picker {
  height: 96rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e8ecf5;
  font-size: 28rpx;
  transition: all 0.3s;
}

.picker:active {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.1);
}

.picker-text {
  color: #e8ecf5;
}

.picker-placeholder {
  color: #6f7ea2;
}

.picker-arrow {
  color: #8ea0c2;
  font-size: 24rpx;
}

.location-selector {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.location-selector .picker {
  flex: 1;
}

.map-btn {
  padding: 18rpx 24rpx;
  background: rgba(92, 225, 230, 0.15);
  border: 2rpx solid rgba(92, 225, 230, 0.4);
  border-radius: 16rpx;
  color: #5ce1e6;
  font-size: 26rpx;
  white-space: nowrap;
  transition: all 0.3s;
}

.map-btn:active {
  background: rgba(92, 225, 230, 0.25);
  border-color: rgba(92, 225, 230, 0.6);
}

.location-detail {
  margin-top: 12rpx;
  padding: 16rpx;
  background: rgba(92, 225, 230, 0.08);
  border-radius: 12rpx;
  border: 1rpx solid rgba(92, 225, 230, 0.2);
}

.location-detail-text {
  font-size: 24rpx;
  color: #8ea0c2;
  line-height: 1.5;
}

.textarea {
  min-height: 200rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 2rpx solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 24rpx;
  color: #e8ecf5;
  font-size: 28rpx;
  line-height: 1.6;
  transition: all 0.3s;
}

.textarea:focus {
  border-color: #5ce1e6;
  background: rgba(92, 225, 230, 0.1);
}

.footer {
  padding: 32rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.08);
  background: rgba(26, 39, 68, 0.8);
}

.save-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #5ce1e6, #fa8c16);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(92, 225, 230, 0.35);
}

.save-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
}
</style>

