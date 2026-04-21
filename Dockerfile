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

WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev

# Copy Angular build output
COPY --from=build /app/dist/new_app ./new_app/dist/new_app

# Copy server source
COPY server/ ./server/

EXPOSE 3000

CMD ["node", "server/index.js"]