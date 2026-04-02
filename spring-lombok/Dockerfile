FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw package -DskipTests -Pprod

FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

ENV JAVA_OPTS="-Xmx256m -Xms128m"

RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -G appgroup -D -S appuser

RUN mkdir -p /app && chown -R appuser:appgroup /app

COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
