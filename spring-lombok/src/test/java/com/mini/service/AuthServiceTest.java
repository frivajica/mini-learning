package com.mini.service;

import com.mini.dto.request.LoginRequest;
import com.mini.dto.request.RegisterRequest;
import com.mini.dto.response.AuthResponse;
import com.mini.exception.BadRequestException;
import com.mini.exception.UnauthorizedException;
import com.mini.model.User;
import com.mini.repository.RefreshTokenRepository;
import com.mini.repository.UserRepository;
import com.mini.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RateLimitService rateLimitService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("John Doe", "john@test.com", "Password123");

        loginRequest = new LoginRequest("john@test.com", "Password123");

        user = new User("John Doe", "john@test.com", "encodedPassword");
        user.setId(1L);
    }

    @Test
    @DisplayName("Register should create new user successfully")
    void register_validRequest_success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(jwtTokenProvider.generateAccessToken(any(), anyString())).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken()).thenReturn("refreshToken");
        when(jwtTokenProvider.getRefreshTokenExpirationDays()).thenReturn(7L);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Register should throw exception when email already exists")
    void register_emailExists_throwsException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Login should return tokens on valid credentials")
    void login_validCredentials_success() {
        // Arrange
        when(rateLimitService.isAllowed(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(), anyString())).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken()).thenReturn("refreshToken");
        when(jwtTokenProvider.getRefreshTokenExpirationDays()).thenReturn(7L);

        // Act
        AuthResponse response = authService.login(loginRequest, "127.0.0.1");

        // Assert
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
    }

    @Test
    @DisplayName("Login should throw exception for invalid email")
    void login_invalidEmail_throwsException() {
        // Arrange
        when(rateLimitService.isAllowed(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }

    @Test
    @DisplayName("Login should throw exception for invalid password")
    void login_invalidPassword_throwsException() {
        // Arrange
        when(rateLimitService.isAllowed(anyString(), anyString())).thenReturn(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }

    @Test
    @DisplayName("Login should throw exception when rate limited")
    void login_rateLimited_throwsException() {
        // Arrange
        when(rateLimitService.isAllowed(anyString(), anyString())).thenReturn(false);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.login(loginRequest, "127.0.0.1"));
    }
}
