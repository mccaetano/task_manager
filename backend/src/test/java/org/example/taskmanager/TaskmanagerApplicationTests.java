package org.example.taskmanager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

import org.example.taskmanager.configurations.SecurityProperties;
import org.example.taskmanager.models.UserEntity;
import org.example.taskmanager.repositories.TaskRepository;
import org.example.taskmanager.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
class TaskmanagerApplicationTests {
    private static final String ISSUER = "task-manager-test";
    private static final Path PUBLIC_KEY;
    private static final Path PRIVATE_KEY;

    static {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            PUBLIC_KEY = writePem("PUBLIC KEY", keyPair.getPublic().getEncoded());
            PRIVATE_KEY = writePem("PRIVATE KEY", keyPair.getPrivate().getEncoded());
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("security.jwt.public-key", () -> PUBLIC_KEY.toUri().toString());
        registry.add("security.jwt.private-key", () -> PRIVATE_KEY.toUri().toString());
        registry.add("security.jwt.issuer", () -> ISSUER);
        registry.add("security.jwt.expiration", () -> "PT1H");
        registry.add("spring.datasource.url", () -> "jdbc:hsqldb:mem:taskmanager-test");
        registry.add("spring.datasource.driver-class-name", () -> "org.hsqldb.jdbc.JDBCDriver");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.show-sql", () -> "false");
        registry.add("logging.level.root", () -> "WARN");
        registry.add("logging.level.org.springframework.data", () -> "WARN");
    }

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtEncoder jwtEncoder;
    @Autowired
    private SecurityProperties securityProperties;

    @BeforeEach
    void cleanDatabase() {
        taskRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void bindsJwtConfigurationProperties() {
        assertThat(securityProperties.jwt().publicKey().exists()).isTrue();
        assertThat(securityProperties.jwt().privateKey().exists()).isTrue();
        assertThat(securityProperties.jwt().issuer()).isEqualTo(ISSUER);
        assertThat(securityProperties.jwt().expiration()).isEqualTo(Duration.ofHours(1));
    }

    @Test
    void registerHashesPasswordAndRejectsDuplicateEmail() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerJson("USER@example.com")))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.email").value("user@example.com"))
            .andExpect(jsonPath("$.password").doesNotExist());

        UserEntity stored = userRepository.findByEmailIgnoreCase("user@example.com").orElseThrow();
        assertThat(stored.getPassword()).isNotEqualTo("Password123");
        assertThat(passwordEncoder.matches("Password123", stored.getPassword())).isTrue();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerJson("user@example.com")))
            .andExpect(status().isConflict());
    }

    @Test
    void loginIssuesTokenAndProtectedEndpointsRequireValidJwt() throws Exception {
        register("user@example.com");

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"user@example.com","password":"wrong-password"}
                    """))
            .andExpect(status().isUnauthorized());

        String token = login("user@example.com");
        UUID userId = userRepository.findByEmailIgnoreCase("user@example.com").orElseThrow().getId();
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("user@example.com"))
            .andExpect(jsonPath("$.password").doesNotExist());

        mockMvc.perform(put("/api/users/{id}", userId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"updated@example.com","name":"Updated User","phone":"11888888888"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("updated@example.com"));

        int signatureStart = token.lastIndexOf('.') + 1;
        char replacement = token.charAt(signatureStart) == 'a' ? 'b' : 'a';
        String tampered = token.substring(0, signatureStart) + replacement
            + token.substring(signatureStart + 1);
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + tampered))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + expiredToken()))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void tasksAreAlwaysScopedToAuthenticatedUser() throws Exception {
        register("owner@example.com");
        register("other@example.com");
        String ownerToken = login("owner@example.com");
        String otherToken = login("other@example.com");
        UUID ownerId = userRepository.findByEmailIgnoreCase("owner@example.com").orElseThrow().getId();

        mockMvc.perform(get("/api/users/{id}", ownerId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound());

        String response = mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Private task","status":"OPEN","duedate":"2030-01-01T12:00:00Z"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").isNotEmpty())
            .andReturn().getResponse().getContentAsString();

        UUID taskId = UUID.fromString(objectMapper.readTree(response).get("id").asString());
        mockMvc.perform(get("/api/tasks/{id}", taskId)
                .header("Authorization", "Bearer " + ownerToken))
            .andExpect(status().isOk());
        mockMvc.perform(get("/api/tasks/{id}", taskId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound());
        mockMvc.perform(put("/api/tasks/{id}", taskId)
                .header("Authorization", "Bearer " + otherToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"title":"Stolen task","status":"CANCELED","duedate":"2030-01-01T12:00:00Z"}
                    """))
            .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/tasks/{id}", taskId)
                .header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer " + otherToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isEmpty());
    }

    private void register(String email) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerJson(email)))
            .andExpect(status().isCreated());
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"email":"%s","password":"Password123"}
                    """.formatted(email)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.expiresAt").isNotEmpty())
            .andReturn().getResponse().getContentAsString();
        JsonNode body = objectMapper.readTree(response);
        return body.get("accessToken").asString();
    }

    private String expiredToken() {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(ISSUER)
            .subject(UUID.randomUUID().toString())
            .issuedAt(now.minusSeconds(7200))
            .expiresAt(now.minusSeconds(3600))
            .build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    private static String registerJson(String email) {
        return """
            {"email":"%s","password":"Password123","name":"Test User","phone":"11999999999"}
            """.formatted(email);
    }

    private static Path writePem(String type, byte[] encoded) throws Exception {
        String base64 = Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(encoded);
        Path file = Files.createTempFile("taskmanager-jwt-", ".pem");
        Files.writeString(file, "-----BEGIN " + type + "-----\n" + base64
            + "\n-----END " + type + "-----\n", StandardCharsets.US_ASCII);
        file.toFile().deleteOnExit();
        return file;
    }
}
