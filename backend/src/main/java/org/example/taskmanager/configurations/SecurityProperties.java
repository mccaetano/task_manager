package org.example.taskmanager.configurations;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Validated
@ConfigurationProperties(prefix = "security")
public record SecurityProperties(@Valid @NotNull Jwt jwt) {
    public record Jwt(
        @NotNull Resource publicKey,
        @NotNull Resource privateKey,
        @NotBlank String issuer,
        @NotNull Duration expiration
    ) {
    }
}
