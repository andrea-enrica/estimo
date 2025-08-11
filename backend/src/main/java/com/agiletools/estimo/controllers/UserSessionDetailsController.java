package com.agiletools.estimo.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.agiletools.estimo.dtos.AddFeedbackDto;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.UserSessionDetailsDto;
import com.agiletools.estimo.entities.InviteRequest;
import com.agiletools.estimo.services.UserSessionDetailsService;
import com.agiletools.estimo.utils.enums.UserSessionRole;
import com.agiletools.estimo.utils.security.AllowAdminManager;

import java.util.List;

@RestController
@RequestMapping("/user-session-details")
public class UserSessionDetailsController {

    private final UserSessionDetailsService userSessionDetailsService;

    public UserSessionDetailsController(UserSessionDetailsService userSessionDetailsService) {
        this.userSessionDetailsService = userSessionDetailsService;
    }

    @GetMapping("/all")
    public List<UserSessionDetailsDto> getUserSessionDetails() {
        return userSessionDetailsService.getAllUserSessionDetails();
    }

    @GetMapping("/user-session")
    public List<UserSessionDetailsDto> getUserSessionDetailsForSession(@RequestParam(name = "sessionId") Long sessionId) {
        return userSessionDetailsService.getAllUserSessionDetailsForSession(sessionId);
    }

    @AllowAdminManager
    @PostMapping("/invite")
    public ResponseEntity<?> inviteUsersToSession(@RequestBody InviteRequest inviteRequest) {
        try {
            userSessionDetailsService.inviteUsersToSession(inviteRequest);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptInviteToSession(@RequestParam(name = "userId") Long userId,
                                                   @RequestParam(name = "sessionId") Long sessionId) {
        try {
            userSessionDetailsService.acceptInviteToSession(userId, sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/decline")
    public ResponseEntity<?> declineInviteToSession(@RequestParam(name = "userId") Long userId,
                                                    @RequestParam(name = "sessionId") Long sessionId) {
        try {
            userSessionDetailsService.declineInviteToSession(userId, sessionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @AllowAdminManager
    @PostMapping("/assign")
    public ResponseEntity<?> assignManagerToSession(@RequestBody SessionDto sessionDto) {
        try {
            userSessionDetailsService.addManagerToSession(sessionDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.HEAD)
    public ResponseEntity<Void> isUserAssignedToSession(@RequestParam Long sessionId, @RequestParam Long userId) {
        boolean isAssigned = userSessionDetailsService.checkUserAssignedToSession(sessionId, userId);
        if (isAssigned) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{userId}/{sessionId}")
    public UserSessionDetailsDto addFeedback(@RequestBody AddFeedbackDto addFeedbackDto, @PathVariable Long userId, @PathVariable Long sessionId) {
        return userSessionDetailsService.addRatingAndFeedbackToSession(addFeedbackDto, userId, sessionId);
    }

    @GetMapping("/session-role")
    public UserSessionRole getSessionRoleAuthUser(@RequestParam Long sessionId, @RequestParam Long userId) {
        return userSessionDetailsService.getSessionRoleAuthUser(sessionId,userId);
    }

    @PatchMapping("/change-role/{userId}/{sessionId}")
    public UserSessionDetailsDto updateUserSessionRole(@RequestBody UserSessionRole newRole, @PathVariable Long userId, @PathVariable Long sessionId) {
        return userSessionDetailsService.updateUserSessionRole(userId,sessionId,newRole);
    }
}
