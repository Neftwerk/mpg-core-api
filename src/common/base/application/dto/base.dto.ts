import 'reflect-metadata';

import { IDto } from '@common/base/application/dto/dto.interface';

export function DtoProperty<T extends object>(target: T, propertyKey: string) {
  const DTO_PROPERTIES_KEY = `${target.constructor.name}_PROPERTIES`;
  const properties: string[] =
    Reflect.getMetadata(DTO_PROPERTIES_KEY, target.constructor) || [];
  properties.push(propertyKey);
  Reflect.defineMetadata(DTO_PROPERTIES_KEY, properties, target.constructor);
}

export function getDtoProperties<T extends object>(
  target: new () => T,
): string[] {
  const DTO_PROPERTIES_KEY = `${target.name}_PROPERTIES`;
  return Reflect.getMetadata(DTO_PROPERTIES_KEY, target) || [];
}

export abstract class BaseDto implements IDto {}
