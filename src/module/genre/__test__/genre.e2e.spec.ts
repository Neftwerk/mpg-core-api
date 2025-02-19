import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';

import { loadFixtures } from '@data/util/fixture-loader';

import { setupApp } from '@config/app.config';
import { datasourceOptions } from '@config/orm.config';

import { CreateGenreDto } from '@genre/application/dto/create-genre.dto';
import { GenreResponseDto } from '@genre/application/dto/genre-response.dto';
import { UpdateGenreDto } from '@genre/application/dto/update-genre.dto';
import { GENRE_ENTITY_NAME } from '@genre/domain/genre.name';

import { testModuleBootstrapper } from '@test/test.module.bootstrapper';
import { createAccessToken } from '@test/test.util';

describe('Genre Module', () => {
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

  describe('GET - /genre', () => {
    it('should return paginated genres', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/genre')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  name: expect.any(String),
                  uuid: expect.any(String),
                  createdAt: expect.any(String),
                  updatedAt: expect.any(String),
                  deletedAt: null,
                }),
                id: expect.any(String),
                type: GENRE_ENTITY_NAME,
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
      const name = 'Romance';

      await request(app.getHttpServer())
        .get(`/api/v1/genre?filter[name]=${name}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                attributes: expect.objectContaining({
                  name,
                }),
              }),
            ]),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should allow to sort by attributes', async () => {
      const firstGenre = { name: '' } as GenreResponseDto;
      const lastGenre = { name: '' } as GenreResponseDto;
      let pageCount: number;

      await request(app.getHttpServer())
        .get('/api/v1/genre?sort[name]=DESC')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          firstGenre.name = body.data[0].attributes.name;
          pageCount = body.meta.pageCount;
        });

      await request(app.getHttpServer())
        .get(`/api/v1/genre?sort[name]=ASC&page[number]=${pageCount}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const resources = body.data;
          lastGenre.name = resources[resources.length - 1].attributes.name;
          expect(lastGenre.name).toBe(firstGenre.name);
        });
    });
  });

  describe('GET - /genre/:id', () => {
    it('should return a specific genre', async () => {
      const genreId = 1;

      await request(app.getHttpServer())
        .get(`/api/v1/genre/${genreId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: genreId.toString(),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if genre is not found', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/genre/9999')
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Genre with ID 9999 not found');
        });
    });
  });

  describe('POST - /genre', () => {
    it('should create a new genre', async () => {
      const createGenreDto = { name: 'Mistery' } as CreateGenreDto;

      await request(app.getHttpServer())
        .post('/api/v1/genre/')
        .auth(adminToken, { type: 'bearer' })
        .send(createGenreDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              attributes: expect.objectContaining({
                name: createGenreDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });
  });

  describe('PATCH - /genre/:id', () => {
    it('should update an existing genre', async () => {
      const createGenreDto = { name: 'Drama' } as CreateGenreDto;
      const updateGenreDto = { name: 'Science Fiction' } as UpdateGenreDto;
      let genreId: number;

      await request(app.getHttpServer())
        .post('/api/v1/genre')
        .auth(adminToken, { type: 'bearer' })
        .send(createGenreDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createGenreDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          genreId = body.data.id;
        });

      await request(app.getHttpServer())
        .patch(`/api/v1/genre/${genreId}`)
        .auth(adminToken, { type: 'bearer' })
        .send(updateGenreDto)
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: genreId.toString(),
              attributes: expect.objectContaining({
                name: updateGenreDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
        });
    });

    it('should throw an error if genre is not found', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/genre/9999')
        .send({ name: 'non-existing-genre' } as UpdateGenreDto)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND)
        .then(({ body }) => {
          expect(body.error.detail).toBe('Genre with ID 9999 not found');
        });
    });
  });

  describe('DELETE - /genre/:id', () => {
    it('should delete a genre', async () => {
      const createGenreDto = { name: 'Drama' } as CreateGenreDto;
      let genreId: number;

      await request(app.getHttpServer())
        .post('/api/v1/genre')
        .auth(adminToken, { type: 'bearer' })
        .send(createGenreDto)
        .expect(HttpStatus.CREATED)
        .then(({ body }) => {
          const expectedResponse = expect.objectContaining({
            data: expect.objectContaining({
              id: expect.any(String),
              attributes: expect.objectContaining({
                name: createGenreDto.name,
              }),
            }),
          });
          expect(body).toEqual(expectedResponse);
          genreId = body.data.id;
        });

      await request(app.getHttpServer())
        .delete(`/api/v1/genre/${genreId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.OK);

      await request(app.getHttpServer())
        .get(`/api/v1/genre/${genreId}`)
        .auth(adminToken, { type: 'bearer' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
