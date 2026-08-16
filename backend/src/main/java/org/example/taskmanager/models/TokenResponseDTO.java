package org.example.taskmanager.models;

import java.time.Instant;

public record TokenResponseDTO(String accessToken, String tokenType, Instant expiresAt) {
    @Override
    public String toString() {
        return "TokenResponse[accessToken=***, tokenType=" + tokenType + ", expiresAt=" + expiresAt + "]";
    }
}
