# One service runs the whole marketplace behind a single URL: the storefront
# at /, the seller hub at /seller, the admin at /dashboard and the API routes.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.0"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

# PUBLIC_URL is the service's public origin; it and the NEXT_PUBLIC_* values
# are baked into the dashboards and the storefront at build time.
ARG PUBLIC_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_DEFAULT_REGION=de
ARG NEXT_PUBLIC_SITE_NAME="Fleek Marketplace"
ARG NEXT_PUBLIC_SITE_DESCRIPTION="Shop home, tech, fashion, beauty and outdoor finds from independent sellers."
ARG NEXT_PUBLIC_STRIPE_KEY
ENV SERVE_DASHBOARDS=true \
    MERCUR_BACKEND_URL=${PUBLIC_URL} \
    MEDUSA_BACKEND_URL=http://127.0.0.1:9000 \
    NEXT_PUBLIC_BASE_URL=${PUBLIC_URL} \
    NEXT_PUBLIC_VENDOR_URL=${PUBLIC_URL}/seller \
    NEXT_PUBLIC_ADMIN_URL=${PUBLIC_URL}/dashboard \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_DEFAULT_REGION=${NEXT_PUBLIC_DEFAULT_REGION} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    NEXT_PUBLIC_SITE_DESCRIPTION=${NEXT_PUBLIC_SITE_DESCRIPTION} \
    NEXT_PUBLIC_STRIPE_KEY=${NEXT_PUBLIC_STRIPE_KEY}

RUN bunx turbo run build --env-mode=loose \
      --filter=@acme/api^... --filter=@acme/admin^... --filter=@acme/vendor^... \
      --filter=@mercurjs/storefront
RUN cd apps/admin-test && bunx vite build \
 && cd ../vendor && bunx vite build

ENV NODE_ENV=production
CMD ["bash", "deploy/start.sh"]
