import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Book } from '@book/domain/book.entity';

export const BookSchema = new EntitySchema<Book>({
  name: 'Book',
  target: Book,
  tableName: 'book',
  columns: withBaseSchemaColumns({
    title: {
      type: String,
    },
    description: {
      type: String,
      nullable: true,
    },
    genreId: {
      name: 'genre_id',
      type: Number,
      nullable: true,
    },
  }),
  relations: {
    genre: {
      type: 'many-to-one',
      target: 'Genre',
      joinColumn: {
        name: 'genre_id',
      },
    },
  },
});
