import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminResponseAdapter } from '@iam/admin/application/adapter/admin-responser.adapter';
import { AdminMapper } from '@iam/admin/application/mapper/admin.mapper';
import { ADMIN_REPOSITORY_KEY } from '@iam/admin/application/repository/admin.repository.interface';
import { AdminService } from '@iam/admin/application/service/admin.service';
import { adminPermissions } from '@iam/admin/domain/admin.permission';
import { AdminMysqlRepository } from '@iam/admin/infrastructure/database/admin.mysql.repository';
import { AdminSchema } from '@iam/admin/infrastructure/database/admin.schema';
import { AdminController } from '@iam/admin/interface/admin.controller';
import { ReadAdminPolicyHandler } from '@iam/authentication/application/policy/read-admin-policy.handler';
import { AuthorizationModule } from '@iam/authorization/authorization.module';

const policyHandlersProviders = [ReadAdminPolicyHandler];

const adminRepositoryProvider: Provider = {
  provide: ADMIN_REPOSITORY_KEY,
  useClass: AdminMysqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminSchema]),
    AuthorizationModule.forFeature({ permissions: adminPermissions }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    adminRepositoryProvider,
    AdminMapper,
    AdminResponseAdapter,
    ...policyHandlersProviders,
  ],
  exports: [AdminService, adminRepositoryProvider, AdminMapper],
})
export class AdminModule {}
