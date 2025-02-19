import { Injectable } from '@nestjs/common';
import 'reflect-metadata';

import { CollectionDto } from '@common/base/application/dto/collection.dto';
import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponse } from '@common/base/application/dto/one-relation-response.interface.dto';

import { ResponseSerializerService } from '@/module/app/application/service/response-serializer.service';

@Injectable()
export abstract class BaseResponseAdapter {
  constructor(private readonly serializerService: ResponseSerializerService) {}

  protected getSerializerService(): ResponseSerializerService {
    return this.serializerService;
  }

  /* istanbul ignore next */
  private getEntityNameFromDto(dto: object): string {
    const constructor = dto.constructor;
    const entityName = Reflect.getMetadata('entityName', constructor);
    if (!entityName) {
      throw new Error(`Entity name not found for DTO: ${constructor.name}`);
    }
    return entityName;
  }

  public oneEntityResponse<ResponseDto extends object>(
    resource: ResponseDto,
    relationshipsKeys: string[] = [],
  ) {
    const entityName = this.getEntityNameFromDto(resource);
    const options = this.serializerService.createSerializationOptions(
      resource,
      relationshipsKeys,
    );

    const serializedResource = this.serializerService.serialize(
      entityName,
      { id: '', ...resource },
      options,
    );
    this.serializerService.addSelfLink(serializedResource);
    /* istanbul ignore next */
    if (!relationshipsKeys.length) return serializedResource;

    const { relationships } = this.serializerService.getRelationshipsFromArray(
      resource,
      relationshipsKeys,
      entityName,
      false,
    );

    const { included } = this.serializerService.getIncludedData(
      resource,
      relationshipsKeys,
      entityName,
    );

    return {
      ...serializedResource,
      included,
      data: {
        ...serializedResource.data,
        relationships,
      },
    };
  }

  public manyEntitiesResponse<ResponseDto extends object>(
    collection: CollectionDto<ResponseDto>,
    relationshipKeys: string[] = [],
  ): ManySerializedResponseDto<ResponseDto> {
    const { data, ...paginationData } = collection;

    if (data.length === 0) {
      const { links } = this.serializerService.getManyEntitiesLinks(collection);
      return {
        data: [],
        meta: paginationData,
        links: {
          ...links,
          related: null,
        },
        included: [],
      };
    }

    const resource = data[0];
    const entityName = this.getEntityNameFromDto(resource);
    const options = this.serializerService.createSerializationOptions(
      resource,
      relationshipKeys,
    );

    const serializedResources = this.serializerService.serialize(
      entityName,
      data,
      options,
    );

    for (let i = 0; i < data.length; i++) {
      if (!relationshipKeys.length) break;
      const currentResource = data[i];
      const currentSerializedResource = serializedResources.data[i];
      const { relationships } =
        this.serializerService.getRelationshipsFromArray(
          currentResource,
          relationshipKeys,
          entityName,
          true,
        );

      serializedResources.data[i] = {
        ...currentSerializedResource,
        relationships,
      };
    }
    const includedResourcesList = [];

    for (const currentResource of data) {
      if (!relationshipKeys.length) break;

      const { included: includedResources } =
        this.serializerService.getIncludedData(
          currentResource,
          relationshipKeys,
          entityName,
        );

      includedResourcesList.push(...includedResources);
    }

    const links = this.serializerService.getManyEntitiesLinks(collection);

    const includedWithoutDuplicates = includedResourcesList.reduce(
      (acc, item) => {
        const { id, type } = item;
        const isAlreadyAdded = acc.find(
          (resource) => resource.id === id && resource.type === type,
        );
        if (!isAlreadyAdded) acc.push(item);
        return acc;
      },
      [],
    );

    return {
      ...serializedResources,
      ...links,
      meta: paginationData,
      included: includedWithoutDuplicates,
    };
  }

  /* istanbul ignore next */
  public oneRelationshipsResponse<
    ResponseDto extends object,
    Relation extends string,
  >(
    response: ResponseDto | ResponseDto[],
    relationName: Relation,
    id: string | undefined,
  ): OneRelationResponse {
    const isNotArray = !Array.isArray(response);

    const serializedResponse = isNotArray
      ? this.serializerService.serialize(relationName, response)
      : response.map((item) =>
          this.serializerService.serialize(relationName, item),
        );

    const serializedData = isNotArray
      ? [serializedResponse.data]
      : serializedResponse.map(({ data }) => data);

    const links = this.serializerService.getLinkForOneRelationship(
      relationName,
      id,
    );

    return {
      data: serializedData,
      links,
    };
  }
}
