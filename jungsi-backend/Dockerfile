# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
# Add retry logic and increase network timeout for npm registry issues
RUN yarn install --frozen-lockfile --network-timeout 300000 || \
    yarn install --frozen-lockfile --network-timeout 300000 || \
    yarn install --frozen-lockfile --network-timeout 300000

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
# Add retry logic and increase network timeout for npm registry issues
RUN yarn install --frozen-lockfile --production --network-timeout 300000 || \
    yarn install --frozen-lockfile --production --network-timeout 300000 || \
    yarn install --frozen-lockfile --production --network-timeout 300000
RUN yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Set ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set default PORT for Cloud Run
ENV PORT=8080
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]
