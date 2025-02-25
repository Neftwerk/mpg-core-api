export const environmentConfig = () => ({
  server: {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_APP_URL,
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
  },
  jwt: {
    providerPrefix: process.env.JWT_PROVIDER_PREFIX,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
});
