import { getRequestOrigin } from "@/lib/utils/site"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = getRequestOrigin(request)
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /cart",
          "Disallow: /checkout",
          "Disallow: /*/cart",
          "Disallow: /*/checkout",
          "Disallow: /*/account",
          "Disallow: /*/order/",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n")

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
