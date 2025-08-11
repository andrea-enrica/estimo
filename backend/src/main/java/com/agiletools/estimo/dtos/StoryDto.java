package com.agiletools.estimo.dtos;

import lombok.Data;

@Data
public class StoryDto {
    private Long key;
    private String title;
    private String description;
    private String average;
}
