package org.example.taskmanager.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 72) String password,
    @NotBlank String name,
    @NotBlank String phone
) {
    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + ", password=***, name=" + name + ", phone=" + phone + "]";
    }
}
