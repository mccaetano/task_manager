package org.example.taskmanager.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
    @NotBlank @Email String email,
    @NotBlank String password
) {
    @Override
    public String toString() {
        return "LoginRequest[email=" + email + ", password=***]";
    }
}
