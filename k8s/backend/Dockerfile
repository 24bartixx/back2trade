# Multi-stage optimized Dockerfile for NestJS backend
FROM node:20-alpine AS dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache openssl dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY back2trade/api/app_api/package*.json ./

# Install only production dependencies in a separate stage
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Build stage
FROM node:20-alpine AS build

RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY back2trade/api/app_api/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --no-audit --no-fund

# Copy source code and configuration
COPY back2trade/api/app_api/src ./src
COPY back2trade/api/app_api/prisma ./prisma
COPY back2trade/api/app_api/tsconfig*.json ./
COPY back2trade/api/app_api/nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build && \
    npm prune --production

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Install runtime dependencies and security updates
RUN apk update && apk upgrade && \
    apk add --no-cache openssl dumb-init curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# Copy generated Prisma client from build stage
COPY --from=build --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nestjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Set environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    NODE_OPTIONS="--max-old-space-size=256"

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application - NestJS builds main.ts to dist/src/main.js
CMD ["node", "dist/src/main.js"]
