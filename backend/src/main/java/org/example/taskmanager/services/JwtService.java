package org.example.taskmanager.services;

import java.time.Instant;

import org.example.taskmanager.configurations.SecurityProperties;
import org.example.taskmanager.models.TokenResponseDTO;
import org.example.taskmanager.models.UserEntity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final JwtEncoder jwtEncoder;
    private final SecurityProperties securityProperties;

    public JwtService(JwtEncoder jwtEncoder, SecurityProperties securityProperties) {
        this.jwtEncoder = jwtEncoder;
        this.securityProperties = securityProperties;
    }

    public TokenResponseDTO issue(UserEntity user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(securityProperties.jwt().expiration());
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(securityProperties.jwt().issuer())
            .subject(user.getId().toString())
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .claim("email", user.getEmail())
            .build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenResponseDTO(token, "Bearer", expiresAt);
    }
}
