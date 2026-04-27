package com.minhquan.server.dto;

import com.minhquan.server.ENUM.WarningType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DailyStatResponse {
    private int totalWarnings;       // Tổng số lần vi phạm
    private int totalDurationSeconds; // Tổng số giây vi phạm
}