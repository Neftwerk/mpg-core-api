import { ResponseSerializerService } from '@module/app/application/service/response-serializer.service';

import { BaseResponseAdapter } from '@common/base/application/adapter/base-response.adapter';

export class AccountResponseAdapter extends BaseResponseAdapter {
  constructor(serializerService: ResponseSerializerService) {
    super(serializerService);
  }
  public oneEntityResponseStellar<ResponseDto extends object>(
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
      },
    };
  }
}
