export interface IMapTransformation {
  fieldName: string;
  transformer: (value: any) => any;
}

export class MapperOption {
  constructor(options?: {
    include?: string[];
    exclude?: string[];
    transforms?: IMapTransformation[];
  }) {
    if (options) {
      if (options.include && options.exclude) {
        throw new Error(
          'Mapper: Include and exclude options are mutually exclusive',
        );
      }
      this._exclude = options.exclude || [];
      this._include = options.include || [];
      this._transforms = options.transforms || [];
    }
  }

  private _exclude: string[] = [];

  get exclude(): string[] {
    return this._exclude;
  }

  private _include: string[] = [];

  get include(): string[] {
    return this._include;
  }

  private _transforms: IMapTransformation[] = [];

  get transforms(): IMapTransformation[] {
    return this._transforms;
  }
}
