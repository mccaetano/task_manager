package org.example.taskmanager.controllers;

import org.example.taskmanager.models.LoginRequestDTO;
import org.example.taskmanager.models.RegisterRequestDTO;
import org.example.taskmanager.models.TokenResponseDTO;
import org.example.taskmanager.models.UserResponseDTO;
import org.example.taskmanager.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@RequestBody @Valid RegisterRequestDTO request) {
        return authService.register(request);
    }

    @PostMapping("login")
    public TokenResponseDTO login(@RequestBody @Valid LoginRequestDTO request) {
        return authService.login(request);
    }
}
