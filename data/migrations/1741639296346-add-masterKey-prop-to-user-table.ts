import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMasterKeyPropToUserTable1741639296346
  implements MigrationInterface
{
  name = 'AddMasterKeyPropToUserTable1741639296346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "my_pocket_gallery"."user" ADD "master_key" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "my_pocket_gallery"."user" DROP COLUMN "master_key"`,
    );
  }
}
