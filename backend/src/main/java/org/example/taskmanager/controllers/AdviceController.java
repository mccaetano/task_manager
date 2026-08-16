package org.example.taskmanager.controllers;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class AdviceController {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handle(ResponseStatusException exception) {
        log.warn(exception.getReason());
        return ResponseEntity.status(exception.getStatusCode())
            .body(new ApiError(Instant.now(), exception.getStatusCode().value(), exception.getReason()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handle(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .orElse("Invalid request");
        return ResponseEntity.badRequest().body(new ApiError(Instant.now(), 400, message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handle(Exception exception) {
        log.error(exception.getMessage(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiError(Instant.now(), 500, "Internal server error"));
    }

    public record ApiError(Instant timestamp, int status, String message) {
    }
}
