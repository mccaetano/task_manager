package org.example.taskmanager.services;

import java.util.Locale;
import java.util.UUID;

import org.example.taskmanager.models.UserEntity;
import org.example.taskmanager.models.UserResponseDTO;
import org.example.taskmanager.models.UserUpdateRequestDTO;
import org.example.taskmanager.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO findCurrent(UUID authenticatedUserId) {
        return UserResponseDTO.from(findOwnedUser(authenticatedUserId, authenticatedUserId));
    }

    public UserResponseDTO findById(UUID id, UUID authenticatedUserId) {
        return UserResponseDTO.from(findOwnedUser(id, authenticatedUserId));
    }

    public UserResponseDTO update(UUID id, UUID authenticatedUserId, UserUpdateRequestDTO request) {
        UserEntity user = findOwnedUser(id, authenticatedUserId);
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmailIgnoreCase(email)
            .filter(existing -> !existing.getId().equals(user.getId()))
            .ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
            });

        user.setEmail(email);
        user.setName(request.name());
        user.setPhone(request.phone());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return UserResponseDTO.from(userRepository.save(user));
    }

    public void delete(UUID id, UUID authenticatedUserId) {
        userRepository.delete(findOwnedUser(id, authenticatedUserId));
    }

    private UserEntity findOwnedUser(UUID id, UUID authenticatedUserId) {
        if (!id.equals(authenticatedUserId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
