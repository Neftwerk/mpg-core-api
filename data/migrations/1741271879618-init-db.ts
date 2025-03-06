import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1741271879618 implements MigrationInterface {
  name = 'InitDb1741271879618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "my_pocket_gallery"."user" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "external_id" character varying, "roles" text NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "surname" character varying NOT NULL, "biography" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_a95e949168be7b7ece1a2382fed" UNIQUE ("uuid"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_d9479cbc9c65660b7cf9b657954" UNIQUE ("external_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "my_pocket_gallery"."user"`);
  }
}
