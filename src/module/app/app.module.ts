import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { environmentConfig } from '@config/environment.config';
import { datasourceOptions } from '@config/orm.config';

import { BookModule } from '@book/book.module';

import { GenreModule } from '@genre/genre.module';

import { IamModule } from '@iam/iam.module';

import { AppService } from '@/module/app/application/service/app.service';
import { ResponseSerializerService } from '@/module/app/application/service/response-serializer.service';
import { HealthController } from '@/module/health/interface/health.controller';
import { PaymentModule } from '@/module/payment/payment.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [environmentConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...datasourceOptions,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async (options) => {
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    IamModule,
    BookModule,
    GenreModule,
    DiscoveryModule,
    PaymentModule,
  ],
  providers: [AppService, ResponseSerializerService],
  exports: [AppService, ResponseSerializerService],
  controllers: [HealthController],
})
export class AppModule {}
