# --- Stage 1: Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build the Vite React application
RUN npm run build

# --- Stage 2: Serve Stage ---
FROM nginx:alpine AS runner

# Copy compiled static files from builder stage to Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]