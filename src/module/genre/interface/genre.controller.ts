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
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';

import { CreateGenreDto } from '@genre/application/dto/create-genre.dto';
import { GenreFilterQueryParamsDto } from '@genre/application/dto/genre-filter-query-params.dto';
import { GenreResponseDto } from '@genre/application/dto/genre-response.dto';
import { GenreSortQueryParamsDto } from '@genre/application/dto/genre-sort-query-params.dto';
import { UpdateGenreDto } from '@genre/application/dto/update-genre.dto';
import { GenreService } from '@genre/application/service/genre.service';
import { Genre } from '@genre/domain/genre.entity';
import { GENRE_ENTITY_NAME } from '@genre/domain/genre.name';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { Policy } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PolicyGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';

@Controller('/genre')
@ControllerEntity(GENRE_ENTITY_NAME)
@UseGuards(PolicyGuard)
@ApiTags('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  @Policy(AppAction.Read, Genre)
  async getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: GenreFilterQueryParamsDto,
    @Query('sort') sort: GenreSortQueryParamsDto,
  ): Promise<ManySerializedResponseDto<GenreResponseDto>> {
    return this.genreService.getAll({
      page,
      filter,
      sort,
    });
  }

  @Get(':id')
  @Policy(AppAction.Read, Genre)
  async getOneByIdOrFail(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<GenreResponseDto>> {
    return this.genreService.getOneByIdOrFail(id);
  }

  @Post()
  @Policy(AppAction.Create, Genre)
  async saveOne(
    @Body() createGenreDto: CreateGenreDto,
  ): Promise<OneSerializedResponseDto<GenreResponseDto>> {
    return this.genreService.saveOne(createGenreDto);
  }

  @Patch(':id')
  @Policy(AppAction.Update, Genre)
  async updateOneOrFail(
    @Param('id') id: number,
    @Body() updateGenreDto: UpdateGenreDto,
  ): Promise<OneSerializedResponseDto<GenreResponseDto>> {
    return this.genreService.updateOne(id, updateGenreDto);
  }

  @Delete(':id')
  @Policy(AppAction.Delete, Genre)
  async deleteOneOrFail(@Param('id') id: number): Promise<void> {
    return this.genreService.deleteOneOrFail(id);
  }
}
