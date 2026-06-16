# Stage 1: Build the static React application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY index.html ./

RUN npm ci

# Run the model downloader before compiling code
COPY scripts ./scripts/
RUN node scripts/download-models.js

COPY src ./src/
COPY public ./public/

ENV VITE_API_URL=http://localhost:5000/api

RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
