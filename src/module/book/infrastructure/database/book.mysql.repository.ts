import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { BookRelation } from '@book/application/enum/book-relations.enum';
import { IBookRepository } from '@book/application/repository/book.repository.interface';
import { Book } from '@book/domain/book.entity';
import { BookSchema } from '@book/infrastructure/database/book.schema';
import { BookNotFoundException } from '@book/infrastructure/database/exception/book-not-found.exception';

export class BookMysqlRepository implements IBookRepository {
  constructor(
    @InjectRepository(BookSchema)
    private readonly repository: Repository<Book>,
  ) {}

  async getAll(
    options?: IGetAllOptions<Book, Partial<BookRelation[]>>,
  ): Promise<ICollection<Book>> {
    const { filter, page, sort, fields, include } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter,
      order: sort,
      select: fields,
      take: page.size,
      skip: page.offset,
      relations: include,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByIdOrFail(
    id: number,
    relations: BookRelation[] = [],
  ): Promise<Book> {
    const book = await this.repository.findOne({
      where: { id },
      relations,
    });

    if (!book) {
      throw new BookNotFoundException({
        message: `Book with ID ${id} not found`,
      });
    }

    return book;
  }

  async getOneById(id: number, relations: BookRelation[] = []): Promise<Book> {
    return this.repository.findOne({
      where: { id },
      relations,
    });
  }

  async saveOne(book: Book, relations: BookRelation[] = []): Promise<Book> {
    const savedBook = await this.repository.save(book);

    return this.repository.findOne({
      where: { id: savedBook.id },
      relations,
    });
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<Book, 'id'>>,
    relations: BookRelation[] = [],
  ): Promise<Book> {
    const bookToUpdate = await this.repository.preload({
      ...updates,
      id,
    });

    if (!bookToUpdate) {
      throw new BookNotFoundException({
        message: `Book with ID ${id} not found`,
      });
    }
    const savedBook = await this.repository.save(bookToUpdate);

    return this.repository.findOne({ where: { id: savedBook.id }, relations });
  }

  async deleteOneOrFail(id: number): Promise<void> {
    const bookToDelete = await this.repository.findOne({ where: { id } });

    if (!bookToDelete) {
      throw new BookNotFoundException({
        message: `Book with ID ${id} not found`,
      });
    }

    await this.repository.softDelete(id);
  }
}
