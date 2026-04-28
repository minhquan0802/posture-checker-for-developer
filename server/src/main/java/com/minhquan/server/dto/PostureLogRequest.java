package com.minhquan.server.dto;

import com.minhquan.server.ENUM.WarningType;
import lombok.Data;

@Data
public class PostureLogRequest {
    private Integer userId;
    private WarningType warningType;
    private Integer durationSeconds;
    private Float distanceValue;
}