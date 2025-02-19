import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { IGenreRepository } from '@genre/application/repository/genre.repository.interface';
import { Genre } from '@genre/domain/genre.entity';
import { GenreNotFoundException } from '@genre/infrastructure/database/exception/genre-not-found.exception';
import { GenreSchema } from '@genre/infrastructure/database/genre.schema';

export class GenreMysqlRepository implements IGenreRepository {
  constructor(
    @InjectRepository(GenreSchema)
    private readonly repository: Repository<Genre>,
  ) {}

  async getAll(options?: IGetAllOptions<Genre>): Promise<ICollection<Genre>> {
    const { filter, page, sort } = options || {};

    const [items, itemCount] = await this.repository.findAndCount({
      where: filter,
      order: sort,
      take: page.size,
      skip: page.offset,
    });

    return {
      data: items,
      pageNumber: page.number,
      pageSize: page.size,
      pageCount: Math.ceil(itemCount / page.size),
      itemCount,
    };
  }

  async getOneByIdOrFail(id: number): Promise<Genre> {
    const genre = await this.repository.findOne({
      where: { id },
    });

    if (!genre) {
      throw new GenreNotFoundException({
        message: `Genre with ID ${id} not found`,
      });
    }

    return genre;
  }

  async getOneById(id: number): Promise<Genre> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async saveOne(genre: Genre): Promise<Genre> {
    return this.repository.save(genre);
  }

  async updateOneOrFail(
    id: number,
    updates: Partial<Omit<Genre, 'id'>>,
    relations: string[] = [],
  ): Promise<Genre> {
    const genreToUpdate = await this.repository.preload({
      ...updates,
      id,
    });

    if (!genreToUpdate) {
      throw new GenreNotFoundException({
        message: `Genre with ID ${id} not found`,
      });
    }

    const saveGenre = await this.repository.save(genreToUpdate);

    return this.repository.findOne({ where: { id: saveGenre.id }, relations });
  }

  async deleteOneOrFail(id: number): Promise<void> {
    const genreToDelete = await this.repository.findOne({ where: { id } });

    if (!genreToDelete) {
      throw new GenreNotFoundException({
        message: `Genre with ID ${id} not found`,
      });
    }

    await this.repository.softDelete(id);
  }
}
