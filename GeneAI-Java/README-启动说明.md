# 🚀 快速启动指南

## ⚠️ 重要提示

**您的系统当前只有Java 1.8，但项目需要Java 17+和Maven**

## 📋 快速安装（推荐）

### 方式一：使用安装脚本（最简单）

```bash
cd GeneAI-Java
chmod +x 快速安装.sh
./快速安装.sh
```

脚本会自动：
1. ✅ 检查并安装Homebrew（如果未安装）
2. ✅ 安装Java 17
3. ✅ 安装Maven
4. ✅ 配置环境变量

### 方式二：手动安装

#### 1. 安装Homebrew（如果未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. 安装Java 17和Maven

```bash
brew install openjdk@17 maven
```

#### 3. 配置Java环境变量

```bash
# 添加到 ~/.zshrc
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH

# 重新加载配置
source ~/.zshrc
```

#### 4. 验证安装

```bash
java -version  # 应该显示 17.x.x
mvn -version   # 应该显示Maven版本
```

## 🔑 配置API Key

启动前，必须配置OpenAI API Key：

```bash
export OPENAI_API_KEY=your_api_key_here
```

或编辑 `src/main/resources/application.yml`：

```yaml
openai:
  api:
    key: your_api_key_here
```

## 🎯 启动后端

### 方式一：使用Maven直接运行（推荐）

```bash
cd GeneAI-Java
mvn spring-boot:run
```

### 方式二：使用重启脚本

```bash
cd GeneAI-Java
chmod +x 重启后端.sh
./重启后端.sh
```

### 方式三：编译后运行

```bash
cd GeneAI-Java
mvn clean package
java -jar target/geneai-java-1.0.0.jar
```

## ✅ 验证服务

启动成功后，测试健康检查接口：

```bash
curl http://localhost:3000/health
```

**预期响应**：
```json
{
  "status": "ok",
  "message": "服务运行正常",
  "timestamp": 1234567890
}
```

## 📝 常见问题

### 问题1：Java版本不匹配

**错误**：`UnsupportedClassVersionError` 或 `Java version 1.8 is not supported`

**解决**：
1. 确保安装了Java 17+
2. 检查 `java -version` 输出
3. 如果显示1.8，需要重新打开终端或运行 `source ~/.zshrc`

### 问题2：Maven未找到

**错误**：`command not found: mvn`

**解决**：
```bash
# 安装Maven
brew install maven

# 验证
mvn -version
```

### 问题3：端口被占用

**错误**：`Port 3000 is already in use`

**解决**：
```bash
# 停止占用端口的进程
lsof -ti:3000 | xargs kill -9
```

### 问题4：API Key未配置

**错误**：AI聊天返回错误或空回复

**解决**：
1. 检查环境变量：`echo $OPENAI_API_KEY`
2. 检查配置文件：`cat src/main/resources/application.yml`
3. 确保API Key有效且有额度

## 📚 相关文档

- [环境配置指南](./环境配置指南.md) - 详细的安装说明
- [启动说明](./启动说明.md) - API Key配置和常见问题
- [网络错误排查指南](../网络错误排查指南.md) - 前端连接问题排查

## 🆘 需要帮助？

如果遇到问题，请提供：
1. `java -version` 的完整输出
2. `mvn -version` 的完整输出（如果已安装）
3. 错误信息的完整内容

