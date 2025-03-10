import { SubmitTransactionRequestDto } from '@module/submission/application/dto/submit-transaction-request.dto';
import { SubmitTransactionResponseDto } from '@module/submission/application/dto/submit-transaction-response.dto';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

export interface ISubmissionService {
  submitTransaction(
    submitTransactionRequestDto: SubmitTransactionRequestDto,
  ): Promise<OneSerializedResponseDto<SubmitTransactionResponseDto>>;
}
