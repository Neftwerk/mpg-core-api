import { ENVIRONMENT } from '@config/environment.enum';

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
  stellar: {
    serverUrl:
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? process.env.STELLAR_LOCAL_URL
        : process.env.STELLAR_SERVER_URL,
    networkPassphrase:
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE
        : process.env.STELLAR_NETWORK_PASSPHRASE,
    organizationPublicKeySponsorAccount:
      process.env.STELLAR_ORGANIZATION_PUBLIC_KEY_SPONSOR_ACCOUNT,
    organizationSecretKeySponsorAccount:
      process.env.STELLAR_ORGANIZATION_SECRET_KEY_SPONSOR_ACCOUNT,
    organizationPublicKeySponsorTrustlines:
      process.env.STELLAR_ORGANIZATION_PUBLIC_KEY_SPONSOR_TRUSTLINES,
    organizationSecretKeySponsorTrustlines:
      process.env.STELLAR_ORGANIZATION_SECRET_KEY_SPONSOR_TRUSTLINES,
    initialXlmBalanceOfSponsoredAccount:
      process.env.STELLAR_INITIAL_XLM_BALANCE_OF_SPONSORED_ACCOUNT,
    usdcAssetCode: process.env.USDC_ASSET_CODE,
    usdcAssetIssuer: process.env.USDC_ASSET_ISSUER,
  },
  accountRecovery: {
    planetPayRecoveryNode: process.env.ACCOUNT_RECOVERY_PLANET_PAY_NODE,
    biggerRecoveryNode: process.env.ACCOUNT_RECOVERY_BIGGER_NODE,
  },
});
