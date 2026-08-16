package org.example.taskmanager.models;

import java.time.Instant;

import org.example.taskmanager.core.StatusEnum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TaskRequestDTO(
    @NotBlank String title,
    @NotNull StatusEnum status,
    @NotNull Instant duedate
) {
}
