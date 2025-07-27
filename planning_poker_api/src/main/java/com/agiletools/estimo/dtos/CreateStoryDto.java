package com.agiletools.estimo.dtos;

import lombok.Data;

@Data
public class CreateStoryDto {
    private Long id;
    private String title;
    private String description;
    private Long sessionId;
}
