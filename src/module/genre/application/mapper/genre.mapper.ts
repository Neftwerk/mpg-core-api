import { ICreateGenreDto } from '@genre/application/dto/create-genre.dto.interface';
import { GenreResponseDto } from '@genre/application/dto/genre-response.dto';
import { UpdateGenreDto } from '@genre/application/dto/update-genre.dto';
import { Genre } from '@genre/domain/genre.entity';

export class GenreMapper {
  private mapDtoToGenre(genreDto: ICreateGenreDto | UpdateGenreDto): Genre {
    const genre = new Genre();
    genre.name = genreDto.name;
    return genre;
  }

  fromCreateGenreDtoToGenre(genreDto: ICreateGenreDto): Genre {
    return this.mapDtoToGenre(genreDto);
  }

  fromUpdateGenreDtoToGenre(genreDto: UpdateGenreDto): Genre {
    return this.mapDtoToGenre(genreDto);
  }

  fromGenretoGenreResponseDto(genre: Genre): GenreResponseDto {
    const genreResponseDto = new GenreResponseDto();
    genreResponseDto.id = genre.id?.toString();
    genreResponseDto.uuid = genre.uuid;
    genreResponseDto.name = genre.name;
    genreResponseDto.createdAt = genre.createdAt;
    genreResponseDto.updatedAt = genre.updatedAt;
    genreResponseDto.deletedAt = genre.deletedAt;
    return genreResponseDto;
  }
}
