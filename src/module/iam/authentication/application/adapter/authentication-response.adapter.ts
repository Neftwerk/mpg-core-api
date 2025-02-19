import { BaseResponseAdapter } from '@common/base/application/adapter/base-response.adapter';

import { ResponseSerializerService } from '@/module/app/application/service/response-serializer.service';

export class AuthenticationResponseAdapter extends BaseResponseAdapter {
  constructor(serializerService: ResponseSerializerService) {
    super(serializerService);
  }
  public oneEntityResponseAuth<ResponseDto extends object>(
    entityName: string,
    resource: ResponseDto,
    relationshipsKeys: string[] = [],
  ) {
    const serializerService = this.getSerializerService();
    const options = serializerService.createSerializationOptions(
      resource,
      relationshipsKeys,
    );

    const serializedResource = serializerService.serialize(
      entityName,
      { id: '', ...resource },
      options,
    );
    serializerService.addSelfLink(serializedResource);
    if (!relationshipsKeys.length) return serializedResource;

    const { relationships } = serializerService.getRelationshipsFromArray(
      resource,
      relationshipsKeys,
      entityName,
      false,
    );

    const { included } = serializerService.getIncludedData(
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
}
