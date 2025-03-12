import { SubmitTransactionRequestDto } from '@module/submission/application/dto/submit-transaction-request.dto';
import { SubmitTransactionResponseDto } from '@module/submission/application/dto/submit-transaction-response.dto';
import { ISubmissionService } from '@module/submission/application/interface/submission.service.interface';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';

@Controller('submission')
export class SubmissionController {
  constructor(
    @Inject('SUBMISSION_SERVICE')
    private readonly submissionService: ISubmissionService,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  async submitTransaction(
    @Body() submitTransactionRequestDto: SubmitTransactionRequestDto,
  ): Promise<OneSerializedResponseDto<SubmitTransactionResponseDto>> {
    return await this.submissionService.submitTransaction(
      submitTransactionRequestDto,
    );
  }
}
