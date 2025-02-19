import { BookRelation } from '@book/application/enum/book-relations.enum';
import { Book } from '@book/domain/book.entity';

export type BookRelationResponse<R extends BookRelation> = Book[R];
