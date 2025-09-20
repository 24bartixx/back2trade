# Simple frontend Dockerfile for Next.js
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY back2trade/web2/back2trade/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY back2trade/web2/back2trade/ .

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Set environment variables
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Use dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Run development server (NODE_ENV from Kubernetes will determine mode)
CMD ["npm", "run", "dev"]
