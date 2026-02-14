package com.aurorun.geneai.controller;

import com.aurorun.geneai.model.ChatMessage;
import com.aurorun.geneai.model.PsychologicalAnalysis;
import com.aurorun.geneai.model.UserInfo;
import com.aurorun.geneai.service.ChatService;
import com.aurorun.geneai.service.PsychologicalAnalysisService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI聊天控制器
 */
@RestController
@RequestMapping("/api/ai/chat")
@CrossOrigin(origins = "*") // 允许跨域
public class AiChatController {

    private final ChatService chatService;
    private final PsychologicalAnalysisService analysisService;

    // 临时存储会话数据（生产环境应使用Redis或数据库）
    private final Map<String, SessionData> sessions = new HashMap<>();

    public AiChatController(ChatService chatService, PsychologicalAnalysisService analysisService) {
        this.chatService = chatService;
        this.analysisService = analysisService;
    }

    /**
     * 创建会话
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, String> request) {
        try {
            String title = request.getOrDefault("title", "新对话");
            String sessionId = "session_" + System.currentTimeMillis();
            
            // 创建新会话
            SessionData session = new SessionData();
            sessions.put(sessionId, session);
            
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "创建成功");
            
            Map<String, Object> data = new HashMap<>();
            data.put("sessionId", sessionId);
            data.put("title", title);
            result.put("data", data);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("message", "创建会话失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 发送消息
     */
    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            String sessionId = request.getSessionId();
            String message = request.getMessage();

            if (sessionId == null || sessionId.isEmpty()) {
                sessionId = "session_" + System.currentTimeMillis();
            }

            // 获取或创建会话
            SessionData session = sessions.computeIfAbsent(sessionId, k -> new SessionData());

            // 添加用户消息到历史
            session.getMessages().add(new ChatMessage("user", message));

            // 进行心理分析（使用最近5条消息）
            List<ChatMessage> recentHistory = session.getMessages().size() > 5 
                ? session.getMessages().subList(session.getMessages().size() - 5, session.getMessages().size())
                : new ArrayList<>(session.getMessages());

            PsychologicalAnalysis analysis = analysisService.analyzePsychologicalState(message, recentHistory);
            session.getAnalyses().add(analysis);

            // 获取AI回复
            ChatService.ChatResponse response = chatService.sendMessage(
                message, 
                session.getMessages().subList(0, session.getMessages().size() - 1), // 不包含刚添加的用户消息
                session.getUserInfo(),
                analysis
            );

            // 添加AI回复到历史
            session.getMessages().add(new ChatMessage("assistant", response.getAiResponse()));

            // 构建响应
            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "发送成功");
            
            Map<String, Object> data = new HashMap<>();
            data.put("sessionId", sessionId);
            data.put("userMessage", message);
            data.put("aiResponse", response.getAiResponse());
            data.put("analysis", analysis);
            result.put("data", data);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("message", "发送失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 获取会话历史
     */
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable String sessionId) {
        SessionData session = sessions.get(sessionId);
        if (session == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", 404);
            error.put("message", "会话不存在");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "获取成功");
        
        Map<String, Object> data = new HashMap<>();
        data.put("messages", session.getMessages());
        data.put("analyses", session.getAnalyses());
        result.put("data", data);

        return ResponseEntity.ok(result);
    }

    /**
     * 保存用户信息
     */
    @PostMapping("/user-info")
    public ResponseEntity<Map<String, Object>> saveUserInfo(@RequestBody UserInfo userInfo) {
        try {
            // 这里应该根据sessionId保存，简化处理使用默认session
            String sessionId = "default";
            SessionData session = sessions.computeIfAbsent(sessionId, k -> new SessionData());
            session.setUserInfo(userInfo);

            Map<String, Object> result = new HashMap<>();
            result.put("code", 200);
            result.put("message", "保存成功");
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("message", "保存失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 会话数据
     */
    @Data
    private static class SessionData {
        private List<ChatMessage> messages = new ArrayList<>();
        private List<PsychologicalAnalysis> analyses = new ArrayList<>();
        private UserInfo userInfo;
    }

    /**
     * 发送消息请求
     */
    @Data
    private static class SendMessageRequest {
        private String sessionId;
        private String message;
    }
}

