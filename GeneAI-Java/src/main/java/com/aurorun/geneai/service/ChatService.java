package com.aurorun.geneai.service;

import com.aurorun.geneai.model.ChatMessage;
import com.aurorun.geneai.model.PsychologicalAnalysis;
import com.aurorun.geneai.model.UserInfo;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

/**
 * 聊天服务 - 处理AI对话
 */
@Service
public class ChatService {

    private final OpenAiService openAiService;
    private final String apiKey;
    private final String baseUrl;

    public ChatService(@Value("${openai.api.key:}") String apiKey,
                     @Value("${openai.api.base-url:https://api.openai.com}") String baseUrl) {
        // 优先从环境变量读取 API Key（支持 OpenAI 和 DeepSeek）
        if (apiKey == null || apiKey.isEmpty()) {
            // 先尝试 DeepSeek API Key
            apiKey = System.getenv("DEEPSEEK_API_KEY");
            if (apiKey == null || apiKey.isEmpty()) {
                // 再尝试 OpenAI API Key
                apiKey = System.getenv("OPENAI_API_KEY");
            }
        }
        
        // 如果仍然为空，抛出异常
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("API Key未配置。请设置环境变量 OPENAI_API_KEY 或 DEEPSEEK_API_KEY");
        }
        
        this.apiKey = apiKey;
        // 如果使用 DeepSeek，设置正确的 base URL
        if (System.getenv("DEEPSEEK_API_KEY") != null && !System.getenv("DEEPSEEK_API_KEY").isEmpty()) {
            this.baseUrl = "https://api.deepseek.com";
        } else {
            this.baseUrl = baseUrl;
        }
        
