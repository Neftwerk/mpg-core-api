import { IDENTITY_ROLE } from '@module/recovery/application/enum/auth-identity-role.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { BiggerRecoveryNode } from '@common/infrastructure/recovery/nodes/biggerRecoveryNode';
import { PlanetPayRecoveryNode } from '@common/infrastructure/recovery/nodes/planetPayRecoveryNode';
import {
  createAccount,
  getSignatureFromTransaction,
  setAccountSigners,
} from '@common/infrastructure/stellar/stellar-local.setup';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Recovery Module', () => {
  let app: INestApplication;
  jest.setTimeout(100000);

  const user1Token = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000001',
  });

  beforeAll(async () => {
    const sponsorAccount = await createAccount();
    process.env.STELLAR_ORGANIZATION_PUBLIC_KEY_SPONSOR_ACCOUNT =
      sponsorAccount.publicKey();
    process.env.STELLAR_ORGANIZATION_SECRET_KEY_SPONSOR_ACCOUNT =
      sponsorAccount.secret();

    process.env.ACCOUNT_RECOVERY_PLANET_PAY_NODE =
      'https://recovery.planetpay.test.io';
    process.env.ACCOUNT_RECOVERY_BIGGER_NODE =
      'https://recovery.bigger.test.systems';

    const user1Keypair = Keypair.fromSecret(
      'SC5O7VZUXDJ6JBDSZ74DSERXL7W3Y5LTOAMRF7RQRL3TAGAPS7LUVG3L',
    );

    await setAccountSigners(user1Keypair, [
      {
        publicKey: 'GB3MCW2C4G5J7Z5VDLGNWOTKF57XWDQFPAQJIVGBWCZC3DJRQISDII3C',
        weight: 10,
      },
      {
        publicKey: 'GDQY6F2JNILD5FOAI5ZQSFZGWM45QVKGBC5L5DGXO7QGB6X3DZ6AZ5QY',
        weight: 10,
      },
      {
        publicKey: 'GB2UA4PPB4VBWZZNTIUKELYI6EGWWF4LVAPK73J2B7TKTEQH5RQ6GQZP',
        weight: 20,
      },
    ]);

    await loadFixtures(`${__dirname}/fixture`, datasourceOptions);
    const moduleRef = await testModuleBootstrapper();
    app = moduleRef.createNestApplication({ logger: false });
    setupApp(app);

    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET - /recovery/auth', () => {
    it('should return recovery challenge', async () => {
      jest
        .spyOn(BiggerRecoveryNode.prototype, 'getSep10Challenge')
        .mockResolvedValue('mock-challenge-1');
      jest
        .spyOn(PlanetPayRecoveryNode.prototype, 'getSep10Challenge')
        .mockResolvedValue('mock-challenge-2');

      await request(app.getHttpServer())
        .get('/api/v1/recovery/auth')
        .auth(user1Token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('recoveryChallenge');
          expect(body.data.attributes.challenges).toBeDefined();
          expect(
            BiggerRecoveryNode.prototype.getSep10Challenge,
          ).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.getSep10Challenge,
          ).toHaveBeenCalled();
        });
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/recovery/auth')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST - /recovery/auth', () => {
    it('should generate recovery token', async () => {
      jest
        .spyOn(BiggerRecoveryNode.prototype, 'getSep10Token')
        .mockResolvedValue('mock-token-1');
      jest
        .spyOn(PlanetPayRecoveryNode.prototype, 'getSep10Token')
        .mockResolvedValue('mock-token-2');

      const signedChallenges = {
        'recovery.planetpay.test.io': 'signed-challenge-1',
        'recovery.bigger.test.systems': 'signed-challenge-2',
      };

      await request(app.getHttpServer())
        .post('/api/v1/recovery/auth')
        .auth(user1Token, { type: 'bearer' })
        .send({ signedChallenges })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('recoveryToken');
          expect(body.data.attributes.tokens).toBeDefined();
          expect(BiggerRecoveryNode.prototype.getSep10Token).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.getSep10Token,
          ).toHaveBeenCalled();
        });
    });
  });

  describe('POST - /recovery/configuration', () => {
    it('should configure account recovery', async () => {
      jest
        .spyOn(BiggerRecoveryNode.prototype, 'registerAccount')
        .mockResolvedValue({
          address: 'mock-address-1',
          identities: [{ role: IDENTITY_ROLE.OWNER }],
          signers: [
            { key: 'GBTE7ARPMRISZPUAYPXIYWLRTGSUJZLG6PBJHMM5FYW7MD7VLZ4RJKDV' },
          ],
        });
      jest
        .spyOn(PlanetPayRecoveryNode.prototype, 'registerAccount')
        .mockResolvedValue({
          address: 'mock-address-2',
          identities: [{ role: IDENTITY_ROLE.OWNER }],
          signers: [
            { key: 'GCGOPLURMCWZ65AJDZ3Z54XYYAOWJFBSWKJI62NT5LU7ZBY5UV7534ZC' },
          ],
        });

      const deviceKey =
        'GCRWYWS24OFF4O6NG3Q2UXIT5CXN2DA4IQC2N2E5VHSAURS7C5OZDDDR';
      const recoveryServerTokens = {
        'recovery.planetpay.test.io': 'mock-token-1',
        'recovery.bigger.test.systems': 'mock-token-2',
      };

      await request(app.getHttpServer())
        .post('/api/v1/recovery/configuration')
        .auth(user1Token, { type: 'bearer' })
        .send({ deviceKey })
        .set(
          'recovery.planetpay.test.io-recovery-token',
          recoveryServerTokens['recovery.planetpay.test.io'],
        )
        .set(
          'recovery.bigger.test.systems-recovery-token',
          recoveryServerTokens['recovery.bigger.test.systems'],
        )
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('configureRecovery');
          expect(body.data.attributes.xdr).toBeDefined();
          expect(body.data.attributes.signers).toBeDefined();
          expect(
            BiggerRecoveryNode.prototype.registerAccount,
          ).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.registerAccount,
          ).toHaveBeenCalled();
        });
    });
  });

  describe('GET - /recovery/external-auth/verification', () => {
    it('should send verification code', async () => {
      jest
        .spyOn(BiggerRecoveryNode.prototype, 'sendExternalAuthCode')
        .mockResolvedValue();
      jest
        .spyOn(PlanetPayRecoveryNode.prototype, 'sendExternalAuthCode')
        .mockResolvedValue();

      await request(app.getHttpServer())
        .get('/api/v1/recovery/external-auth/verification')
        .auth(user1Token, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('sendVerificationCode');
          expect(body.data.attributes.servers).toBeDefined();
          expect(
            BiggerRecoveryNode.prototype.sendExternalAuthCode,
          ).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.sendExternalAuthCode,
          ).toHaveBeenCalled();
        });
    });
  });

  describe('POST - /recovery/external-auth/authentication', () => {
    it('should authenticate with verification code', async () => {
      jest
        .spyOn(BiggerRecoveryNode.prototype, 'authenticateWithExternalAuthCode')
        .mockResolvedValue('mock-auth-token-1');
      jest
        .spyOn(
          PlanetPayRecoveryNode.prototype,
          'authenticateWithExternalAuthCode',
        )
        .mockResolvedValue('mock-auth-token-2');

      const codes = {
        'recovery.planetpay.test.io': 'code-1',
        'recovery.bigger.test.systems': 'code-2',
      };

      await request(app.getHttpServer())
        .post('/api/v1/recovery/external-auth/authentication')
        .auth(user1Token, { type: 'bearer' })
        .send({ codes })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('authenticateWithVerificationCode');
          expect(body.data.attributes.externalAuthTokens).toBeDefined();
          expect(
            BiggerRecoveryNode.prototype.authenticateWithExternalAuthCode,
          ).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.authenticateWithExternalAuthCode,
          ).toHaveBeenCalled();
        });
    });
  });

  describe('POST - /recovery/signer', () => {
    it('should create signers', async () => {
      const signers = {
        'recovery.planetpay.test.io': 'signer-key-1',
        'recovery.bigger.test.systems': 'signer-key-2',
      };

      await request(app.getHttpServer())
        .post('/api/v1/recovery/signer')
        .auth(user1Token, { type: 'bearer' })
        .send({ signers })
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          expect(body.data.type).toBe('addSigners');
          expect(body.data.attributes.signers).toBeDefined();
        });
    });
  });

  describe('POST - /recovery', () => {
    it('should recover account', async () => {
      const newDeviceKey =
        'GD7NOYJCL6WVU7IO6DFXRXRNQBRMU2G7KNJ6HMF6G3PMHTIZLPY6PAON';

      await request(app.getHttpServer())
        .post('/api/v1/recovery')
        .auth(user1Token, { type: 'bearer' })
        .send({ newDeviceKey })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('recoverAccount');
          expect(body.data.attributes.xdr).toBeDefined();
        });
    });
  });

  describe('POST - /recovery/signature', () => {
    it('should add signatures', async () => {
      const recoveryServerTokens = {
        'recovery.planetpay.test.io': 'mock-token-1',
        'recovery.bigger.test.systems': 'mock-token-2',
      };

      const user1Keypair = Keypair.fromSecret(
        'SC5O7VZUXDJ6JBDSZ74DSERXL7W3Y5LTOAMRF7RQRL3TAGAPS7LUVG3L',
      );

      const { transaction, signature } =
        await getSignatureFromTransaction(user1Keypair);

      jest
        .spyOn(BiggerRecoveryNode.prototype, 'generateSignature')
        .mockResolvedValue(signature);
      jest
        .spyOn(PlanetPayRecoveryNode.prototype, 'generateSignature')
        .mockResolvedValue(signature);

      jest
        .spyOn(StellarTransactionAdapter.prototype, 'addSignatures')
        .mockReturnValue(transaction);

      await request(app.getHttpServer())
        .post('/api/v1/recovery/signature')
        .auth(user1Token, { type: 'bearer' })
        .send({ transaction })
        .set(
          'recovery.planetpay.test.io-recovery-token',
          recoveryServerTokens['recovery.planetpay.test.io'],
        )
        .set(
          'recovery.bigger.test.systems-recovery-token',
          recoveryServerTokens['recovery.bigger.test.systems'],
        )
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.type).toBe('addSignatures');
          expect(body.data.attributes.xdr).toBeDefined();
          expect(
            BiggerRecoveryNode.prototype.generateSignature,
          ).toHaveBeenCalled();
          expect(
            PlanetPayRecoveryNode.prototype.generateSignature,
          ).toHaveBeenCalled();
        });
    });
  });
});
