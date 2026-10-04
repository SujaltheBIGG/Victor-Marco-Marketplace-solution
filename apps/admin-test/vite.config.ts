import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { mercurDashboardPlugin } from '@mercurjs/dashboard-sdk/vite'
import { createRequire } from 'node:module'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // SERVE_DASHBOARDS=true builds the panel to be served by the API under
  // /dashboard. Set MERCUR_BACKEND_URL to the API's public URL for that build. The
  // CJS plugin build is used because it can require medusa-config.ts to pick
  // up the base path (the ESM build silently falls back to "/").
  const serveFromApi = env.SERVE_DASHBOARDS === 'true'
  const dashboardPlugin: typeof mercurDashboardPlugin = serveFromApi
    ? createRequire(import.meta.url)('@mercurjs/dashboard-sdk/vite').mercurDashboardPlugin
    : mercurDashboardPlugin
  const backendUrl = env.VITE_MERCUR_BACKEND_URL || env.MERCUR_BACKEND_URL
  const vendorUrl =
    env.VITE_MERCUR_VENDOR_URL || env.MERCUR_VENDOR_URL

  return {
    plugins: [
      react(),
      dashboardPlugin({
        medusaConfigPath: '../api/medusa-config.ts',
        name: 'Fleek',
        logo: serveFromApi ? '/dashboard/logo.svg' : '/logo.svg',
        ...(backendUrl ? { backendUrl } : {}),
        ...(vendorUrl ? { vendorUrl } : {}),
      }),
    ],
  }
})
