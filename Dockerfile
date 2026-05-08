# syntax=docker/dockerfile:1.4
# Dockerfile (prod)
FROM oven/bun:1-alpine AS build
ARG APP_ENV=prod
ARG SITE_URL=https://mlk-my-little-kasbah.immo
ARG SITE_NAME="MLK My Little Kasbah"
ARG WEB_VITALS_ENABLED=false
ARG NODE_BUILD_MEMORY_MB=4096

RUN apk add --no-cache bash git curl python3 make g++ nodejs \
    && git config --global --add safe.directory /app

WORKDIR /app

ENV NODE_ENV=production
ENV APP_ENV=${APP_ENV}
ENV SITE_URL=${SITE_URL}
ENV SITE_NAME=${SITE_NAME}
ENV WEB_VITALS_ENABLED=${WEB_VITALS_ENABLED}
ENV NODE_OPTIONS=--max-old-space-size=${NODE_BUILD_MEMORY_MB}
ENV SCHEMAS_PATH=/opt/mlk-schemas
ENV NITRO_PRESET=node-server
ENV PUBLIC_HOST=localhost
ENV PUBLIC_PORT=3001

# ✅ 1) Installer les deps depuis le package.json de l'app (pas celui du parent)
COPY package.json \
    bun.lock ./
RUN bun install

# ✅ 2) Copier le code de l'app
COPY . ./

# ✅ 3) Copier les schémas via un contexte additionnel hors du dossier projet
COPY --from=schemas . /opt/mlk-schemas/

RUN test -f /opt/mlk-schemas/dtos/symfony_api/accommodation.yaml \
    && test -f /opt/mlk-schemas/dtos/symfony_api/web_page.yaml \
    && test -d /opt/mlk-schemas/webapp

# Build with Node to avoid bun-specific runtime shims in the server output.
RUN node ./node_modules/nuxt/bin/nuxt.mjs build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000
ENV WEB_VITALS_ENABLED=${WEB_VITALS_ENABLED}
ENV SCHEMAS_PATH=/opt/mlk-schemas
ENV PUBLIC_HOST=localhost
ENV PUBLIC_PORT=3001

COPY --from=build /app/.output ./.output
COPY --from=build /app/content /app/content
COPY --from=build /app/themes.yaml /app/themes.yaml
COPY --from=build /opt/mlk-schemas /opt/mlk-schemas
COPY --from=build /app/scripts/entrypoint-ssr.sh /entrypoint-ssr.sh
RUN chmod +x /entrypoint-ssr.sh

EXPOSE 3000
CMD ["/entrypoint-ssr.sh"]
