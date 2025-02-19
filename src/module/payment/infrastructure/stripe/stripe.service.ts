import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { CheckoutParamsDto } from '@/module/payment/application/dto/checkoutParams.dto';
import { PaymentIntentoDto } from '@/module/payment/application/dto/paymentIntent.dto';
import { CheckoutParams } from '@/module/payment/application/service/checkoutParams';
import {
  IClientSecret,
  IPaymentIntent,
  IPaymentServiceProvider,
  IRetrieveSession,
  Status,
} from '@/module/payment/application/service/payment-provider.service.interface';

@Injectable()
export class StripeService implements IPaymentServiceProvider {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: '2024-06-20',
    });
  }

  async createCustomer(email: string): Promise<string> {
    const { id } = await this.stripe.customers.create({ email });
    return id;
  }

  async retrieveSessions(customerId: string): Promise<IRetrieveSession> {
    return this.stripe.checkout.sessions.list({ customer: customerId });
  }

  async createCheckoutSession({
    customerId,
    paymentParams,
  }: CheckoutParamsDto): Promise<IClientSecret> {
    const frontUrl = this.configService.get('front.url');
    const returnUrl = this.configService.get('front.payment_return_url');
    const params = new CheckoutParams(customerId, paymentParams);
    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: params.mapPaymentDetails(),
      customer: customerId,
      mode: 'payment',
      return_url: `${frontUrl}${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    });
    return {
      clientSecret: session.client_secret,
    };
  }

  async checkoutStatus(sessionId: string): Promise<Status> {
    const { status } = await this.stripe.checkout.sessions.retrieve(sessionId);
    return status as Status;
  }

  async createPaymentIntent({
    customerId,
    paymentMethodId,
    paymentAmount,
  }: PaymentIntentoDto): Promise<Partial<IPaymentIntent>> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        confirm: true,
        amount: paymentAmount * 100,
        currency: 'usd',
        payment_method: paymentMethodId,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });
      return {
        client: intent.client_secret,
        status: intent.status,
      };
    } catch (e) {
      switch (e.type) {
        case 'StripeCardError':
          return { error: `A payment error occurred: ${e.raw.message}` };

        case 'StripeInvalidRequestError':
          console.error('error message', e.raw.message);
          return {
            error: 'An invalid request occurred. Please try again later',
          };

        case 'StripeConnectionError':
          console.error('error message', e.raw.message);
          return {
            error:
              'There was a network problem between you server and the payment service',
            status: e.raw.paymentIntent.status,
          };

        default:
          console.error('error message', e.raw.message);
          return {
            error: 'An internal problem ocurred. Please try again later',
          };
      }
    }
  }
}
