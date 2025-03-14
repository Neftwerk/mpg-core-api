import { AccountResponseAdapter } from '@module/account/application/adapter/account-responser.adapter';
import { ResponseSerializerService } from '@module/app/application/service/response-serializer.service';

export class RecoveryResponseAdapter extends AccountResponseAdapter {
  constructor(serializerService: ResponseSerializerService) {
    super(serializerService);
  }
}
