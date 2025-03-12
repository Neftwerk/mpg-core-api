import { AccountResponseAdapter } from '@module/account/application/adapter/account-responser.adapter';
import { ResponseSerializerService } from '@module/app/application/service/response-serializer.service';

export class SubmissionResponseAdapter extends AccountResponseAdapter {
  constructor(serializerService: ResponseSerializerService) {
    super(serializerService);
  }
}
