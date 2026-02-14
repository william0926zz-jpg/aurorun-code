package com.aurorun.geneai.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 用户信息模型
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String name;                    // 姓名
    private Integer age;                    // 年龄
    private String visionType;              // 视力类型（全盲、半盲、低视力、其他）
    private Integer currentMood;           // 当前情绪状态 (1-10)
    private String recentConcern;           // 最近困扰的事情
    private List<String> supportNeeds;      // 希望获得的支持
}

