package org.example.taskmanager.controllers;

import java.util.UUID;

import org.example.taskmanager.models.UserResponseDTO;
import org.example.taskmanager.models.UserUpdateRequestDTO;
import org.example.taskmanager.services.CurrentUserService;
import org.example.taskmanager.services.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/users")
public class UserController {
    private final UserService userService;
    private final CurrentUserService currentUserService;

    public UserController(UserService userService, CurrentUserService currentUserService) {
        this.userService = userService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public UserResponseDTO findCurrent(@AuthenticationPrincipal Jwt jwt) {
        return userService.findCurrent(currentUserService.id(jwt));
    }

    @GetMapping("{id}")
    public UserResponseDTO findById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return userService.findById(id, currentUserService.id(jwt));
    }

    @PutMapping("{id}")
    public UserResponseDTO update(
        @PathVariable UUID id,
        @RequestBody @Valid UserUpdateRequestDTO request,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return userService.update(id, currentUserService.id(jwt), request);
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        userService.delete(id, currentUserService.id(jwt));
    }
}
