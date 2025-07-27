package com.agiletools.estimo.dtos;

import lombok.Data;

@Data
public class UserSessionDetailsDto {

    private UserSessionKeyDto id;
    private String role;
    private Integer rating;
    private String feedback;
    private String status;
}
