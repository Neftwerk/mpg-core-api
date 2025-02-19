import { InferSubjects } from '@casl/ability';

import { Book } from '@book/domain/book.entity';

import { Genre } from '@genre/domain/genre.entity';

import { Admin } from '@iam/admin/domain/admin.entity';
import { User } from '@iam/user/domain/user.entity';

export type AppSubjects =
  | InferSubjects<typeof User | typeof Admin | typeof Book | typeof Genre>
  | 'all';
