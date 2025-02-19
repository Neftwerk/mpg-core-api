import 'reflect-metadata';

export function EntityName(name: string) {
  return function (constructor: abstract new (...args: any[]) => any) {
    Reflect.defineMetadata('entityName', name, constructor);
  };
}
