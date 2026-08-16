package org.example.taskmanager.models;

import java.util.UUID;

public record UserResponseDTO(UUID id, String email, String name, String phone) {
    public static UserResponseDTO from(UserEntity user) {
        return new UserResponseDTO(user.getId(), user.getEmail(), user.getName(), user.getPhone());
    }
}
