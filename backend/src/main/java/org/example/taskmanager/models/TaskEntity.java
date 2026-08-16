package org.example.taskmanager.models;

import java.time.Instant;
import java.util.UUID;

import org.example.taskmanager.core.StatusEnum;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "TB_TASKS")
public class TaskEntity {
    @Id
    private UUID id;
    @NotNull
    private String title;
    private Instant updated;
    @NotNull
    private StatusEnum status;
    @NotNull
    private Instant duedate;
    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserEntity user;

    public TaskEntity() {
        this.updated = Instant.now();
    }
}
