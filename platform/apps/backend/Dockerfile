# Medusa v2 backend — production image.
# Build context: platform/apps/backend
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npx medusa build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.medusa/server ./
# Seeded product images served at /static, catalog for the product seed,
# and the self-diagnosing boot script + boot check.
COPY --from=build /app/static ./static
COPY --from=build /app/data ./data
COPY --from=build /app/start.sh /app/boot-check.js ./
RUN npm install --omit=dev --no-audit --no-fund && chmod +x ./start.sh
ENV NODE_ENV=production
EXPOSE 9000
# start.sh: migrate → ensure admin (env) → boot check → serve on 0.0.0.0:9000
CMD ["sh", "./start.sh"]
