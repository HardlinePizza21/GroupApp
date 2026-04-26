FROM node:20-alpine AS base
WORKDIR /app

# ── Dependencias ──────────────────────────────────────────
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ── Prisma generate ───────────────────────────────────────
FROM deps AS prisma-gen
COPY prisma ./prisma
RUN npx prisma generate

# ── Imagen final ──────────────────────────────────────────
FROM base AS runner
COPY --from=deps       /app/node_modules ./node_modules
COPY --from=prisma-gen /app/node_modules/.prisma ./node_modules/.prisma
COPY src ./src
COPY prisma ./prisma

# Crear directorio para uploads locales (dev sin S3)
RUN mkdir -p uploads

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
