package com.agiletools.estimo.controllers;

import org.springframework.web.bind.annotation.*;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.SessionEditDto;
import com.agiletools.estimo.dtos.SimpleUserDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.services.SessionService;
import com.agiletools.estimo.utils.enums.SessionStatus;
import com.agiletools.estimo.utils.security.AllowAdminManager;

import java.util.List;

@RestController
@RequestMapping("/session")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping("/all")
    public List<SessionDto> getSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping
    public List<SessionDto> getSessionByCreatorIdAndManagerId(@RequestParam(required = false) Long creatorId, @RequestParam(required = false) Long sessionManagerId) {
        return sessionService.getSessionByCreatorAndManager(creatorId, sessionManagerId);
    }

    @GetMapping("/paged")
    public PaginatedResponse<SessionDto> getSessions(@RequestParam(name = "size") Integer size,
                                                     @RequestParam(name = "page") Integer page) {
        return sessionService.sessionsPaginated(size, page);
    }

    @AllowAdminManager
    @PatchMapping("/{id}")
    public SessionDto updateSessionStatus(@RequestBody SessionStatus newStatus, @PathVariable Long id) {

        return sessionService.updateSessionStatus(id, newStatus);
    }

    @GetMapping("/{id}")
    public SessionDto getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id);
    }

    @AllowAdminManager
    @PostMapping
    public SessionDto createSession(@RequestBody SessionDto sessionDto) {
        return sessionService.createSession(sessionDto);
    }

    @AllowAdminManager
    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
    }

    @AllowAdminManager
    @PutMapping("/{id}")
    public SessionDto updateSessionDetails(@PathVariable Long id, @RequestBody SessionEditDto sessionEditDto) {
        return sessionService.updateSessionDetails(id, sessionEditDto);
    }

    @GetMapping("/users/{sessionId}")
    public List<SimpleUserDto> getUsersInSession(@PathVariable Long sessionId) {
        return sessionService.getUsersInSession(sessionId);
    }
}

