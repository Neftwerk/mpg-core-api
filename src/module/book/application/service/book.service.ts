import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponse } from '@common/base/application/dto/one-relation-response.interface.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { BookResponseAdapter } from '@book/application/adapter/book-response.adapter';
import { BookResponseDto } from '@book/application/dto/book-response.dto';
import { ICreateBookDto } from '@book/application/dto/create-book.dto.interface';
import { IUpdateBookDto } from '@book/application/dto/update-book.dto.interface';
import { BookRelation } from '@book/application/enum/book-relations.enum';
import { BookMapper } from '@book/application/mapper/book.mapper';
import {
  BOOK_REPOSITORY_KEY,
  IBookRepository,
} from '@book/application/repository/book.repository.interface';
import { Book } from '@book/domain/book.entity';
import { BookNotFoundException } from '@book/infrastructure/database/exception/book-not-found.exception';

@Injectable()
export class BookService {
  constructor(
    @Inject(BOOK_REPOSITORY_KEY)
    private readonly bookRepository: IBookRepository,
    private readonly bookMapper: BookMapper,
    private readonly bookResponseAdapter: BookResponseAdapter,
  ) {}

  async getAll(
    options: IGetAllOptions<Book, BookRelation[]>,
  ): Promise<ManySerializedResponseDto<BookResponseDto>> {
    const { fields, include } = options || {};

    if (include && fields && !fields.includes('id')) fields.push('id');

    const collection = await this.bookRepository.getAll(options);

    const collectionDto = new CollectionDto({
      ...collection,
      data: collection.data.map((book: Book) =>
        this.bookMapper.fromBookToBookResponseDto(book),
      ),
    });

    return this.bookResponseAdapter.manyEntitiesResponse<BookResponseDto>(
      collectionDto,
      options.include,
    );
  }

  async getOneByIdOrFail(
    id: number,
    relations: BookRelation[] = [],
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    const book = await this.bookRepository.getOneByIdOrFail(id, relations);
    return this.bookResponseAdapter.oneEntityResponse<BookResponseDto>(
      this.bookMapper.fromBookToBookResponseDto(book),
      relations,
    );
  }

  async saveOne(
    createBookDto: ICreateBookDto,
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    const book = await this.bookRepository.saveOne(
      this.bookMapper.fromCreateBookDtoToBook(createBookDto),
      [BookRelation.GENRE],
    );

    return this.bookResponseAdapter.oneEntityResponse<BookResponseDto>(
      this.bookMapper.fromBookToBookResponseDto(book),
      [BookRelation.GENRE],
    );
  }

  async updateOneOrFail(
    id: number,
    updateBookDto: IUpdateBookDto,
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    const book = await this.bookRepository.updateOneOrFail(
      id,
      this.bookMapper.fromUpdateBookDtoToBook(updateBookDto),
      [BookRelation.GENRE],
    );
    return this.bookResponseAdapter.oneEntityResponse<BookResponseDto>(
      this.bookMapper.fromBookToBookResponseDto(book),
      [BookRelation.GENRE],
    );
  }

  async deleteOneOrFail(id: number): Promise<void> {
    return this.bookRepository.deleteOneOrFail(id);
  }

  async getOneRelation(
    id: number,
    relationName: BookRelation,
  ): Promise<OneRelationResponse> {
    const bookRelationsList = Object.values(BookRelation);

    if (!bookRelationsList.includes(relationName)) {
      throw new BadRequestException(
        `Invalid relation name: ${relationName}, expected one of ${bookRelationsList}`,
      );
    }

    const book = await this.bookRepository.getOneById(id, [relationName]);

    if (!book) {
      throw new BookNotFoundException({
        message: `Book with ID ${id} not found`,
      });
    }
    const relationData = book[relationName];

    return this.bookResponseAdapter.oneRelationshipsResponse(
      relationData,
      relationName,
      relationData?.id?.toString(),
    );
  }
}
