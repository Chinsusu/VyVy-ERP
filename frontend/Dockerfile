# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

# Copy the build output to Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port (Internal to container)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
