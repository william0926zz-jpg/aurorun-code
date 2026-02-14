package com.aurorun.geneai.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 心理分析结果模型
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PsychologicalAnalysis {
    private String emotionalState;           // 情绪状态
    private List<String> psychologicalIssues; // 心理问题列表
    private String riskLevel;                // 风险等级（低/中/高）
    private List<String> keyConcerns;        // 主要关注点
    private String suggestedApproach;        // 建议疏导方向
    private List<String> supportiveKeywords; // 支持性关键词
    private String timestamp;                 // 时间戳
    private String userMessage;              // 用户消息
}

