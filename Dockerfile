# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency files first for cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy prisma client generated in builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Next.js build output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./

# Prisma schema + migrations for runtime DB setup
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/prisma/migrations ./prisma/migrations

# Create uploads directory and data directory
RUN mkdir -p public/uploads/invoices prisma/data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node node_modules/.bin/next start -p 3000"]
