package com.agiletools.estimo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.dtos.UserProfileDto;
import com.agiletools.estimo.services.UserService;
import com.agiletools.estimo.utils.exceptions.UsernameAlreadyExistsException;
import com.agiletools.estimo.utils.security.AllowAdminManager;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(final UserService userService) {
        this.userService = userService;
    }

    @GetMapping()
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/profiles")
    public List<UserProfileDto> getAllUsersProfiles() {
        return userService.getAllUsersProfiles();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(@PathVariable final Long id, @RequestBody final UserDto userDto) {
        try {
            final UserProfileDto updatedUserProfile = userService.updateUserProfile(id, userDto);
            return ResponseEntity.ok(updatedUserProfile);
        } catch (final UsernameAlreadyExistsException e) {
            final Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (final Exception e) {
            final Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{id}")
    public UserProfileDto findUserProfileById(@PathVariable final Long id) {
        return userService.findUserProfileById(id);
    }

    @GetMapping("/sessions/{userId}")
    public List<SessionDto> getSessionsUserParticipatedIn(@PathVariable final Long userId) {
        return userService.getSessionsUserParticipatedIn(userId);
    }

    @GetMapping("/sessions/invited/{userId}")
    public List<SessionDto> getSessionsUserWasInvitedIn(@PathVariable final Long userId) {
        return userService.getSessionsUserWasInvitedIn(userId);
    }

    @AllowAdminManager
    @GetMapping("/managers")
    public List<UserDto> getSessionManagers() {
        return userService.getSessionManagers();
    }
}
