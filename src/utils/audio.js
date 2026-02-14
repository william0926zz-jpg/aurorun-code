// 音频管理工具
// 使用方法：
// 1. 将音频文件放在 src/static/audio/ 目录下
// 2. 支持的格式：mp3, wav, m4a
// 3. 在页面中导入并使用：import audioManager from '@/utils/audio.js'

class AudioManager {
  constructor() {
    this.backgroundAudio = null;
    this.soundEffects = {};
    this.isPlaying = false;
    this.volume = 0.5; // 默认音量 0-1
  }

  // 播放背景音乐（循环播放）
  playBackground(src, loop = true) {
    // 先停止之前的背景音乐
    this.stopBackground();

    // 处理路径：在 H5 环境下，确保路径正确
    let audioSrc = src;
    // #ifdef H5
    // H5 环境下，处理不同格式的路径
    if (src.startsWith('http://') || src.startsWith('https://')) {
      // 已经是完整 URL，直接使用
      audioSrc = src;
    } else if (src.startsWith('/static/') || src.startsWith('/subpackages/')) {
      // 静态资源路径或分包路径，直接使用
      audioSrc = src;
    } else if (src.startsWith('../')) {
      // 相对路径，转换为绝对路径
      audioSrc = src.replace('../', '/');
    } else if (!src.startsWith('/')) {
      // 相对路径，添加 /static/
      audioSrc = '/static/' + src;
    }
    
    // 在开发环境下，vite 的静态资源可能需要特殊处理
    // 尝试不同的路径格式
    console.log('尝试播放音频，路径:', audioSrc);
    // #endif

    // #ifdef H5
    // H5 环境使用 HTML5 Audio
    this.backgroundAudio = new Audio();
    this.backgroundAudio.src = audioSrc;
    this.backgroundAudio.loop = loop;
    this.backgroundAudio.volume = this.volume;
    
    // 添加错误处理
    this.backgroundAudio.addEventListener('error', (e) => {
      console.error('音频加载失败:', e, '路径:', audioSrc);
      this.isPlaying = false;
    });
    
    // 尝试播放
    const playPromise = this.backgroundAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          console.log('音频播放成功:', audioSrc);
        })
        .catch((e) => {
          console.warn('音频播放失败:', e, '路径:', audioSrc);
          // 检查是否是路径问题
          if (e.name === 'NotSupportedError' || e.message.includes('source')) {
            console.error('音频文件路径可能不正确或格式不支持:', audioSrc);
          }
          this.isPlaying = false;
        });
    } else {
      // 如果 play() 返回 undefined，说明可能已经播放
      this.isPlaying = true;
    }
    // #endif

    // #ifndef H5
    // 小程序/App 环境使用 uni.createInnerAudioContext
    this.backgroundAudio = uni.createInnerAudioContext();
    this.backgroundAudio.src = src;
    this.backgroundAudio.loop = loop;
    this.backgroundAudio.volume = this.volume;
    this.backgroundAudio.play();
    this.isPlaying = true;

    this.backgroundAudio.onError((res) => {
      console.error('背景音乐播放失败:', res);
      this.isPlaying = false;
    });
    // #endif
  }

  // 停止背景音乐
  stopBackground() {
    if (this.backgroundAudio) {
      // #ifdef H5
      this.backgroundAudio.pause();
      this.backgroundAudio = null;
      // #endif

      // #ifndef H5
      this.backgroundAudio.stop();
      this.backgroundAudio.destroy();
      this.backgroundAudio = null;
      // #endif

      this.isPlaying = false;
    }
  }

  // 暂停/恢复背景音乐
  pauseBackground() {
    if (this.backgroundAudio && this.isPlaying) {
      // #ifdef H5
      this.backgroundAudio.pause();
      // #endif

      // #ifndef H5
      this.backgroundAudio.pause();
      // #endif

      this.isPlaying = false;
    }
  }

  resumeBackground() {
    if (this.backgroundAudio && !this.isPlaying) {
      // #ifdef H5
      this.backgroundAudio.play();
      // #endif

      // #ifndef H5
      this.backgroundAudio.play();
      // #endif

      this.isPlaying = true;
    }
  }

  // 设置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.backgroundAudio) {
      // #ifdef H5
      this.backgroundAudio.volume = this.volume;
      // #endif

      // #ifndef H5
      this.backgroundAudio.volume = this.volume;
      // #endif
    }
  }

  // 播放音效（不循环，播放一次）
  playSound(src, volume = 0.7) {
    // #ifdef H5
    {
      const soundAudio = new Audio();
      soundAudio.src = src;
      soundAudio.volume = volume;
      soundAudio.play().catch((e) => {
        console.warn('音效播放失败:', e);
      });
    }
    // #endif

    // #ifndef H5
    {
      const soundAudio = uni.createInnerAudioContext();
      soundAudio.src = src;
      soundAudio.volume = volume;
      soundAudio.play();

      soundAudio.onEnded(() => {
        soundAudio.destroy();
      });

      soundAudio.onError((res) => {
        console.error('音效播放失败:', res);
        soundAudio.destroy();
      });
    }
    // #endif
  }

  // 预加载音频
  preload(src) {
    return new Promise((resolve, reject) => {
      // #ifdef H5
      {
        const preloadAudio = new Audio();
        preloadAudio.src = src;
        preloadAudio.addEventListener('canplaythrough', () => resolve());
        preloadAudio.addEventListener('error', reject);
      }
      // #endif

      // #ifndef H5
      {
        const preloadAudio = uni.createInnerAudioContext();
        preloadAudio.src = src;
        preloadAudio.onCanplay(() => {
          preloadAudio.destroy();
          resolve();
        });
        preloadAudio.onError((res) => {
          preloadAudio.destroy();
          reject(res);
        });
      }
      // #endif
    });
  }
}

export default new AudioManager();

