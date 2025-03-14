import { SUBMISSION_ENTITY_NAME } from '@module/submission/domain/submission.name';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { generateXdr } from '@common/infrastructure/stellar/stellar-local.setup';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Submission Module', () => {
  let app: INestApplication;

  const user1Token = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000001',
  });

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  beforeAll(async () => {
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

  describe('POST - /submission', () => {
    it('should submit a transaction successfully', async () => {
      const xdrToSubmit = await generateXdr();

      await request(app.getHttpServer())
        .post('/api/v1/submission')
        .auth(adminToken, { type: 'bearer' })
        .send({ xdr: xdrToSubmit })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              type: SUBMISSION_ENTITY_NAME,
              attributes: expect.objectContaining({
                hash: expect.any(String),
                successful: expect.any(Boolean),
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error when submitting an invalid transaction', async () => {
      const invalidXdr = 'invalid-xdr';

      await request(app.getHttpServer())
        .post('/api/v1/submission')
        .auth(adminToken, { type: 'bearer' })
        .send({ xdr: invalidXdr })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .then(({ body }) => {
          expect(body.error.detail).toBeDefined();
        });
    });

    it('should throw an error when no XDR is provided', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/submission')
        .auth(user1Token, { type: 'bearer' })
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should throw an error when user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/submission')
        .send({ xdr: 'AAAAAgAAAAA=' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
