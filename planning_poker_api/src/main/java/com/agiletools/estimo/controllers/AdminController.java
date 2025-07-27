package com.agiletools.estimo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.services.UserService;
import com.agiletools.estimo.utils.exceptions.UsernameAlreadyExistsException;
import com.agiletools.estimo.utils.security.AllowAdminOnly;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {
    
    private final UserService userService;

    public AdminController(final UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/paged")
    public PaginatedResponse<UserDto> usersPaginated(@RequestParam(name = "size") final Integer size, @RequestParam(name = "page") final Integer page) {
        return userService.usersPaginated(size, page);
    }

    @AllowAdminOnly
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody final UserDto userDto) {
        try {
            final UserDto createdUser = userService.createUser(userDto);
            return ResponseEntity.ok(createdUser);
        }catch (final UsernameAlreadyExistsException e) {
            final Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }catch (final Exception e) {
            final Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @AllowAdminOnly
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@RequestBody final UserDto userDto, @PathVariable final Long id) {
        try {
            final UserDto updatedUser = userService.updateAdmin(id, userDto);
            return ResponseEntity.ok(updatedUser);
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

    @AllowAdminOnly
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable final Long id) {
        userService.deleteUser(id);
    }

    @AllowAdminOnly
    @GetMapping("/users/{id}")
    public UserDto findUserById(@PathVariable final Long id) {
        return userService.findUserById(id);
    }
}
