import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { Genre } from '@genre/domain/genre.entity';

export const GENRE_REPOSITORY_KEY = 'genre_repository';

export interface IGenreRepository {
  getAll(options?: IGetAllOptions<Genre>): Promise<ICollection<Genre>>;
  getOneByIdOrFail(id: number): Promise<Genre>;
  getOneById(id: number): Promise<Genre>;
  saveOne(genre: Genre): Promise<Genre>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Genre, 'id'>>,
    relations?: string[],
  ): Promise<Genre>;
  deleteOneOrFail(id: number): Promise<void>;
}
