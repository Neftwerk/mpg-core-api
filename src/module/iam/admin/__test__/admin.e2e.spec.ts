import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { AdminResponseDto } from '@iam/admin/application/dto/admin-response.dto';
import { ADMIN_ENTITY_NAME } from '@iam/admin/domain/admin.name';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Admin Module', () => {
  let app: INestApplication;

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

  describe('GET - /admin', () => {
    it('should return paginated admins', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                type: ADMIN_ENTITY_NAME,
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
        .get(`/api/v1/admin?filter[username]=${username}`)
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
      const firstAdmin = { username: '' } as AdminResponseDto;
      const lastAdmin = { username: '' } as AdminResponseDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/admin?sort[username]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstAdmin.username = body.data[0].attributes.username;
          pageCount = body.meta.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/admin?sort[username]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastAdmin.username =
            resources[resources.length - 1].attributes.username;
          expect(lastAdmin.username).toBe(firstAdmin.username);
        });
    });

    it('should allow to select specific attributes', async () => {
      const attributes = [
        'username',
        'externalId',
        'roles',
      ] as (keyof AdminResponseDto)[];

      await request(app.getHttpServer())
        .get(`/api/v1/admin?fields[target]=${attributes.join(',')}`)
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

  describe('GET - /admin/me', () => {
    it('should return current admin', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/me')
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

    it('should throw an error if admin is not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
