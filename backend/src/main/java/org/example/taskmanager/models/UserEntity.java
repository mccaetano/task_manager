package org.example.taskmanager.models;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "TB_USERS")
public class UserEntity {
    @Id
    private UUID id;
    @NotNull
    @Column(nullable = false, unique = true)
    private String email;
    @NotNull
    @Column(name = "passord", nullable = false)
    @ToString.Exclude
    private String password;
    @NotNull
    private String name;
    @NotNull
    private String phone;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<TaskEntity> tasks;
}
