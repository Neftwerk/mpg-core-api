import { ICreateGenreDto } from '@genre/application/dto/create-genre.dto.interface';

export interface IUpdateGenreDto extends Partial<ICreateGenreDto> {}
