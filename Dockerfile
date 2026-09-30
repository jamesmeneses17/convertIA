# syntax=docker/dockerfile:1

###############################################################################
# ConvertIA - Dockerfile multi-stage optimizado para produccion (Next.js 15)
# Etapas: deps -> builder -> runner
###############################################################################

############################
# 1. DEPS: dependencias
############################
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
# npm ci si existe lockfile, npm install como fallback controlado
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

############################
# 2. BUILDER: Prisma + build
############################
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL de placeholder: Prisma solo la necesita en runtime,
# pero `prisma generate` valida que el datasource exista.
ENV DATABASE_URL="postgresql://convertia:convertia@db:5432/convertia?schema=public"

# Las variables NEXT_PUBLIC_* se incrustan en el bundle del cliente durante el
# build, por eso llegan como build args y no solo como entorno de ejecucion.
ARG NEXT_PUBLIC_APP_NAME=ConvertIA
ARG NEXT_PUBLIC_CLAUDE_WEB_URL=https://claude.ai/new
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_CLAUDE_WEB_URL=$NEXT_PUBLIC_CLAUDE_WEB_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Genera el Prisma Client tipado y compila Next.js en modo standalone
RUN npx prisma generate
RUN npm run build

###############################################################################
# 3. MIGRATOR: job de un solo uso que aplica las migraciones
#    Reutiliza la capa `builder`, que si tiene el CLI de Prisma completo.
#    El runner es standalone y no puede ejecutar el CLI (node_modules podado).
###############################################################################
FROM builder AS migrator
WORKDIR /app
CMD ["node", "node_modules/prisma/build/index.js", "migrate", "deploy"]

############################
# 4. RUNNER: imagen final
############################
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Salida standalone (server.js + node_modules minimo + .prisma)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma Client generado + motor de consultas (las migraciones las aplica el
# servicio `migrate`, que corre sobre la etapa `migrator`).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

COPY --chown=nextjs:nodejs docker/entrypoint.sh /usr/local/bin/entrypoint.sh
# sed limpia posibles finales de linea CRLF si el repo se clono en Windows
RUN sed -i 's/[[:space:]]*$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
