import { EntitySchema } from 'typeorm';

import { withBaseSchemaColumns } from '@common/base/infrastructure/database/base.schema';

import { Genre } from '@genre/domain/genre.entity';

export const GenreSchema = new EntitySchema<Genre>({
  name: 'Genre',
  target: Genre,
  tableName: 'genre',
  columns: withBaseSchemaColumns({
    name: {
      type: String,
    },
  }),
});
