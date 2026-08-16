package org.example.taskmanager.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequestDTO(
    @NotBlank @Email String email,
    @NotBlank String name,
    @NotBlank String phone,
    @Size(min = 8, max = 72) String password
) {
    @Override
    public String toString() {
        return "UserUpdateRequest[email=" + email + ", name=" + name + ", phone=" + phone + ", password=***]";
    }
}
