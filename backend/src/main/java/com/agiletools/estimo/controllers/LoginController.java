package com.agiletools.estimo.controllers;


import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.agiletools.estimo.dtos.AuthInfoDto;
import com.agiletools.estimo.dtos.UserCredentialsDto;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.dtos.UserProfileDto;
import com.agiletools.estimo.services.JwtTokenService;
import com.agiletools.estimo.services.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LoginController {

    private final JwtTokenService jwtTokenService;
    private final UserService userService;

    @PostMapping(value = "/login")
    @SneakyThrows
    public ResponseEntity<?> login(@RequestBody UserCredentialsDto userCredentials) {

        UserDto loggedUser = userService.getUserByCredentialsAndPassword(userCredentials.getCredential(),
                userCredentials.getPassword());

        if (loggedUser == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        String jwt = jwtTokenService.createJwtToken(loggedUser);

        UserProfileDto userDetails = UserProfileDto.builder()
                .username(loggedUser.getUsername())
                .fullName((loggedUser.getFullName())).build();

        return ResponseEntity.ok(new AuthInfoDto(jwt, userDetails));
    }

    @GetMapping("/healthcheck")
    public ResponseEntity<?> healthcheck() {
        return ResponseEntity.ok().build();
    }
}
