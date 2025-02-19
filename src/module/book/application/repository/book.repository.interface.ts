import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { BookRelation } from '@book/application/enum/book-relations.enum';
import { Book } from '@book/domain/book.entity';

export const BOOK_REPOSITORY_KEY = 'book_repository';

export interface IBookRepository {
  getAll(
    options: IGetAllOptions<Book, BookRelation[]>,
  ): Promise<ICollection<Book>>;
  getOneByIdOrFail(id: number, relations?: BookRelation[]): Promise<Book>;
  getOneById(id: number, relations?: BookRelation[]): Promise<Book>;
  saveOne(book: Book, relations?: BookRelation[]): Promise<Book>;
  updateOneOrFail(
    id: number,
    updates: Partial<Omit<Book, 'id'>>,
    relations?: string[],
  ): Promise<Book>;
  deleteOneOrFail(id: number): Promise<void>;
}
