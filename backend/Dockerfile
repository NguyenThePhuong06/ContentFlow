# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Install production dependencies including prisma CLI for migrations
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate
RUN chown -R node:node /app/node_modules/@prisma/engines

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
