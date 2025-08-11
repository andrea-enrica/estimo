package com.agiletools.estimo.dtos;

import lombok.Data;

@Data
public class AddFeedbackDto {
    private Integer rating;
    private String feedback;
}
