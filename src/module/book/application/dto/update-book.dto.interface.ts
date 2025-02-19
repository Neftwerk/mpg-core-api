import { CreateBookDto } from '@book/application/dto/create-book.dto';

export interface IUpdateBookDto extends Partial<CreateBookDto> {}
