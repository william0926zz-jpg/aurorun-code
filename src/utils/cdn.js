// CDN 资源配置
// 将大文件（音频、图片等）上传到 CDN，减少主包大小

// CDN 基础地址（jsDelivr CDN）
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/william0926zz-jpg/aurorun-audio';

// 音频资源 CDN 路径
export const AUDIO_CDN = {
  // 背景音乐 - 使用 jsDelivr CDN
  forest1: 'https://cdn.jsdelivr.net/gh/william0926zz-jpg/aurorun-audio/森林1.mp3',
  forest2: 'https://cdn.jsdelivr.net/gh/william0926zz-jpg/aurorun-audio/森林2.mp3',
};

// 图片资源 CDN 路径（如果需要）
export const IMAGE_CDN = {
  logo: `${CDN_BASE_URL}/images/logo.png`,
};

// 获取完整的 CDN URL
export function getCDNUrl(path) {
  if (!path) return '';
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果是相对路径，拼接 CDN 基础地址
  return `${CDN_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
}

// 检查是否使用 CDN（可以根据环境变量或配置切换）
export function useCDN() {
  // CDN 已配置，始终使用 CDN
  return true;
}

