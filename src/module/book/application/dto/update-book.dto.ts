import { PartialType } from '@nestjs/swagger';

import { CreateBookDto } from '@book/application/dto/create-book.dto';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
