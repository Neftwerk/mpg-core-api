import { SortType } from '@common/base/application/enum/sort-type.enum';
import { Base } from '@common/base/domain/base.entity';

// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// https://bigfont.ca/what-does-keyof-t-do-at-the-end-of-a-type-declaration/
// https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
type OnlyAttributes<Entity> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Entity]: Entity[P] extends Base[] | Base | Function ? never : P;
}[keyof Entity];

export type PageOptions = {
  number?: number;
  size?: number;
  offset?: number;
};

export type FilterOptions<Entity> = Partial<{
  [P in OnlyAttributes<Entity>]?: Entity[P];
}>;

export type SortOptions<Entity> = Partial<{
  [P in OnlyAttributes<Entity>]: SortType;
}>;

export type FieldOptions<Entity> = OnlyAttributes<Entity>[];

export interface IGetAllOptions<Entity extends object, Relations = []> {
  page?: PageOptions;
  filter?: FilterOptions<Entity>;
  sort?: SortOptions<Entity>;
  fields?: FieldOptions<Entity>;
  include?: Relations;
}
