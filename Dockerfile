# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY new_app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY new_app/ .

# Build the application
RUN npm run build --prod

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist/new_app/browser /usr/share/nginx/html

# Replace default nginx config with SPA fallback + gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]