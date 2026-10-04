// Single public entry point: API routes, the dashboards and uploaded files go
// to the Medusa server, everything else to the Next.js storefront.
import http from "node:http"

const API = { host: "127.0.0.1", port: 9000 }
const STOREFRONT = { host: "127.0.0.1", port: 3000 }
const API_PREFIXES = ["/admin", "/vendor", "/store", "/auth", "/static", "/dashboard", "/seller", "/hooks", "/health"]

const isApiPath = (url) => {
  const path = url.split("?")[0]
  return API_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

http
  .createServer((req, res) => {
    const target = isApiPath(req.url ?? "/") ? API : STOREFRONT
    const upstream = http.request(
      { ...target, path: req.url, method: req.method, headers: req.headers },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers)
        upstreamRes.pipe(res)
      }
    )
    upstream.on("error", () => {
      if (!res.headersSent) {
        res.writeHead(502, { "content-type": "text/plain" })
      }
      res.end("Fleek is starting up, please refresh in a moment.")
    })
    req.pipe(upstream)
  })
  .listen(Number(process.env.PORT ?? 8080), "0.0.0.0", () => {
    console.log(`Gateway listening on ${process.env.PORT ?? 8080}`)
  })
