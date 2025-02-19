import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponseDto } from '@common/base/application/dto/one-relation-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';

import { BookFieldsQueryParamsDto } from '@book/application/dto/book-fields-query-params.dto';
import { BookFilterQueryParamsDto } from '@book/application/dto/book-filter-query-params.dto';
import { BookIncludeQueryParamsDto } from '@book/application/dto/book-include-query-params.dto';
import { BookResponseDto } from '@book/application/dto/book-response.dto';
import { BookSortQueryParamsDto } from '@book/application/dto/book-sort-query-params.dto';
import { CreateBookDto } from '@book/application/dto/create-book.dto';
import { UpdateBookDto } from '@book/application/dto/update-book.dto';
import { BookRelation } from '@book/application/enum/book-relations.enum';
import { CreateBookPolicyHandler } from '@book/application/policy/create-book-policy.handler';
import { DeleteBookPolicyHandler } from '@book/application/policy/delete-book-policy.handler';
import { ReadBookPolicyHandler } from '@book/application/policy/read-book-policy.handler';
import { UpdateBookPolicyHandler } from '@book/application/policy/update-book-policy.handler';
import { BookService } from '@book/application/service/book.service';
import { BOOK_ENTITY_NAME } from '@book/domain/book.name';

import { Policies } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PolicyGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';

@Controller('/book')
@ControllerEntity(BOOK_ENTITY_NAME)
@UseGuards(PolicyGuard)
@ApiTags('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @Policies(ReadBookPolicyHandler)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: BookFilterQueryParamsDto,
    @Query('fields') fields: BookFieldsQueryParamsDto,
    @Query('sort') sort: BookSortQueryParamsDto,
    @Query('include') include: BookIncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<BookResponseDto>> {
    return this.bookService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.target,
    });
  }

  @Get(':id')
  @Policies(ReadBookPolicyHandler)
  async getOneByIdOrFail(
    @Param('id') id: number,
    @Query('include') { target }: BookIncludeQueryParamsDto,
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    return this.bookService.getOneByIdOrFail(id, target);
  }

  @Post()
  @Policies(CreateBookPolicyHandler)
  async saveOne(
    @Body() createBookDto: CreateBookDto,
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    return this.bookService.saveOne(createBookDto);
  }

  @Patch(':id')
  @Policies(UpdateBookPolicyHandler)
  async updateOneOrFail(
    @Param('id') id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<OneSerializedResponseDto<BookResponseDto>> {
    return this.bookService.updateOneOrFail(id, updateBookDto);
  }

  @Delete(':id')
  @Policies(DeleteBookPolicyHandler)
  async deleteOneOrFail(@Param('id') id: number): Promise<void> {
    return this.bookService.deleteOneOrFail(id);
  }

  @Get('/:id/relationships/:name')
  @Policies(ReadBookPolicyHandler)
  async getOneRelation(
    @Param('id') id: number,
    @Param('name') relationName: BookRelation | undefined,
  ): Promise<OneRelationResponseDto> {
    return this.bookService.getOneRelation(id, relationName);
  }
}
