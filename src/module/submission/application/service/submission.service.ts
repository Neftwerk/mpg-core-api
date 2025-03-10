import { SubmissionResponseAdapter } from '@module/submission/application/adapter/submission-responser.adapter';
import { SubmitTransactionRequestDto } from '@module/submission/application/dto/submit-transaction-request.dto';
import { SubmitTransactionResponseDto } from '@module/submission/application/dto/submit-transaction-response.dto';
import { SubmitTransactionException } from '@module/submission/application/exception/submit-transaction.exception';
import { ISubmissionService } from '@module/submission/application/interface/submission.service.interface';
import { SUBMISSION_ENTITY_NAME } from '@module/submission/domain/submission.name';
import { Injectable } from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { StellarTransactionAdapter } from '@common/infrastructure/stellar/stellar.transaction.adapter';

@Injectable()
export class SubmissionService implements ISubmissionService {
  constructor(
    private readonly stellarTransactionAdapter: StellarTransactionAdapter,
    private readonly submissionResponseAdapter: SubmissionResponseAdapter,
  ) {}

  async submitTransaction(
    submitTransactionRequestDto: SubmitTransactionRequestDto,
  ): Promise<OneSerializedResponseDto<SubmitTransactionResponseDto>> {
    const { xdr } = submitTransactionRequestDto;

    try {
      const { hash, successful } =
        await this.stellarTransactionAdapter.submitTransaction(xdr);

      return this.submissionResponseAdapter.oneEntityResponseSubmission<SubmitTransactionResponseDto>(
        SUBMISSION_ENTITY_NAME,
        {
          hash,
          successful,
        },
      );
    } catch (error) {
      throw new SubmitTransactionException(error.message);
    }
  }
}
