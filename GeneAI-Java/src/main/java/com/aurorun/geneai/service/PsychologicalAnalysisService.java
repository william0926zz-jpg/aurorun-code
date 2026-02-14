package com.aurorun.geneai.service;

import com.aurorun.geneai.model.ChatMessage;
import com.aurorun.geneai.model.PsychologicalAnalysis;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 心理分析服务
 */
@Service
public class PsychologicalAnalysisService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;

    public PsychologicalAnalysisService(@Value("${openai.api.key:}") String apiKey,
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
        // 确定 base URL
        if (System.getenv("DEEPSEEK_API_KEY") != null && !System.getenv("DEEPSEEK_API_KEY").isEmpty()) {
            this.baseUrl = "https://api.deepseek.com";
        } else {
            this.baseUrl = baseUrl;
        }
        
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 分析用户消息，识别心理问题和情绪状态
     */
    public PsychologicalAnalysis analyzePsychologicalState(String userMessage, List<ChatMessage> conversationHistory) {
        try {
            // 构建分析提示词
            String analysisPrompt = buildAnalysisPrompt(userMessage, conversationHistory);

            // 构建消息列表
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", 
                "content", "你是一位专业的心理分析师，擅长分析盲人群体的心理状态。只返回JSON格式的分析结果。"));
            messages.add(Map.of("role", "user", "content", analysisPrompt));

            // 判断使用哪个模型（DeepSeek 或 OpenAI）
            String modelName = "gpt-3.5-turbo";
            if (this.baseUrl.contains("deepseek")) {
                modelName = "deepseek-chat";
            }

            // 构建请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.3);

            // 设置请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(this.apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // 调用 API
            String apiUrl = this.baseUrl + "/v1/chat/completions";
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                request,
                JsonNode.class
            );

            // 解析响应
            JsonNode responseBody = response.getBody();
            if (responseBody != null && responseBody.has("choices")) {
                JsonNode choices = responseBody.get("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        String analysisText = firstChoice.get("message").get("content").asText().trim();

                        // 提取JSON（可能包含markdown代码块）
                        if (analysisText.contains("```json")) {
                            analysisText = analysisText.split("```json")[1].split("```")[0].trim();
                        } else if (analysisText.contains("```")) {
                            analysisText = analysisText.split("```")[1].split("```")[0].trim();
                        }

                        // 解析JSON
                        TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
                        Map<String, Object> analysisMap = objectMapper.readValue(analysisText, typeRef);
                        
                        PsychologicalAnalysis analysis = new PsychologicalAnalysis();
                        analysis.setEmotionalState((String) analysisMap.getOrDefault("emotional_state", "未知"));
                        
                        // 安全地转换List类型
                        Object issuesObj = analysisMap.getOrDefault("psychological_issues", new ArrayList<>());
                        if (issuesObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> issues = (List<String>) issuesObj;
                            analysis.setPsychologicalIssues(issues);
                        } else {
                            analysis.setPsychologicalIssues(new ArrayList<>());
                        }
                        
                        analysis.setRiskLevel((String) analysisMap.getOrDefault("risk_level", "低"));
                        
                        Object concernsObj = analysisMap.getOrDefault("key_concerns", new ArrayList<>());
                        if (concernsObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> concerns = (List<String>) concernsObj;
                            analysis.setKeyConcerns(concerns);
                        } else {
                            analysis.setKeyConcerns(new ArrayList<>());
                        }
                        
                        analysis.setSuggestedApproach((String) analysisMap.getOrDefault("suggested_approach", "继续倾听和陪伴"));
                        
                        Object keywordsObj = analysisMap.getOrDefault("supportive_keywords", Arrays.asList("理解", "陪伴", "支持"));
                        if (keywordsObj instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> keywords = (List<String>) keywordsObj;
                            analysis.setSupportiveKeywords(keywords);
                        } else {
                            analysis.setSupportiveKeywords(Arrays.asList("理解", "陪伴", "支持"));
                        }
                        analysis.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
                        analysis.setUserMessage(userMessage);

                        return analysis;
                    }
                }
            }

            throw new RuntimeException("API响应格式异常");

        } catch (Exception e) {
            // 出错时返回默认值
            System.err.println("心理分析出错: " + e.getMessage());
            e.printStackTrace();
            
            PsychologicalAnalysis defaultAnalysis = new PsychologicalAnalysis();
            defaultAnalysis.setEmotionalState("未知");
            defaultAnalysis.setPsychologicalIssues(new ArrayList<>());
            defaultAnalysis.setRiskLevel("低");
            defaultAnalysis.setKeyConcerns(new ArrayList<>());
            defaultAnalysis.setSuggestedApproach("继续倾听和陪伴");
            defaultAnalysis.setSupportiveKeywords(Arrays.asList("理解", "陪伴", "支持"));
            defaultAnalysis.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            defaultAnalysis.setUserMessage(userMessage);
            
            return defaultAnalysis;
        }
    }

    /**
     * 构建心理分析提示词
     */
    private String buildAnalysisPrompt(String userMessage, List<ChatMessage> conversationHistory) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一位专业的心理分析师。请分析以下盲人用户的对话内容，识别其心理状态和潜在问题。\n\n");
        prompt.append("用户当前消息：").append(userMessage).append("\n\n");
        
        prompt.append("对话历史（最近3条）：\n");
        if (conversationHistory != null && !conversationHistory.isEmpty()) {
            int startIndex = Math.max(0, conversationHistory.size() - 3);
            for (int i = startIndex; i < conversationHistory.size(); i++) {
                ChatMessage msg = conversationHistory.get(i);
                prompt.append("- ").append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
            }
        } else {
            prompt.append("无历史对话\n");
        }
        
        prompt.append("\n请以JSON格式返回分析结果，包含以下字段：\n");
        prompt.append("{\n");
        prompt.append("    \"emotional_state\": \"情绪状态（如：焦虑、抑郁、孤独、愤怒、平静、积极等）\",\n");
        prompt.append("    \"psychological_issues\": [\"识别的心理问题列表，如：社交焦虑、自我价值感低、适应困难等\"],\n");
        prompt.append("    \"risk_level\": \"风险等级（低/中/高）\",\n");
        prompt.append("    \"key_concerns\": [\"主要关注点\"],\n");
        prompt.append("    \"suggested_approach\": \"建议的疏导方向（简短描述）\",\n");
        prompt.append("    \"supportive_keywords\": [\"应该使用的支持性关键词\"]\n");
        prompt.append("}\n\n");
        prompt.append("只返回JSON，不要其他文字说明。");
        
        return prompt.toString();
    }
}
