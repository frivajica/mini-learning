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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        log.info("Register request received for email: {}", request.getEmail());

        AuthResponse response = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        log.info("Login request received for email: {}", request.getEmail());

        String clientIp = IpUtil.getClientIp(httpRequest);
        AuthResponse response = authService.login(request, clientIp);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest request) {
        log.info("Refresh token request received");

        AuthResponse response = authService.refresh(request.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest request) {
        log.info("Logout request received");

        authService.logout(request.getRefreshToken());

        return ResponseEntity.noContent().build();
    }
}
