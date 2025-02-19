import { Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GenreResponseAdapter } from '@genre/application/adapter/genre-response.adapter';
import { GenreMapper } from '@genre/application/mapper/genre.mapper';
import { GENRE_REPOSITORY_KEY } from '@genre/application/repository/genre.repository.interface';
import { GenreService } from '@genre/application/service/genre.service';
import { genrePermissions } from '@genre/domain/genre.permission';
import { GenreMysqlRepository } from '@genre/infrastructure/database/genre.mysql.repository';
import { GenreSchema } from '@genre/infrastructure/database/genre.schema';
import { GenreController } from '@genre/interface/genre.controller';

import { AuthorizationModule } from '@iam/authorization/authorization.module';

const genreRepositoryProvider: Provider = {
  provide: GENRE_REPOSITORY_KEY,
  useClass: GenreMysqlRepository,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([GenreSchema]),
    AuthorizationModule.forFeature({ permissions: genrePermissions }),
  ],
  controllers: [GenreController],
  providers: [
    GenreMapper,
    GenreService,
    GenreResponseAdapter,
    genreRepositoryProvider,
  ],
  exports: [GenreMapper, GenreService, genreRepositoryProvider],
})
export class GenreModule {}
