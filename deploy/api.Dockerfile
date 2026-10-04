# API service: Medusa server that also serves the admin (/dashboard) and
# seller hub (/seller) builds from the same origin.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.0"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

# Public URL of this service; baked into the panel bundles.
ARG MERCUR_BACKEND_URL
ENV SERVE_DASHBOARDS=true \
    MERCUR_BACKEND_URL=${MERCUR_BACKEND_URL}

RUN bunx turbo run build --env-mode=loose \
      --filter=@acme/api^... --filter=@acme/admin^... --filter=@acme/vendor^...
RUN cd apps/admin-test && bunx vite build \
 && cd ../vendor && bunx vite build

WORKDIR /app/apps/api
ENV NODE_ENV=production
CMD ["sh", "-c", "bunx medusa db:migrate && bunx medusa start"]
