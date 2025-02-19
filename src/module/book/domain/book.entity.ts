import { Base } from '@common/base/domain/base.entity';

import { Genre } from '@genre/domain/genre.entity';

export class Book extends Base {
  title: string;
  description?: string;
  genreId?: number;
  genre?: Genre;
}
