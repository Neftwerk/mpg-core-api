import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookResponseAdapter } from '@book/application/adapter/book-response.adapter';
import { BookMapper } from '@book/application/mapper/book.mapper';
import { CreateBookPolicyHandler } from '@book/application/policy/create-book-policy.handler';
import { DeleteBookPolicyHandler } from '@book/application/policy/delete-book-policy.handler';
import { ReadBookPolicyHandler } from '@book/application/policy/read-book-policy.handler';
import { UpdateBookPolicyHandler } from '@book/application/policy/update-book-policy.handler';
import { BOOK_REPOSITORY_KEY } from '@book/application/repository/book.repository.interface';
import { BookService } from '@book/application/service/book.service';
import { bookPermissions } from '@book/domain/book.permission';
import { BookMysqlRepository } from '@book/infrastructure/database/book.mysql.repository';
import { BookSchema } from '@book/infrastructure/database/book.schema';
import { BookController } from '@book/interface/book.controller';

import { AuthorizationModule } from '@iam/authorization/authorization.module';

const policyHandlersProviders = [
  ReadBookPolicyHandler,
  CreateBookPolicyHandler,
  UpdateBookPolicyHandler,
  DeleteBookPolicyHandler,
];

const bookRepositoryProvider: Provider = {
  provide: BOOK_REPOSITORY_KEY,
  useClass: BookMysqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([BookSchema]),
    AuthorizationModule.forFeature({
      permissions: bookPermissions,
    }),
  ],
  controllers: [BookController],
  providers: [
    BookResponseAdapter,
    BookService,
    bookRepositoryProvider,
    ...policyHandlersProviders,
    BookMapper,
  ],
  exports: [BookService, bookRepositoryProvider, BookMapper],
})
export class BookModule {}
