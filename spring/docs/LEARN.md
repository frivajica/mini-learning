# Learning Spring Boot

A guide for JavaScript/TypeScript developers learning Spring Boot.

## Table of Contents

1. [Why Spring Boot?](#why-spring-boot)
2. [Architecture Overview](#architecture-overview)
3. [Dependency Injection](#dependency-injection)
4. [JPA Entities](#jpa-entities)
5. [Security](#security)
6. [Validation](#validation)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Why Spring Boot?

Spring Boot provides:

- **Auto-configuration**: Sensible defaults out of the box
- **Embedded server**: No WAR files needed, runs like a regular Java app
- **Production features**: Health checks, metrics, monitoring built-in
- **Huge ecosystem**: Spring Security, Spring Data, Spring Cloud, etc.

### JS/TS Analogy

```javascript
// Express: Manual setup
const express = require("express");
const app = express();
app.use(express.json());
// ... manual configuration
```

```java
// Spring Boot: Auto-configuration
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
// Sensible defaults work out of the box!
```

---

## Architecture Overview

Spring Boot follows **layered architecture**:

```
┌────────────────┐
│  Controller   │ ← Handles HTTP requests/responses
├────────────────┤
│    Service    │ ← Business logic
├────────────────┤
│  Repository   │ ← Data access (JPA)
├────────────────┤
│    Database   │ ← PostgreSQL
└────────────────┘
```

### JS/TS Analogy

```javascript
// Express-style (flat)
app.post("/users", async (req, res) => {
  const user = await db.create(req.body);
  res.json(user);
});
```

```java
// Spring Boot (layered)
@RestController
public class UserController {
    @PostMapping
    public ResponseEntity<User> create(@RequestBody @Valid UserRequest req) {
        User user = userService.create(req);  // Service handles logic
        return ResponseEntity.ok(user);
    }
}

@Service
public class UserService {
    public User create(UserRequest req) {
        // Business logic here
        return userRepository.save(user);  // Repository handles DB
    }
}
```

---

## Dependency Injection

### Core Concept

Instead of creating dependencies manually, Spring **injects** them automatically.

### JS/TS Analogy

```javascript
// JS: Manual dependency injection
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository; // Manual injection
  }
}

const repo = new UserRepository();
const service = new UserService(repo);
```

```java
// Java: Spring auto-wires via constructor
@Service
public class UserService {
    private final UserRepository userRepository;

    // Spring injects UserRepository automatically
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### Annotation Reference

| Annotation        | Purpose          | Example         |
| ----------------- | ---------------- | --------------- |
| `@Component`      | Generic bean     | Utility classes |
| `@Service`        | Service layer    | Business logic  |
| `@Repository`     | Repository layer | Data access     |
| `@Controller`     | Web controller   | HTTP handlers   |
| `@RestController` | REST controller  | JSON APIs       |
| `@Configuration`  | Configuration    | Setup beans     |
| `@Bean`           | Define bean      | Factory methods |

### Constructor Injection (Recommended)

```java
@Service
public class UserService {
    private final UserRepository userRepository;  // final = immutable

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

---

## JPA Entities

JPA (Java Persistence API) maps Java objects to database tables.

### Basic Entity

```java
@Entity                         // Mark as JPA entity
@Table(name = "users")          // Database table name
public class User {

    @Id                         // Primary key
    @GeneratedValue              // Auto-generate ID
    private Long id;

    @Column(unique = true)      // Unique constraint
    private String email;

    @Column(nullable = false)   // NOT NULL
    private String password;

    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### JS/TS Analogy

```typescript
// TypeScript interface (no persistence logic)
interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}
```

### JPA Annotations Reference

| Annotation         | Purpose                   |
| ------------------ | ------------------------- |
| `@Entity`          | Marks class as JPA entity |
| `@Table(name="x")` | Specifies table name      |
| `@Id`              | Primary key               |
| `@GeneratedValue`  | Auto-generate ID          |
| `@Column`          | Column configuration      |
| `@OneToMany`       | One-to-many relationship  |
| `@ManyToOne`       | Many-to-one relationship  |
| `@PrePersist`      | Run before first save     |
| `@PreUpdate`       | Run before update         |

### Repository Pattern

```java
@Repository  // Optional on interfaces
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data creates implementations automatically!

    // Query methods
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByNameContaining(String name);
}
```

### JS/TS Analogy

```typescript
// Express: Manual SQL
app.get("/users/:email", async (req, res) => {
  const user = await db.query("SELECT * FROM users WHERE email = $1", [
    req.params.email,
  ]);
  res.json(user);
});
```

---

## Security

### Filter Chain Flow

Spring Security uses a filter chain:

```
Request → CORS Filter → CSRF Filter → JWT Filter → Authorization
```

### Creating JWT

```java
@Service
public class JwtTokenProvider {

    private final SecretKey key;
    private final long EXPIRATION = 15 * 60 * 1000; // 15 minutes

    public String generateToken(Long userId, String email) {
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
            .signWith(key)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
```

### Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()  // Public
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")  // ADMIN only
                .anyRequest().authenticated()  // All others need auth
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

---

## Validation

### Using Bean Validation

```java
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$",
             message = "Password requirements not met")
    private String password;
}
```

### JS/TS Analogy (Zod)

```typescript
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/),
});
```

### Using Validation in Controller

```java
@RestController
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        // @Valid triggers validation
        // If invalid, GlobalExceptionHandler catches MethodArgumentNotValidException
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
```

### Validation Annotations Reference

| Annotation         | Purpose                       |
| ------------------ | ----------------------------- |
| `@NotNull`         | Cannot be null                |
| `@NotBlank`        | Cannot be blank (strings)     |
| `@NotEmpty`        | Cannot be empty (collections) |
| `@Email`           | Must be valid email           |
| `@Size(min, max)`  | Length constraints            |
| `@Min`, `@Max`     | Numeric constraints           |
| `@Pattern(regexp)` | Regex pattern                 |
| `@Valid`           | Trigger nested validation     |

---

## Error Handling

### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.badRequest()
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .toList();

        ApiResponse<Void> response = ApiResponse.error("Validation failed");
        response.setErrors(errors);
        return ResponseEntity.badRequest().body(response);
    }
}
```

### API Response Pattern

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private List<String> errors;

    public static <T> ApiResponse<T> success(T data) { ... }
    public static <T> ApiResponse<T> error(String message) { ... }
}
```

---

## Testing

### Unit Test with Mockito

```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_validRequest_success() {
        // Given
        RegisterRequest request = new RegisterRequest("John", "john@test.com", "Pass123");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        AuthResponse response = authService.register(request);

        // Then
        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
    }
}
```

### JS/TS Analogy (Jest)

```javascript
describe('AuthService', () => {
    it('register validRequest success', () => {
        // Given
        const request = { name: 'John', email: 'john@test.com', password: 'Pass123' };
        jest.spyOn(userRepository, 'existsByEmail').mockResolvedValue(false);
        jest.spyOn(userRepository, 'save').mockResolvedValue(user);

        // When
        const response = await authService.register(request);

        // Then
        expect(response).not.toBeNull();
        expect(response.accessToken).toBe('accessToken');
    });
});
```

### Test Annotations

| Annotation                            | Purpose                 |
| ------------------------------------- | ----------------------- |
| `@Test`                               | Marks test method       |
| `@BeforeEach`                         | Run before each test    |
| `@Mock`                               | Create mock dependency  |
| `@InjectMocks`                        | Inject mocks into class |
| `@ExtendWith(MockitoExtension.class)` | Enable Mockito          |

---

## Next Steps

1. Run the project locally with Docker
2. Read the source code
3. Compare with other frameworks in COMPARISON.md
4. Try modifying endpoints
5. Add new features
6. Check EXTRA_LEARN.md for advanced topics
