import { loadEnv } from '@medusajs/framework/utils'
import { withMercur } from '@mercurjs/core'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// In production the API serves the built admin and vendor panels itself
// (/dashboard, /seller) so they share its origin; locally they run on Vite.
const serveDashboards = process.env.SERVE_DASHBOARDS === 'true'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

module.exports = withMercur({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  featureFlags: {
    seller_registration: true
  },
  modules: [
    {
      resolve: '@mercurjs/core/modules/admin-ui',
      options: {
        appDir: serveDashboards ? '../admin-test' : '',
        path: '/dashboard',
        disable: !serveDashboards
      }
    },
    {
      resolve: '@mercurjs/core/modules/vendor-ui',
      options: {
        appDir: serveDashboards ? '../vendor' : '',
        path: '/seller',
        disable: !serveDashboards
      }
    },
    {
      resolve: '@medusajs/medusa/cache-redis',
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: '@medusajs/medusa/event-bus-redis',
      options: { redisUrl: REDIS_URL },
    },
    {
      resolve: '@medusajs/medusa/workflow-engine-redis',
      options: { redis: { url: REDIS_URL } },
    },
    {
      resolve: '@medusajs/medusa/locking',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/locking-redis',
            id: 'locking-redis',
            is_default: true,
            options: { redisUrl: REDIS_URL },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/email-notifications',
            id: 'email',
            options: {
              channels: ['email'],
              api_key: process.env.BREVO_API_KEY,
              from_email: process.env.EMAIL_FROM,
              from_name: process.env.EMAIL_FROM_NAME || 'Fleek',
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              // Uploads live in static/uploads, which is a persistent volume in
              // production; the rest of static/ (catalog images) ships with the
              // image and is replaced on every deploy.
              upload_dir: `${process.cwd()}/static/uploads`,
              // The local provider bakes this into every uploaded file URL.
              // It must be the publicly reachable origin in production, or
              // images resolve to localhost and render broken.
              backend_url: `${process.env.FILE_BACKEND_URL || 'http://localhost:9000/static'}/uploads`,
            },
          },
        ],
      },
    },
  ],
})
