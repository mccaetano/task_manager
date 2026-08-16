package org.example.taskmanager.models;

import java.time.Instant;
import java.util.UUID;

import org.example.taskmanager.core.StatusEnum;

public record TaskResponseDTO(
    UUID id,
    String title,
    Instant updated,
    StatusEnum status,
    Instant duedate,
    UUID userId
) {
    public static TaskResponseDTO from(TaskEntity task) {
        return new TaskResponseDTO(
            task.getId(),
            task.getTitle(),
            task.getUpdated(),
            task.getStatus(),
            task.getDuedate(),
            task.getUser().getId()
        );
    }
}
