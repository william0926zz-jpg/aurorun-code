# API Key 配置说明

## 🔑 快速配置

AI 聊天功能需要配置 API Key 才能正常工作。支持以下两种 API：

### 方式 1：使用 DeepSeek API（推荐，价格更便宜）

```bash
export DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

### 方式 2：使用 OpenAI API

```bash
export OPENAI_API_KEY=sk-your-openai-api-key-here
```

## 📝 详细步骤

### 1. 获取 API Key

#### DeepSeek API Key
1. 访问 https://platform.deepseek.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key（格式：`sk-xxxxx`）

#### OpenAI API Key
1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 API Key（格式：`sk-xxxxx`）

### 2. 配置环境变量

#### Linux/macOS
```bash
# 临时设置（当前终端会话有效）
export DEEPSEEK_API_KEY=sk-your-api-key-here

# 或永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export DEEPSEEK_API_KEY=sk-your-api-key-here' >> ~/.bashrc
source ~/.bashrc
```

#### Windows
```cmd
# 临时设置（当前命令行窗口有效）
set DEEPSEEK_API_KEY=sk-your-api-key-here

# 或永久设置（通过系统环境变量设置）
# 1. 右键"此电脑" -> "属性"
# 2. "高级系统设置" -> "环境变量"
# 3. 在"用户变量"中添加：DEEPSEEK_API_KEY = sk-your-api-key-here
```

### 3. 验证配置

启动后端服务后，发送一条消息测试。如果配置正确，AI 会正常回复；如果配置错误，会返回错误提示。

## ⚠️ 常见问题

### 问题 1：仍然显示"AI服务暂不可用"

**原因**：环境变量未正确设置或后端服务未重启

**解决**：
1. 检查环境变量：`echo $DEEPSEEK_API_KEY`（Linux/macOS）或 `echo %DEEPSEEK_API_KEY%`（Windows）
2. 确保环境变量已设置且值正确
3. **重启后端服务**（重要！）

### 问题 2：API Key 无效

**原因**：API Key 格式错误或已过期

**解决**：
1. 检查 API Key 格式（应该以 `sk-` 开头）
2. 登录对应平台检查 API Key 是否有效
3. 如果无效，创建新的 API Key

### 问题 3：后端启动失败

**原因**：API Key 未配置

**解决**：
- 后端会在启动时检查 API Key，如果未配置会抛出异常
- 按照上述步骤配置环境变量后重启服务

## 🔒 安全提示

1. **不要将 API Key 提交到代码仓库**
2. **不要在前端代码中硬编码 API Key**
3. **定期轮换 API Key**
4. **设置 API Key 使用限额**

## 📊 优先级说明

后端会按以下优先级查找 API Key：
1. `DEEPSEEK_API_KEY` 环境变量（优先）
2. `OPENAI_API_KEY` 环境变量
3. `application.yml` 配置文件中的 `openai.api.key`

如果都未配置，后端启动时会抛出异常。

