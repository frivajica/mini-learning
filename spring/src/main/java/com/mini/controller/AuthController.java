package com.mini.controller;

import com.mini.dto.request.LoginRequest;
import com.mini.dto.request.RefreshRequest;
import com.mini.dto.request.RegisterRequest;
import com.mini.dto.response.ApiResponse;
import com.mini.dto.response.AuthResponse;
import com.mini.service.AuthService;
import com.mini.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        logger.info("Register request received for email: {}", request.getEmail());

        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        logger.info("Login request received for email: {}", request.getEmail());

        String clientIp = IpUtil.getClientIp(httpRequest);
        AuthResponse response = authService.login(request, clientIp);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        logger.info("Refresh token request received");

        AuthResponse response = authService.refresh(request.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest request) {
        logger.info("Logout request received");

        authService.logout(request.getRefreshToken());

        return ResponseEntity.noContent().build();
    }
}
