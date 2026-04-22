# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY new_app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY new_app/ .

# Build the application
RUN NODE_OPTIONS=--max-old-space-size=4096 npm run build

# Production stage
FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

# Copy Angular build output
COPY --from=build /app/dist/new_app ./new_app/dist/new_app

# Copy server source
COPY server/ ./server/

# Run as non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server/index.js"]
