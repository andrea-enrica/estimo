package com.agiletools.estimo.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthInfoDto {
    
    private String token;
    private UserProfileDto userDetails;
}
