package org.example.taskmanager.repositories;

import java.util.UUID;
import java.util.Optional;

import org.example.taskmanager.models.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
    Page<TaskEntity> findAllByUserId(Pageable page, UUID user_id);

    Optional<TaskEntity> findByIdAndUserId(UUID id, UUID userId);
}
