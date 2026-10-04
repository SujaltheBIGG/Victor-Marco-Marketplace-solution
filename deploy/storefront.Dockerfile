# Storefront service: Next.js shop.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl unzip \
  && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.0"
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

# NEXT_PUBLIC_* values are inlined at build time.
ARG MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION=de
ARG NEXT_PUBLIC_SITE_NAME="Fleek Marketplace"
ARG NEXT_PUBLIC_SITE_DESCRIPTION="Shop home, tech, fashion, beauty and outdoor finds from independent sellers."
ARG NEXT_PUBLIC_VENDOR_URL
ARG NEXT_PUBLIC_ADMIN_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ARG REVALIDATE_SECRET
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL} \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_DEFAULT_REGION=${NEXT_PUBLIC_DEFAULT_REGION} \
    NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME} \
    NEXT_PUBLIC_SITE_DESCRIPTION=${NEXT_PUBLIC_SITE_DESCRIPTION} \
    NEXT_PUBLIC_VENDOR_URL=${NEXT_PUBLIC_VENDOR_URL} \
    NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL} \
    NEXT_PUBLIC_STRIPE_KEY=${NEXT_PUBLIC_STRIPE_KEY} \
    REVALIDATE_SECRET=${REVALIDATE_SECRET}

RUN bunx turbo run build --env-mode=loose --filter=@mercurjs/storefront

WORKDIR /app/apps/storefront
ENV NODE_ENV=production
CMD ["sh", "-c", "bunx next start -p ${PORT:-3000}"]
