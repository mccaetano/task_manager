package org.example.taskmanager.services;

import java.time.Instant;
import java.util.UUID;

import org.example.taskmanager.models.TaskEntity;
import org.example.taskmanager.models.TaskRequestDTO;
import org.example.taskmanager.models.TaskResponseDTO;
import org.example.taskmanager.models.UserEntity;
import org.example.taskmanager.repositories.TaskRepository;
import org.example.taskmanager.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public Page<TaskResponseDTO> findAll(Pageable page, UUID authenticatedUserId) {
        return taskRepository.findAllByUserId(page, authenticatedUserId).map(TaskResponseDTO::from);
    }

    public TaskResponseDTO findById(UUID id, UUID authenticatedUserId) {
        return TaskResponseDTO.from(findOwnedTask(id, authenticatedUserId));
    }

    public TaskResponseDTO add(TaskRequestDTO request, UUID authenticatedUserId) {
        UserEntity user = userRepository.findById(authenticatedUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        TaskEntity task = new TaskEntity();
        task.setId(UUID.randomUUID());
        task.setTitle(request.title());
        task.setStatus(request.status());
        task.setDuedate(request.duedate());
        task.setUser(user);
        return TaskResponseDTO.from(taskRepository.saveAndFlush(task));
    }

    public TaskResponseDTO update(UUID id, TaskRequestDTO request, UUID authenticatedUserId) {
        TaskEntity task = findOwnedTask(id, authenticatedUserId);
        task.setTitle(request.title());
        task.setStatus(request.status());
        task.setDuedate(request.duedate());
        task.setUpdated(Instant.now());
        return TaskResponseDTO.from(taskRepository.save(task));
    }

    public void delete(UUID id, UUID authenticatedUserId) {
        taskRepository.delete(findOwnedTask(id, authenticatedUserId));
    }

    private TaskEntity findOwnedTask(UUID id, UUID authenticatedUserId) {
        return taskRepository.findByIdAndUserId(id, authenticatedUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }
}
