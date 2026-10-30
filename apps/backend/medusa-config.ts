import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  admin: {
    vite: () => {
      let hmrServer;
      if (process.env.HMR_BIND_HOST) {
        const { createServer } = require("http");
        hmrServer = createServer();
        const hmrPort = parseInt(process.env.HMR_PORT || "9001");
        hmrServer.listen(hmrPort, process.env.HMR_BIND_HOST);
      }

      let allowedHosts;
      if (process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS) {
        allowedHosts = [process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS];
      }

      return {
        server: {
          allowedHosts,
          hmr: {
            server: hmrServer,
          },
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    // Adyen is only registered when ADYEN_API_KEY is set, along with ADYEN_MERCHANT_ACCOUNT, ADYEN_HMAC_KEY
    // (the standard webhook's HMAC key), and ADYEN_ENVIRONMENT (TEST or LIVE). Enable it in a region, for
    // example from the Medusa Admin, and point the webhook to {backend_url}/hooks/payment/adyen_adyen.
    ...(process.env.ADYEN_API_KEY
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-adyen",
                  id: "adyen",
                  options: {
                    apiKey: process.env.ADYEN_API_KEY,
                    merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
                    hmacKey: process.env.ADYEN_HMAC_KEY,
                    environment: process.env.ADYEN_ENVIRONMENT,
                    liveEndpointUrlPrefix:
                      process.env.ADYEN_LIVE_ENDPOINT_URL_PREFIX,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
});
