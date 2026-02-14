# GeneAI Java版本 - 盲人心理辅导AI聊天系统

这是GeneAI的Java版本，使用Spring Boot框架实现。

## 功能特性

- ✅ 心理状态分析（情绪、风险等级、关注点等）
- ✅ AI聊天回复（基于心理分析结果）
- ✅ 用户信息管理
- ✅ RESTful API接口

## 技术栈

- Java 17
- Spring Boot 3.2.0
- OpenAI Java Client
- Maven

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+

### 2. 配置API Key

创建 `.env` 文件或在环境变量中设置：

```bash
OPENAI_API_KEY=your_api_key_here
```

或者在 `application.yml` 中直接配置：

```yaml
openai:
  api:
    key: your_api_key_here
```

### 3. 编译运行

```bash
# 编译
mvn clean package

# 运行
java -jar target/geneai-java-1.0.0.jar
```

或者使用Maven直接运行：

```bash
mvn spring-boot:run
```

### 4. 访问API

服务启动后，默认运行在 `http://localhost:3000`

## API接口

### 发送消息

```http
POST /api/ai/chat/messages
Content-Type: application/json

{
  "sessionId": "session_123",
  "message": "我今天感觉很焦虑"
}
```

响应：
```json
{
  "code": 200,
  "message": "发送成功",
  "data": {
    "sessionId": "session_123",
    "userMessage": "我今天感觉很焦虑",
    "aiResponse": "小暖的回复...",
    "analysis": {
      "emotionalState": "焦虑",
      "riskLevel": "中",
      "psychologicalIssues": ["焦虑情绪"],
      "keyConcerns": ["情绪管理"],
      "suggestedApproach": "提供情绪疏导",
      "supportiveKeywords": ["理解", "陪伴"]
    }
  }
}
```

### 获取会话历史

```http
GET /api/ai/chat/sessions/{sessionId}/messages
```

### 保存用户信息

```http
POST /api/ai/chat/user-info
Content-Type: application/json

{
  "name": "张三",
  "age": 25,
  "visionType": "全盲",
  "currentMood": 5,
  "recentConcern": "最近工作压力大",
  "supportNeeds": ["压力缓解", "情感陪伴"]
}
```

## 与UniApp前端集成

前端可以直接调用这些API接口：

```javascript
// 在 src/api/aiChat.js 中
export const sendMessage = (sessionId, message) =>
  api.post('/api/ai/chat/messages', { sessionId, message });
```

## 注意事项

1. **会话存储**：当前使用内存存储，生产环境应使用Redis或数据库
2. **API Key安全**：不要将API Key提交到代码仓库
3. **错误处理**：生产环境需要更完善的错误处理和日志记录

## 项目结构

```
GeneAI-Java/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/aurorun/geneai/
        │       ├── GeneAiApplication.java
        │       ├── controller/
        │       │   └── AiChatController.java
        │       ├── model/
        │       │   ├── ChatMessage.java
        │       │   ├── PsychologicalAnalysis.java
        │       │   └── UserInfo.java
        │       └── service/
        │           ├── ChatService.java
        │           └── PsychologicalAnalysisService.java
        └── resources/
            └── application.yml
```

