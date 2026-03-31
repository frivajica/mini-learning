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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RateLimitService rateLimitService;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       RateLimitService rateLimitService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.rateLimitService = rateLimitService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        user = userRepository.save(user);
        logger.info("User registered successfully: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp) {
        logger.info("Login attempt for email: {}", request.getEmail());

        // Rate limiting check
        if (!rateLimitService.isAllowed(clientIp, "login")) {
            throw new BadRequestException("Too many login attempts. Please try again later.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    logger.warn("Login failed - user not found: {}", request.getEmail());
                    return new UnauthorizedException("Invalid email or password");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed - invalid password for email: {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        logger.info("User logged in successfully: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        logger.info("Token refresh attempt");

        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> {
                    logger.warn("Refresh token not found");
                    return new UnauthorizedException("Invalid refresh token");
                });

        if (token.isExpired()) {
            logger.warn("Refresh token expired");
            throw new UnauthorizedException("Refresh token has expired");
        }

        if (token.isRevoked()) {
            logger.warn("Refresh token already revoked");
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        // Revoke old token
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        // Get user and create new tokens
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> {
                    logger.error("User not found for refresh token");
                    return new UnauthorizedException("User not found");
                });

        logger.info("Token refreshed successfully for user: {}", user.getId());

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        logger.info("Logout request");

        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                    logger.info("Refresh token revoked for user: {}", token.getUserId());
                });
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken();

        // Save refresh token to database
        RefreshToken token = new RefreshToken();
        token.setToken(newRefreshToken);
        token.setUserId(user.getId());
        token.setExpiresAt(LocalDateTime.now().plusDays(jwtTokenProvider.getRefreshTokenExpirationDays()));

        refreshTokenRepository.save(token);

        return new AuthResponse(accessToken, newRefreshToken);
    }
}
