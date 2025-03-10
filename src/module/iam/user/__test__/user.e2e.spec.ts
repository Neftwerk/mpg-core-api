import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { createAccount } from '@common/infrastructure/stellar/stellar-local.setup';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';
import { USER_ENTITY_NAME } from '@iam/user/domain/user.name';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('User Module', () => {
  let app: INestApplication;

  const adminToken = createAccessToken({
    sub: '00000000-0000-0000-0000-00000000000X',
  });

  const user1Token = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000001',
  });

  const user2Token = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000002',
  });

  const user3Token = createAccessToken({
    sub: '00000000-0000-0000-0000-000000000003',
  });

  beforeAll(async () => {
    const sponsorAccount = await createAccount();
    process.env.STELLAR_ORGANIZATION_PUBLIC_KEY_SPONSOR_ACCOUNT =
      sponsorAccount.publicKey();
    process.env.STELLAR_ORGANIZATION_SECRET_KEY_SPONSOR_ACCOUNT =
      sponsorAccount.secret();

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

  describe('GET - /user', () => {
    it('should return paginated users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                type: USER_ENTITY_NAME,
                id: expect.any(String),
                attributes: expect.objectContaining({
                  username: expect.any(String),
                  uuid: expect.any(String),
                  externalId: expect.any(String),
                  roles: expect.arrayContaining([expect.any(String)]),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  deletedAt: null,
                }),
              }),
            ]),
            links: expect.any(Object),
            meta: expect.objectContaining({
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
              pageCount: expect.any(Number),
              itemCount: expect.any(Number),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to filter by attributes', async () => {
      const username = 'admin@test.com';

      await request(app.getHttpServer())
        .get(`/api/v1/user?filter[username]=${username}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  username,
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to sort by attributes', async () => {
      const firstUser = { username: '' } as UserResponseDto;
      const lastUser = { username: '' } as UserResponseDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/user?sort[username]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstUser.username = body.data[0].attributes.username;
          pageCount = body.meta.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/user?sort[username]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastUser.username =
            resources[resources.length - 1].attributes.username;
          expect(lastUser.username).toBe(firstUser.username);
        });
    });

    it('should allow to select specific attributes', async () => {
      const attributes = [
        'username',
        'externalId',
        'roles',
      ] as (keyof UserResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/user?fields[target]=${attributes.join(',')}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resourceAttributes = body.data[0].attributes;
          expect(Object.keys(resourceAttributes).length).toBe(
            attributes.length,
          );
          expect(resourceAttributes).toEqual({
            username: expect.any(String),
            externalId: expect.any(String),
            roles: expect.arrayContaining([expect.any(String)]),
          });
        });
    });
  });

  describe('GET - /user/me', () => {
    it('should return current user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                username: 'admin@test.com',
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH - /user/me/wallet', () => {
    const masterKey =
      'GBE755LOEOIEFVSOC3USBQDV5YES67757ADXHBLLJWYHNFZLEYP2FGHQ';

    it('should add a wallet to the current user', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/user/me/wallet')
        .auth(user1Token, { type: 'bearer' })
        .send({ masterKey })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.attributes).toEqual(
            expect.objectContaining({
              masterKey,
            }),
          );
        });
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/user/me/wallet')
        .send({ masterKey: 'test-key' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST - /user/create-wallet', () => {
    const createdMasterKey =
      'GBE755LOEOIEFVSOC3USBQDV5YES67757ADXHBLLJWYHNFZLEYP2FGHQ';

    it('should create a new wallet for the user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/create-wallet')
        .auth(user2Token, { type: 'bearer' })
        .send({ masterKey: createdMasterKey })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.attributes).toEqual(
            expect.objectContaining({
              xdr: expect.any(String),
            }),
          );
        });
    });

    it('should throw an error if user already has a master key', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/create-wallet')
        .auth(user1Token, { type: 'bearer' })
        .send({ masterKey: createdMasterKey })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/create-wallet')
        .send({ masterKey: 'test-key' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST - /user/wallet/trustline', () => {
    const asset = {
      assetCode: 'USDE',
      assetIssuer: 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI',
    };

    it('should create a trustline for the user wallet', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/wallet/trustline')
        .auth(user3Token, { type: 'bearer' })
        .send({ asset })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          expect(body.data.attributes).toEqual(
            expect.objectContaining({
              xdr: expect.any(String),
            }),
          );
        });
    });

    it('should throw an error if user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/user/wallet/trustline')
        .send({ asset })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
