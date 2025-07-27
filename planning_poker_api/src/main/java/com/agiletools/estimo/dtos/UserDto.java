package com.agiletools.estimo.dtos;

import lombok.Data;

import java.util.List;

@Data
public class UserDto {
    
    private Long id;
    private String fullName;
    private String username;
    private String password;
    private String email;
    private String phoneNumber;
    private String role;
    private List<SessionDto> createdSessions;
    private List<SessionDto> managedSessions;
}
