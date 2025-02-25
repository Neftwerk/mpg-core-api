import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminTable1740495056923 implements MigrationInterface {
  name = 'AddAdminTable1740495056923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`admin\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`external_id\` varchar(255) NULL, \`roles\` text NOT NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_7640d8ad91a4e271cba74e2262\` (\`uuid\`), UNIQUE INDEX \`IDX_5e568e001f9d1b91f67815c580\` (\`username\`), UNIQUE INDEX \`IDX_db769b03e65ec8e15172fdda2a\` (\`external_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD \`uuid\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD UNIQUE INDEX \`IDX_0a5875eb5ec460206c670c3b62\` (\`uuid\`)`,
    );
    await queryRunner.query(`ALTER TABLE \`book\` ADD \`genre_id\` int NULL`);
    await queryRunner.query(
      `ALTER TABLE \`genre\` ADD \`uuid\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`genre\` ADD UNIQUE INDEX \`IDX_3e554b051ddcb121a7e3d946e6\` (\`uuid\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`uuid\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_a95e949168be7b7ece1a2382fe\` (\`uuid\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`book\` ADD CONSTRAINT \`FK_f316eed809f6f7617821012ad05\` FOREIGN KEY (\`genre_id\`) REFERENCES \`genre\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_f316eed809f6f7617821012ad05\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP INDEX \`IDX_a95e949168be7b7ece1a2382fe\``,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`uuid\``);
    await queryRunner.query(
      `ALTER TABLE \`genre\` DROP INDEX \`IDX_3e554b051ddcb121a7e3d946e6\``,
    );
    await queryRunner.query(`ALTER TABLE \`genre\` DROP COLUMN \`uuid\``);
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`genre_id\``);
    await queryRunner.query(
      `ALTER TABLE \`book\` DROP INDEX \`IDX_0a5875eb5ec460206c670c3b62\``,
    );
    await queryRunner.query(`ALTER TABLE \`book\` DROP COLUMN \`uuid\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_db769b03e65ec8e15172fdda2a\` ON \`admin\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5e568e001f9d1b91f67815c580\` ON \`admin\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_7640d8ad91a4e271cba74e2262\` ON \`admin\``,
    );
    await queryRunner.query(`DROP TABLE \`admin\``);
  }
}
