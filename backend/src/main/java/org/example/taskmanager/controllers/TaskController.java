package org.example.taskmanager.controllers;

import java.util.UUID;

import org.example.taskmanager.models.TaskRequestDTO;
import org.example.taskmanager.models.TaskResponseDTO;
import org.example.taskmanager.services.CurrentUserService;
import org.example.taskmanager.services.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/tasks")
public class TaskController {
    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    public TaskController(TaskService taskService, CurrentUserService currentUserService) {
        this.taskService = taskService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public Page<TaskResponseDTO> findAll(Pageable page, @AuthenticationPrincipal Jwt jwt) {
        return taskService.findAll(page, currentUserService.id(jwt));
    }

    @GetMapping("{id}")
    public TaskResponseDTO findById(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return taskService.findById(id, currentUserService.id(jwt));
    }

    @PostMapping
    public TaskResponseDTO add(@RequestBody @Valid TaskRequestDTO request, @AuthenticationPrincipal Jwt jwt) {
        return taskService.add(request, currentUserService.id(jwt));
    }

    @PutMapping("{id}")
    public TaskResponseDTO update(
        @PathVariable UUID id,
        @RequestBody @Valid TaskRequestDTO request,
        @AuthenticationPrincipal Jwt jwt
    ) {
        return taskService.update(id, request, currentUserService.id(jwt));
    }

    @DeleteMapping("{id}")
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        taskService.delete(id, currentUserService.id(jwt));
    }
}
