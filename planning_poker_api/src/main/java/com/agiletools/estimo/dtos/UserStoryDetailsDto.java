package com.agiletools.estimo.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserStoryDetailsDto {
    private UserStoryKeyDto id;
    private String estimation;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime votedTime;
}