        // 创建 OpenAI 服务客户端（DeepSeek 也兼容 OpenAI API 格式）
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(60));
    }

    /**
     * 发送消息并获取AI回复（包含心理分析）
     */
    public ChatResponse sendMessage(String userMessage, List<ChatMessage> conversationHistory, 
                                    UserInfo userInfo, PsychologicalAnalysis latestAnalysis) {
        try {
            // 构建系统提示词
            String systemPrompt = buildSystemPrompt(userInfo, latestAnalysis);

            // 构建消息列表（使用OpenAI的ChatMessage）
            List<com.theokanning.openai.completion.chat.ChatMessage> messages = new ArrayList<>();
            messages.add(new com.theokanning.openai.completion.chat.ChatMessage(ChatMessageRole.SYSTEM.value(), systemPrompt));
            
            // 添加对话历史
            if (conversationHistory != null) {
                for (ChatMessage msg : conversationHistory) {
                    messages.add(new com.theokanning.openai.completion.chat.ChatMessage(
                        msg.getRole().equals("user") ? ChatMessageRole.USER.value() : ChatMessageRole.ASSISTANT.value(),
                        msg.getContent()
                    ));
                }
            }
            
            // 添加当前用户消息
            messages.add(new com.theokanning.openai.completion.chat.ChatMessage(ChatMessageRole.USER.value(), userMessage));

            // 调用OpenAI API（DeepSeek 也兼容 OpenAI API 格式）
            String modelName = "gpt-3.5-turbo";
            // 如果使用 DeepSeek，使用 DeepSeek 模型
            if (this.baseUrl.contains("deepseek")) {
                modelName = "deepseek-chat";
            }
            
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(modelName)
                    .messages(messages)
                    .temperature(0.7)
                    .build();

            String aiResponse = openAiService.createChatCompletion(request)
                    .getChoices().get(0).getMessage().getContent();

            return new ChatResponse(aiResponse, latestAnalysis);

        } catch (Exception e) {
            System.err.println("AI回复出错: " + e.getMessage());
            e.printStackTrace();
            
            // 检查是否是 API Key 相关错误
            String errorMsg = e.getMessage();
            if (errorMsg != null && (errorMsg.contains("401") || errorMsg.contains("Unauthorized") || 
                errorMsg.contains("Invalid API Key") || errorMsg.contains("Incorrect API key"))) {
                return new ChatResponse("抱歉，AI服务暂不可用。请确保已配置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量。", latestAnalysis);
            }
            
            return new ChatResponse("抱歉，我现在无法回复。请稍后再试。", latestAnalysis);
        }
    }

    /**
     * 构建系统提示词
     */
    private String buildSystemPrompt(UserInfo userInfo, PsychologicalAnalysis analysis) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位专门为盲人群体提供心理辅导的AI伙伴。你的名字是小暖，是一位温暖、理解、专业的心理辅导助手。\n\n");
        
        prompt.append("**你的核心职责：**\n");
        prompt.append("1. 倾听和理解：认真倾听用户的每一个想法和感受，给予充分的理解和共情\n");
        prompt.append("2. 心理疏导：根据用户的心理状态，提供温和、专业的心理疏导建议\n");
        prompt.append("3. 情感支持：用温暖的话语陪伴用户，让他们感受到被理解和支持\n");
        prompt.append("4. 积极引导：帮助用户建立积极的心态，增强自信心和适应能力\n\n");
        
        // 用户信息
        prompt.append("**当前用户信息：**\n");
        if (userInfo != null) {
            if (userInfo.getName() != null && !userInfo.getName().isEmpty()) {
                prompt.append("用户姓名：").append(userInfo.getName()).append("。\n");
            }
            if (userInfo.getVisionType() != null && !userInfo.getVisionType().isEmpty()) {
                prompt.append("视力类型：").append(userInfo.getVisionType()).append("。\n");
            }
        }
        
        // 心理分析结果
        if (analysis != null) {
            prompt.append("\n**心理分析结果（内部参考，不要直接告诉用户）：**\n");
            prompt.append("- 情绪状态：").append(analysis.getEmotionalState()).append("\n");
            prompt.append("- 识别的心理问题：")
                  .append(analysis.getPsychologicalIssues() != null ? 
                          String.join("、", analysis.getPsychologicalIssues()) : "无").append("\n");
            prompt.append("- 风险等级：").append(analysis.getRiskLevel()).append("\n");
            prompt.append("- 主要关注点：")
                  .append(analysis.getKeyConcerns() != null ? 
                          String.join("、", analysis.getKeyConcerns()) : "无").append("\n");
            prompt.append("- 建议疏导方向：").append(analysis.getSuggestedApproach()).append("\n");
            prompt.append("- 支持性关键词：")
                  .append(analysis.getSupportiveKeywords() != null ? 
                          String.join("、", analysis.getSupportiveKeywords()) : "无").append("\n");
        }
        
        prompt.append("\n**回复原则：**\n");
        prompt.append("1. 使用温暖、理解、支持性的语言，避免说教和命令式语气\n");
        prompt.append("2. 根据心理分析结果，自然地融入疏导内容，但不要直接提及\"心理分析\"或\"心理问题\"\n");
        prompt.append("3. 如果风险等级为\"高\"，要特别关注，建议寻求专业帮助，但语气要温和\n");
        prompt.append("4. 如果用户表达负面情绪，先给予共情和理解，再提供建设性的建议\n");
        prompt.append("5. 鼓励用户表达感受，让他们知道有人理解他们\n");
        prompt.append("6. 使用盲人友好的表达方式，避免过多视觉相关的比喻\n");
        prompt.append("7. 保持对话的自然流畅，不要显得过于机械化\n\n");
        
        prompt.append("**重要提醒：**\n");
        prompt.append("- 你是在进行心理疏导，不是诊断或治疗\n");
        prompt.append("- 如果用户有严重的心理危机（如自伤、自杀倾向），要温和地建议寻求专业心理医生帮助\n");
        prompt.append("- 保持专业边界，不要过度承诺或给出医疗建议\n\n");
        
        prompt.append("现在，请根据用户的对话内容，用温暖、理解的方式回复用户。");
        
        return prompt.toString();
    }

    /**
     * 聊天响应结果
     */
    public static class ChatResponse {
        private String aiResponse;
        private PsychologicalAnalysis analysis;

        public ChatResponse(String aiResponse, PsychologicalAnalysis analysis) {
            this.aiResponse = aiResponse;
            this.analysis = analysis;
        }

        public String getAiResponse() {
            return aiResponse;
        }

        public PsychologicalAnalysis getAnalysis() {
            return analysis;
        }
    }
}

