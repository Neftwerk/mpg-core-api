import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSignerTable1741967015194 implements MigrationInterface {
  name = 'AddSignerTable1741967015194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "my_pocket_gallery"."signer" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "public_key" character varying NOT NULL, "domain" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" integer, CONSTRAINT "UQ_1cb1608c099983f0c6ee4e82fb6" UNIQUE ("uuid"), CONSTRAINT "UQ_c53e437161e9a25af9edd246b29" UNIQUE ("public_key"), CONSTRAINT "PK_07c56344c848a4910c80dbe0eca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "my_pocket_gallery"."signer" ADD CONSTRAINT "FK_9b66324ce23b08392eacdfae759" FOREIGN KEY ("user_id") REFERENCES "my_pocket_gallery"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "my_pocket_gallery"."signer" DROP CONSTRAINT "FK_9b66324ce23b08392eacdfae759"`,
    );
    await queryRunner.query(`DROP TABLE "my_pocket_gallery"."signer"`);
  }
}
