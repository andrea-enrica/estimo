package com.agiletools.estimo.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserMessageDto {
    private Long userId;
    private String userFullName;
    private Long storyId;
    private Long sessionId;
    private String estimation;
    private LocalDateTime votedTime;
    private boolean hasVoted;
    private Integer position;
    private String role;
}
