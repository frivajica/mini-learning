package com.mini.service;

import com.mini.dto.request.LoginRequest;
import com.mini.dto.request.RegisterRequest;
import com.mini.dto.response.AuthResponse;
import com.mini.exception.BadRequestException;
import com.mini.exception.UnauthorizedException;
import com.mini.model.RefreshToken;
import com.mini.model.User;
import com.mini.repository.RefreshTokenRepository;
import com.mini.repository.UserRepository;
import com.mini.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RateLimitService rateLimitService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp) {
        log.info("Login attempt for email: {}", request.getEmail());

        if (!rateLimitService.isAllowed(clientIp, "login")) {
            throw new BadRequestException("Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", request.getEmail());
                    return new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed - invalid password for email: {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        log.info("Token refresh attempt");

        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> {
                    log.warn("Refresh token not found");
                    return new UnauthorizedException("Invalid refresh token");
                });

        if (token.isExpired()) {
            log.warn("Refresh token expired");
            throw new UnauthorizedException("Refresh token has expired");
        }

        if (token.getRevoked()) {
            log.warn("Refresh token already revoked");
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> {
                    log.error("User not found for refresh token");
                    return new UnauthorizedException("User not found");
                });

        log.info("Token refreshed successfully for user: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        log.info("Logout request");

        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    log.info("Refresh token revoked for user: {}", token.getUserId());
                });
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken();

        RefreshToken token = new RefreshToken();
        token.setToken(newRefreshToken);
        token.setUserId(user.getId());
        token.setExpiresAt(LocalDateTime.now().plusDays(jwtTokenProvider.getRefreshTokenExpirationDays()));

        refreshTokenRepository.save(token);

        return new AuthResponse(accessToken, newRefreshToken);
    }
}
