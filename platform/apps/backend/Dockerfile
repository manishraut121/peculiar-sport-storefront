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
RUN npm install --omit=dev --no-audit --no-fund
ENV NODE_ENV=production
EXPOSE 9000
# Migrations (incl. one-time data seed) run before start; both are idempotent.
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
