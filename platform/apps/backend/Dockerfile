# Medusa v2 backend — production image.
# Build context: platform/apps/backend
#
# Tuned for small VPS (1–2 GB RAM): uses swap-friendly Node heap limits.
# On 1 GB droplets, create 4G swap BEFORE building (see scripts/droplet-lowmem.sh).

FROM node:22-alpine AS build
WORKDIR /app

# Alpine needs more headroom for medusa admin (Vite) compile
ENV NODE_OPTIONS="--max-old-space-size=1536"
ENV npm_config_fund=false
ENV npm_config_audit=false

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .

# Build backend + admin UI. If this fails on 1GB: add 4G swap or resize to 2GB.
RUN npx medusa build

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

COPY --from=build /app/.medusa/server ./
# Seeded product images + catalog + boot helpers
COPY --from=build /app/static ./static
COPY --from=build /app/data ./data
COPY --from=build /app/start.sh /app/boot-check.js ./

RUN npm install --omit=dev --no-audit --no-fund && chmod +x ./start.sh

EXPOSE 9000
# start.sh: migrate → ensure admin → boot check → serve 0.0.0.0:9000
CMD ["sh", "./start.sh"]
