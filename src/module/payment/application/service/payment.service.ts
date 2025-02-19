import { Inject, Injectable } from '@nestjs/common';

import { CheckoutParamsDto } from '../dto/checkoutParams.dto';
import { PaymentIntentoDto } from '../dto/paymentIntent.dto';
import {
  IClientSecret,
  IPaymentIntent,
  IPaymentServiceProvider,
  IRetrieveSession,
  PAYMENT_SERVICE_KEY,
  Status,
} from './payment-provider.service.interface';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_SERVICE_KEY)
    private readonly paymentServiceProvider: IPaymentServiceProvider,
  ) {}

  async createPaymentProviderCustomer(email: string): Promise<string> {
    return this.paymentServiceProvider.createCustomer(email);
  }

  async createPaymentProviderCheckout(
    checkoutParams: CheckoutParamsDto,
  ): Promise<IClientSecret> {
    return this.paymentServiceProvider.createCheckoutSession(checkoutParams);
  }

  async paymentProviderCheckoutStatus(sessionId: string): Promise<Status> {
    return this.paymentServiceProvider.checkoutStatus(sessionId);
  }

  async retrieveSessions(customerId: string): Promise<IRetrieveSession> {
    return this.paymentServiceProvider.retrieveSessions(customerId);
  }

  async createPaymentIntent(
    paymentIntentDto: PaymentIntentoDto,
  ): Promise<Partial<IPaymentIntent>> {
    return this.paymentServiceProvider.createPaymentIntent({
      ...paymentIntentDto,
    });
  }
}
