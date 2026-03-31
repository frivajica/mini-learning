# Extra Learning Topics

> Comprehensive guides for becoming a production-ready Java developer.

## Table of Contents

1. [Transactions](#1-transactions)
2. [Advanced Mockito](#2-advanced-mockito)
3. [Microservices Patterns](#3-microservices-patterns)
4. [Design Patterns](#4-design-patterns)
5. [Async Programming](#5-async-programming)
6. [DevOps Essentials](#6-devops-essentials)

---

# 1. Transactions

## What is a Transaction?

A transaction is a sequence of operations that execute as a single unit - either **ALL succeed** or **ALL fail**.

### ACID Properties

| Property        | Description                             |
| --------------- | --------------------------------------- |
| **Atomicity**   | All operations complete or none do      |
| **Consistency** | Data remains valid state                |
| **Isolation**   | Concurrent transactions don't interfere |
| **Durability**  | Committed data is persisted             |

## Basic @Transactional

```java
@Service
public class TransferService {

    @Transactional
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        Account from = accountRepository.findById(fromId);
        Account to = accountRepository.findById(toId);

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);
        // If any exception occurs, ALL changes rollback
    }
}
```

### JS/TS Analogy (Pseudo-code)

```typescript
async function transfer(fromId: number, toId: number, amount: number) {
  await db.beginTransaction(); // Start transaction
  try {
    const from = await db.findById(fromId);
    const to = await db.findById(toId);

    from.balance -= amount;
    to.balance += amount;

    await db.save(from);
    await db.save(to);

    await db.commit(); // All changes persist
  } catch (error) {
    await db.rollback(); // All changes undo
    throw error;
  }
}
```

## Propagation Levels

Controls how transactions interact with parent transactions.

```java
@Service
public class ParentService {

    @Transactional
    public void parentMethod() {
        childService.childMethod();  // What happens here?
    }
}

@Service
public class ChildService {

    @Transactional(propagation = Propagation.REQUIRED)  // Default
    public void childMethod() {
        // Uses parent's transaction
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void newTransactionMethod() {
        // Creates NEW transaction, suspending parent
    }

    @Transactional(propagation = Propagation.NESTED)
    public void nestedMethod() {
        // Creates SAVEPOINT within parent's transaction
    }
}
```

| Propagation     | Behavior                   | Use Case                       |
| --------------- | -------------------------- | ------------------------------ |
| `REQUIRED`      | Use existing or create new | Default, most common           |
| `REQUIRES_NEW`  | Always create new          | Independent operations         |
| `NESTED`        | Savepoint within existing  | Complex business logic         |
| `SUPPORTS`      | Participate if exists      | Read-only operations           |
| `MANDATORY`     | Must have parent           | Enforce transaction exists     |
| `NEVER`         | No transaction             | Should never be in transaction |
| `NOT_SUPPORTED` | Suspend parent             | Slow operations                |

## Isolation Levels

Controls how concurrent transactions see each other's data.

```java
@Service
public class UserService {

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void processUser(Long id) {
        User user = userRepository.findById(id);
        // Within this transaction, user data won't change
        user.setName("Updated");
        userRepository.save(user);
    }
}
```

| Level              | Dirty Read | Non-Repeatable Read | Phantom Read |
| ------------------ | ---------- | ------------------- | ------------ |
| `READ_UNCOMMITTED` | ❌         | ❌                  | ❌           |
| `READ_COMMITTED`   | ✅         | ❌                  | ❌           |
| `REPEATABLE_READ`  | ✅         | ✅                  | ❌           |
| `SERIALIZABLE`     | ✅         | ✅                  | ✅           |

### When to Use Each

- **`READ_COMMITTED`** - Most applications (PostgreSQL default)
- **`REPEATABLE_READ`** - Financial calculations
- **`SERIALIZABLE`** - Critical data consistency

## Read-Only Transactions

```java
@Service
public class ReportService {

    @Transactional(readOnly = true)
    public List<User> generateReport() {
        // Hints to JPA/Hibernate for optimization
        // Database may use read-only replica
        return userRepository.findAll();
    }
}
```

## Rollback Rules

By default, `@Transactional` **only rolls back on unchecked exceptions** (RuntimeException, Error).

```java
@Transactional
public void processOrder(Order order) {
    // Rolls back on RuntimeException
    if (order.isInvalid()) {
        throw new RuntimeException("Invalid order");  // ✅ Rolls back
    }

    // Does NOT rollback on checked exception
    try {
        externalService.call();
    } catch (IOException e) {
        throw new RuntimeException(e);  // Need to wrap checked exceptions
    }
}

// Customize rollback behavior
@Transactional(rollbackFor = IOException.class)
public void processOrder2(Order order) throws IOException {
    // Now rolls back on IOException too
}
```

## Checklist

```
✅ Use @Transactional on service methods
✅ Keep transactions short (avoid slow calls inside)
✅ Don't call @Transactional methods on same class (proxy issue)
✅ Understand propagation for nested transactions
✅ Choose correct isolation level
✅ Mark read-only queries with readOnly = true
```

---

# 2. Advanced Mockito

## Mock vs Spy

```java
// Mock: Complete fake - does nothing real
List<String> mockList = mock(List.class);
mockList.add("one");  // Does absolutely nothing
when(mockList.get(0)).thenReturn("one");

// Spy: Partial fake - wraps real object
List<String> spyList = spy(new ArrayList<>());
spyList.add("one");  // Actually adds to the list!
when(spyList.get(0)).thenReturn("two");  // Override only get(0)
```

## Argument Matchers

```java
@Test
void testArgumentMatchers() {
    // Match any value
    when(userRepository.findById(anyLong())).thenReturn(user);

    // Match specific values
    when(userRepository.findByEmail("john@test.com")).thenReturn(user);

    // Match with condition
    when(userRepository.findByEmail(argThat(email -> email.contains("@"))))
        .thenReturn(user);

    // Match any map with specific key
    when(roleRepository.findByPermissions(anyMap()))
        .thenReturn(roles);
}

@Test
void verifyInteractions() {
    service.createUser("John", "john@test.com");

    // Verify exact number of calls
    verify(userRepository, times(1)).save(any(User.class));

    // Verify at least/minimum
    verify(userRepository, atLeast(1)).save(any(User.class));
    verify(userRepository, atMost(3)).findById(anyLong());

    // Verify never called
    verify(userRepository, never()).delete(anyLong());

    // Verify order
    InOrder inOrder = inOrder(userRepository, emailService);
    inOrder.verify(userRepository).save(any(User.class));
    inOrder.verify(emailService).sendWelcome(anyString());
}
```

## ArgumentCaptor

```java
@Test
void testCapturingArguments() {
    // Create captor
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

    // Capture the argument
    service.createUser("John", "john@test.com");

    // Get captured value
    verify(userRepository).save(userCaptor.capture());

    // Assert on captured value
    User captured = userCaptor.getValue();
    assertEquals("John", captured.getName());
    assertEquals("john@test.com", captured.getEmail());
}

// Capture multiple invocations
@Test
void testMultipleCaptures() {
    ArgumentCaptor<String> nameCaptor = ArgumentCaptor.forClass(String.class);

    service.updateUsers(List.of("John", "Jane", "Bob"));

    verify(userRepository, times(3)).updateName(nameCaptor.capture());

    List<String> allNames = nameCaptor.getAllValues();
    assertEquals(List.of("John", "Jane", "Bob"), allNames);
}
```

## doReturn/when vs when/thenReturn

```java
// Standard: throws exception if not stubbed
when(userRepository.findById(1L)).thenReturn(user);

// Use doReturn when: stubbing void methods or spies
doNothing().when(logger).log(anyString());
doReturn(user).when(userRepository).findById(1L);

// Common issue with spies
List<String> spyList = spy(new ArrayList<>());
spyList.add("one");  // Real call

// This works with spy
doReturn("mocked").when(spyList).get(0);

// This would NOT work because add() was already called
when(spyList.get(0)).thenReturn("mocked");  //❌
```

## @Mock Annotation

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    // Mockito creates mocks and injects into @InjectMocks automatically
}
```

## Answer Interface (Dynamic Behavior)

```java
@Test
void testWithAnswer() {
    when(userRepository.findById(anyLong()))
        .thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            if (id < 0) {
                throw new IllegalArgumentException("Invalid ID");
            }
            return createUser(id);
        });

    // Works
    User user = service.getUser(1L);

    // Throws
    assertThrows(IllegalArgumentException.class, () -> service.getUser(-1L));
}
```

## Checklist

```
✅ Use @Mock for dependencies
✅ Use @InjectMocks for system under test
✅ Prefer thenReturn/thenAnswer over doReturn
✅ Use ArgumentCaptor to capture values for assertions
✅ Use @ExtendWith(MockitoExtension.class)
✅ Verify, don't just test return values
```

---

# 3. Microservices Patterns

## Service Discovery

Services find each other dynamically.

```
┌─────────────────────────────────────┐
│         Service Registry            │
│         (Eureka, Consul)            │
├─────────────────────────────────────┤
│  user-service: 10.0.0.1:8080       │
│  order-service: 10.0.0.2:8080     │
│  payment-service: 10.0.0.3:8080    │
└─────────────────────────────────────┘
```

### Spring Cloud Netflix Eureka

```java
// Service Provider (user-service)
@SpringBootApplication
@EnableEurekaClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// application.yml
spring:
  application:
    name: user-service
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
```

## API Gateway Pattern

Single entry point for all clients.

```java
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("/api/users/**", r -> r
                .uri("lb://user-service"))  // lb = load balanced
            .route("/api/orders/**", r -> r
                .uri("lb://order-service"))
            .route("/api/payments/**", r -> r
                .uri("lb://payment-service"))
            .build();
    }
}
```

## Circuit Breaker

Prevents cascade failures.

```java
// Add resilience4j dependency
@Service
public class UserService {

    @CircuitBreaker(
        name = "paymentService",
        fallbackMethod = "fallback"
    )
    public PaymentResult processPayment(Long userId, BigDecimal amount) {
        return paymentClient.charge(userId, amount);
    }

    // Fallback when circuit is open
    public PaymentResult fallback(Long userId, BigDecimal amount, Exception e) {
        log.warn("Payment service unavailable, returning default", e);
        return PaymentResult.declined("Service temporarily unavailable");
    }
}

// application.yml
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

## Retry Pattern

```java
@Service
public class ExternalApiService {

    @Retry(
        name = "default",
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public ExternalData fetchData(String query) {
        return externalClient.get(query);
    }
}
```

## Message Queue Pattern

Async communication between services.

```java
// Producer (order-service)
@Service
public class OrderService {

    private final RabbitTemplate rabbitTemplate;

    public void createOrder(Order order) {
        orderRepository.save(order);
        // Publish event asynchronously
        rabbitTemplate.convertAndSend(
            "order.exchange",
            "order.created",
            new OrderCreatedEvent(order.getId())
        );
    }
}

// Consumer (notification-service)
@Component
public class OrderEventListener {

    @RabbitListener(queues = "order.created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        notificationService.sendOrderConfirmation(event.getOrderId());
    }
}
```

## Checklist

```
✅ Single responsibility per service
✅ Use API Gateway for unified entry point
✅ Implement circuit breakers for fault tolerance
✅ Use retry patterns for transient failures
✅ Consider message queues for async communication
✅ Centralize logging (ELK stack)
✅ Health checks for all services
```

---

# 4. Design Patterns

## Singleton Pattern

Ensure only one instance exists.

```java
public class DatabaseConnection {
    // volatile: visible across threads immediately
    // synchronized: thread-safe creation
    private static volatile DatabaseConnection instance;

    private DatabaseConnection() {
        // Private constructor prevents direct instantiation
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {  // First check (no locking)
            synchronized (DatabaseConnection.class) {  // Lock for creation
                if (instance == null) {  // Second check (inside lock)
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}
```

### Spring Singleton

In Spring, all beans are singletons by default!

```java
@Service  // Single instance for entire application
public class UserService {
    // This instance is shared across all requests
}
```

## Factory Method Pattern

Abstract object creation.

```java
public interface PaymentFactory {
    Payment createPayment();
}

public class CreditCardFactory implements PaymentFactory {
    public Payment createPayment() {
        return new CreditCardPayment();
    }
}

public class PayPalFactory implements PaymentFactory {
    public Payment createPayment() {
        return new PayPalPayment();
    }
}

// Usage
public class PaymentService {
    public void process(PaymentFactory factory, double amount) {
        Payment payment = factory.createPayment();
        payment.charge(amount);
    }
}

// Create credit card payment
paymentService.process(new CreditCardFactory(), 100.00);

// Create PayPal payment
paymentService.process(new PayPalFactory(), 100.00);
```

## Strategy Pattern

Swap algorithms at runtime.

```java
public interface SortStrategy<T> {
    List<T> sort(List<T> list);
}

public class QuickSortStrategy<T> implements SortStrategy<T> {
    public List<T> sort(List<T> list) {
        // Quick sort implementation
        return quickSort(list);
    }
}

public class MergeSortStrategy<T> implements SortStrategy<T> {
    public List<T> sort(List<T> list) {
        // Merge sort implementation
        return mergeSort(list);
    }
}

public class Sorter<T> {
    private SortStrategy<T> strategy;

    public void setStrategy(SortStrategy<T> strategy) {
        this.strategy = strategy;
    }

    public List<T> sort(List<T> data) {
        return strategy.sort(data);
    }
}

// Usage
Sorter<Integer> sorter = new Sorter<>();
sorter.setStrategy(new QuickSortStrategy<>());
List<Integer> result = sorter.sort(data);
```

## Observer Pattern

Event notification system.

```java
public interface Observer {
    void update(String event);
}

public class EventManager {
    private final Map<String, List<Observer>> listeners = new HashMap<>();

    public void subscribe(String event, Observer observer) {
        listeners.computeIfAbsent(event, k -> new ArrayList<>()).add(observer);
    }

    public void unsubscribe(String event, Observer observer) {
        List<Observer> observers = listeners.get(event);
        if (observers != null) {
            observers.remove(observer);
        }
    }

    public void notify(String event) {
        List<Observer> observers = listeners.get(event);
        if (observers != null) {
            observers.forEach(o -> o.update(event));
        }
    }
}

// Usage
public class UserService {
    private final EventManager events;

    public UserService() {
        events = new EventManager();
        events.subscribe("user.created", new EmailNotificationObserver());
        events.subscribe("user.created", new AuditLogObserver());
    }

    public void createUser(User user) {
        userRepository.save(user);
        events.notify("user.created");
    }
}
```

## Builder Pattern

Construct complex objects step by step.

```java
public class User {
    private final String name;      // Required
    private final String email;    // Required
    private final int age;         // Optional
    private final String address;   // Optional
    private final List<String> roles;  // Optional

    private User(Builder builder) {
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
        this.address = builder.address;
        this.roles = builder.roles;
    }

    public static class Builder {
        // Required
        private final String name;
        private final String email;

        // Optional (with defaults)
        private int age = 0;
        private String address = "";
        private List<String> roles = new ArrayList<>();

        public Builder(String name, String email) {
            this.name = name;
            this.email = email;
        }

        public Builder age(int age) {
            this.age = age;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder roles(List<String> roles) {
            this.roles = roles;
            return this;
        }

        public User build() {
            return new User(this);
        }
    }
}

// Usage
User user = new User.Builder("John", "john@test.com")
    .age(30)
    .address("123 Main St")
    .roles(List.of("ADMIN", "USER"))
    .build();
```

## Adapter Pattern

Wrap incompatible interface into compatible one.

```java
// Existing interface
public interface PaymentGateway {
    void pay(double amount);
    void refund(double amount);
}

// Third-party library (incompatible)
public class LegacyPaymentLib {
    public void processPayment(double amountInCents) {
        // Legacy implementation
    }
}

// Adapter
public class PaymentGatewayAdapter implements PaymentGateway {
    private final LegacyPaymentLib legacyLib;

    public PaymentGatewayAdapter(LegacyPaymentLib legacyLib) {
        this.legacyLib = legacyLib;
    }

    @Override
    public void pay(double amount) {
        // Convert dollars to cents
        legacyLib.processPayment(amount * 100);
    }

    @Override
    public void refund(double amount) {
        // Convert dollars to cents and refund
        legacyLib.processRefund(amount * 100);
    }
}
```

## Checklist

```
✅ Singleton: Thread-safe double-check locking
✅ Factory: Abstract object creation
✅ Strategy: Swap algorithms at runtime
✅ Observer: Event notification system
✅ Builder: Complex object construction
✅ Adapter: Wrap incompatible interfaces
```

---

# 5. Async Programming

## CompletableFuture

Handle async operations without callbacks.

```java
@Service
public class AsyncService {

    @Async  // Runs in separate thread pool
    public CompletableFuture<User> fetchUserAsync(Long id) {
        User user = userRepository.findById(id);
        return CompletableFuture.completedFuture(user);
    }

    // Chain operations
    public CompletableFuture<UserEnriched> enrichUserAsync(Long id) {
        return CompletableFuture
            .supplyAsync(() -> userRepository.findById(id))  // Fetch user
            .thenApply(user -> enrichWithDetails(user))       // Enrich
            .thenCompose(user -> saveToCacheAsync(user));     // Chain another async
    }

    // Parallel execution
    public UserDashboard getDashboard(Long userId) {
        CompletableFuture<User> userFuture = CompletableFuture
            .supplyAsync(() -> userRepository.findById(userId));
        CompletableFuture<List<Order>> ordersFuture = CompletableFuture
            .supplyAsync(() -> orderRepository.findByUserId(userId));
        CompletableFuture<List<Notification>> notificationsFuture = CompletableFuture
            .supplyAsync(() -> notificationRepository.findByUserId(userId));

        // Wait for ALL to complete
        CompletableFuture.allOf(userFuture, ordersFuture, notificationsFuture).join();

        return new UserDashboard(
            userFuture.get(),
            ordersFuture.get(),
            notificationsFuture.get()
        );
    }
}
```

### Enable Async in Spring

```java
@SpringBootApplication
@EnableAsync
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@Configuration
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

## Reactive Streams (Project Reactor)

Non-blocking, backpressure-enabled streams.

```java
@Service
public class ReactiveUserService {

    public Mono<User> getUser(Long id) {
        return userRepository.findById(id)
            .switchIfEmpty(Mono.error(new UserNotFoundException(id)));
    }

    public Flux<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Flux<User> searchByName(String name) {
        return userRepository.findAll()
            .filter(user -> user.getName().contains(name));
    }

    public Mono<User> createUser(Mono<UserRequest> requestMono) {
        return requestMono
            .flatMap(req -> {
                User user = new User(req.getName(), req.getEmail());
                return userRepository.save(user);
            });
    }
}
```

## WebFlux Controller

```java
@RestController
@RequestMapping("/api/v2/users")
public class ReactiveUserController {

    @GetMapping("/{id}")
    public Mono<ResponseEntity<UserResponse>> getUser(@PathVariable Long id) {
        return userService.getUser(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Flux<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public Mono<ResponseEntity<UserResponse>> createUser(
            @RequestBody Mono<UserRequest> requestMono) {
        return userService.createUser(requestMono)
            .map(user -> ResponseEntity.status(HttpStatus.CREATED).body(user));
    }
}
```

## Checklist

```
✅ Use CompletableFuture for simple async tasks
✅ Enable @Async with thread pool configuration
✅ Use .thenApply() for transformations
✅ Use .thenCompose() for chaining async operations
✅ Use CompletableFuture.allOf() for parallel execution
✅ Consider WebFlux for streaming/high-throughput scenarios
```

---

# 6. DevOps Essentials

## Docker Multi-Stage Build

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the artifact
COPY --from=build /app/target/*.jar app.jar

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xms256m", "-Xmx512m", "app.jar"]
```

## Docker Compose

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=jdbc:postgresql://postgres:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-app
  labels:
    app: spring-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: spring-app
    spec:
      containers:
        - name: spring-app
          image: myregistry/spring-app:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 15
---
apiVersion: v1
kind: Service
metadata:
  name: spring-app-service
spec:
  selector:
    app: spring-app
  ports:
    - port: 80
      targetPort: 8080
  type: LoadBalancer
```

## GitHub Actions CI/CD

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  JAVA_VERSION: "21"
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java ${{ env.JAVA_VERSION }}
        uses: actions/setup-java@v4
        with:
          java-version: ${{ env.JAVA_VERSION }}
          distribution: "temurin"
          cache: "maven"

      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}

      - name: Build with Maven
        run: mvn clean package -DskipTests

      - name: Run tests
        run: mvn test

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: jar
          path: target/*.jar

  docker:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: jar
          path: target

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-to: type=inline

  deploy:
    needs: docker
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          echo "Deploying to production..."
          # Add your deployment commands here
          # e.g., kubectl apply -f k8s/
```

## Checklist

```
✅ Use multi-stage Docker builds for smaller images
✅ Non-root user in containers
✅ Health checks (readiness + liveness)
✅ Resource limits (CPU + memory)
✅ CI/CD with GitHub Actions or similar
✅ Cache Maven/Docker layers
✅ Secrets management (Kubernetes secrets, Vault)
```

---

# Quick Reference Cheat Sheet

## Transaction Checklist

```
✅ @Transactional on service methods
✅ Keep transactions short
✅ Don't call @Transactional methods on same class (proxy!)
✅ Understand propagation levels
✅ Choose correct isolation level
```

## Mockito Checklist

```
✅ @Mock for dependencies
✅ @InjectMocks for system under test
✅ Use ArgumentCaptor to capture values
✅ Verify, don't just test return values
```

## Microservices Checklist

```
✅ Single responsibility per service
✅ API Gateway for unified entry
✅ Circuit breakers for fault tolerance
✅ Health checks for all services
```

## Design Patterns Checklist

```
✅ Singleton: Thread-safe double-check
✅ Factory: Abstract object creation
✅ Strategy: Swap algorithms at runtime
✅ Observer: Event notification
✅ Builder: Complex object construction
```

## Docker Checklist

```
✅ Multi-stage builds
✅ Non-root user
✅ Health checks
✅ Resource limits
✅ Layer caching in CI/CD
```
