# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-https.conf.template /etc/nginx/nginx-https.conf.template
COPY enable-https.sh /docker-entrypoint.d/40-enable-https.sh
RUN chmod +x /docker-entrypoint.d/40-enable-https.sh

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
