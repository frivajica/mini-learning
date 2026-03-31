# Base image: Node.js 20 on Alpine Linux
FROM node:20-alpine

# Install yarn
RUN npm install -g yarn

# Create and set working directory
WORKDIR /app

# Step 1: Copy package files first (for Docker caching)
COPY package.json yarn.lock* ./

# Step 2: Install dependencies
RUN yarn install --production

# Step 3: Copy all application code
COPY . .

# Step 4: Compile TypeScript to JavaScript
RUN yarn build

# Document that the app exposes port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Switch to non-root user for security
USER node

# Command to run when container starts
CMD ["yarn", "run", "start"]
