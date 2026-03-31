# Base image: Node.js 20 on Alpine Linux (minimal, ~5MB)
FROM node:20-alpine

# Create and set working directory (equivalent to mkdir -p /app && cd /app)
WORKDIR /app

# Step 1: Copy only package files (not code yet)
# This is separate from copying code to enable Docker layer caching
COPY package.json yarn.lock* ./

# Step 2: Install dependencies
# --production = only install production deps, skip devDependencies (smaller image)
# --frozen-lockfile = fail if yarn.lock doesn't match package.json exactly (prevents version mismatches)
RUN yarn install --production --frozen-lockfile

# Step 3: Copy all application code
# This comes AFTER dependencies so we can cache the dependency layer
COPY . .

# Step 4: Compile TypeScript to JavaScript
# Creates the dist/ folder with plain JavaScript
RUN yarn build

# Document that the app exposes port 3000
EXPOSE 3000

# Health check: tells orchestrator if the container is healthy
# --interval=30s   = check every 30 seconds
# --timeout=3s     = give up after 3 seconds if no response
# --start-period=5s = wait 5 seconds before first check (app needs time to start)
# --retries=3     = mark as unhealthy after 3 failed checks
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Switch to non-root user for security (good practice)
USER node

# Command to run when container starts
# This is the compiled JavaScript entry point
CMD ["node", "dist/server.js"]
