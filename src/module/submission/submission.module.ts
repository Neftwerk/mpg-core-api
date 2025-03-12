import { SubmissionResponseAdapter } from '@module/submission/application/adapter/submission-responser.adapter';
import { Module, Provider } from '@nestjs/common';

import { AccessTokenGuard } from '@iam/authentication/infrastructure/guard/access-token.guard';

import { CommonModule } from '@/common/common.module';
import { StellarModule } from '@/common/infrastructure/stellar/stellar.module';

import { SubmissionService } from './application/service/submission.service';
import { SubmissionController } from './controllers/submission.controller';
import { SUBMISSION_SERVICE } from './domain/submission-service.constant';

const submissionServiceProvider: Provider = {
  provide: SUBMISSION_SERVICE,
  useClass: SubmissionService,
};

@Module({
  imports: [CommonModule, StellarModule],
  controllers: [SubmissionController],
  providers: [
    submissionServiceProvider,
    SubmissionResponseAdapter,
    AccessTokenGuard,
  ],
  exports: [submissionServiceProvider],
})
export class SubmissionModule {}
