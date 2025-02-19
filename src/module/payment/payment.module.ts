import { Module } from '@nestjs/common';

import { UserModule } from '@iam/user/user.module';

import { PaymentService } from '@/module/payment/application/service/payment.service';
import { StripeService } from '@/module/payment/infrastructure/stripe/stripe.service';
import { PaymentController } from '@/module/payment/interface/payment.controller';

import { PAYMENT_SERVICE_KEY } from './application/service/payment-provider.service.interface';

@Module({
  imports: [UserModule],
  providers: [
    PaymentService,
    { provide: PAYMENT_SERVICE_KEY, useClass: StripeService },
  ],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
