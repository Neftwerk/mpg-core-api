import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

import { CheckoutParamsDto } from '../application/dto/checkoutParams.dto';
import { PaymentIntentoDto } from '../application/dto/paymentIntent.dto';
import {
  IClientSecret,
  IPaymentIntent,
  IRetrieveSession,
  Status,
} from '../application/service/payment-provider.service.interface';
import { PaymentService } from '../application/service/payment.service';

@Auth(AuthType.None)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Auth(AuthType.None)
  @Post('/checkout')
  async createPaymentProviderCheckout(
    @Body() checkoutParams: CheckoutParamsDto,
  ): Promise<IClientSecret> {
    return this.paymentService.createPaymentProviderCheckout(checkoutParams);
  }

  @Get('/checkout/status')
  async paymentProviderCheckoutStatus(
    @Query('session_id') sessionId: string,
  ): Promise<Status> {
    return await this.paymentService.paymentProviderCheckoutStatus(sessionId);
  }

  @Get('/checkout/sessions/:id')
  async retrieveSessions(
    @Param('id') customerId: string,
  ): Promise<IRetrieveSession> {
    return this.paymentService.retrieveSessions(customerId);
  }

  @Post('/payment')
  async createPaymentIntent(
    @Body() paymentIntentDto: PaymentIntentoDto,
  ): Promise<Partial<IPaymentIntent>> {
    return this.paymentService.createPaymentIntent(paymentIntentDto);
  }
}
