export const environmentConfig = () => ({
  server: {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_APP_URL,
  },
  cognito: {
    clientId: process.env.COGNITO_CLIENT_ID,
    issuer: process.env.COGNITO_ISSUER,
    endpoint: process.env.COGNITO_ENDPOINT,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
});
