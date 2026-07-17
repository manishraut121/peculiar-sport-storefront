# Next.js storefront — production image.
# Build context: platform/apps/storefront
# NOTE: `next build` pre-renders pages, so the BACKEND MUST BE RUNNING and
# reachable at MEDUSA_BACKEND_URL during the build:
#   docker compose up -d backend && docker compose up -d storefront
FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG MEDUSA_BACKEND_URL=http://backend:9000
ARG NEXT_PUBLIC_OC_ENV=prod
ARG NEXT_PUBLIC_OC_FEATURE_FLAGS=
ARG NEXT_PUBLIC_BASE_URL=https://onecurve.in
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL \
    MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_OC_ENV=$NEXT_PUBLIC_OC_ENV \
    NEXT_PUBLIC_OC_FEATURE_FLAGS=$NEXT_PUBLIC_OC_FEATURE_FLAGS \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DEFAULT_REGION=in
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app ./
ENV NODE_ENV=production
EXPOSE 8000
CMD ["npm", "run", "start"]
