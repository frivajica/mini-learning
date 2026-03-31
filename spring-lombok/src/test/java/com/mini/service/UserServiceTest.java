package com.mini.service;

import com.mini.dto.response.UserResponse;
import com.mini.exception.ResourceNotFoundException;
import com.mini.model.User;
import com.mini.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = new User("John Doe", "john@test.com", "password");
        user1.setId(1L);
        user1.setCreatedAt(LocalDateTime.now());

        user2 = new User("Jane Doe", "jane@test.com", "password");
        user2.setId(2L);
        user2.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Get all users should return list of users")
    void getAllUsers_returnsUserList() {
        // Arrange
        when(userRepository.findAll()).thenReturn(Arrays.asList(user1, user2));

        // Act
        List<UserResponse> users = userService.getAllUsers();

        // Assert
        assertNotNull(users);
        assertEquals(2, users.size());
        assertEquals("John Doe", users.get(0).getName());
        assertEquals("Jane Doe", users.get(1).getName());
    }

    @Test
    @DisplayName("Get user by id should return user when exists")
    void getUserById_exists_returnsUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));

        // Act
        UserResponse user = userService.getUserById(1L);

        // Assert
        assertNotNull(user);
        assertEquals(1L, user.getId());
        assertEquals("John Doe", user.getName());
        assertEquals("john@test.com", user.getEmail());
    }

    @Test
    @DisplayName("Get user by id should throw exception when not found")
    void getUserById_notExists_throwsException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    @DisplayName("Get all users should return empty list when no users")
    void getAllUsers_empty_returnsEmptyList() {
        // Arrange
        when(userRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<UserResponse> users = userService.getAllUsers();

        // Assert
        assertNotNull(users);
        assertTrue(users.isEmpty());
    }
}
