import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { CheckoutParamsDto } from '@/module/payment/application/dto/checkoutParams.dto';
import { PaymentIntentoDto } from '@/module/payment/application/dto/paymentIntent.dto';

import { StripeService } from '../infrastructure/stripe/stripe.service';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'customer_id' }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ client_secret: 'secret' }),
        retrieve: jest.fn().mockResolvedValue({ status: 'complete' }),
        list: jest.fn().mockResolvedValue({ data: [{ id: 'session_id' }] }),
      },
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        client_secret: 'intent_secret',
        status: 'succeeded',
      }),
    },
  }));
});

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const configMap = {
                'stripe.secretKey': 'fake-secret-key',
                'front.url': 'http://localhost:3000',
                'front.payment_return_url': '/payment/success',
              };
              return configMap[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a customer', async () => {
    const result = await service.createCustomer('test@example.com');
    expect(result).toEqual('customer_id');
  });

  it('should retrieve checkout sessions', async () => {
    const result = await service.retrieveSessions('customer_id');
    expect(result).toEqual({ data: [{ id: 'session_id' }] });
  });

  it('should create a checkout session', async () => {
    const checkoutParamsDto: CheckoutParamsDto = {
      customerId: 'customer_id',
      paymentParams: [{ name: 'product 1', price: 5000 }],
    };

    const result = await service.createCheckoutSession(checkoutParamsDto);
    expect(result).toEqual({ clientSecret: 'secret' });
  });

  it('should handle payment intent creation', async () => {
    const paymentIntentDto: PaymentIntentoDto = {
      customerId: 'customer_id',
      paymentMethodId: 'pm_123',
      paymentAmount: 100,
    };

    const result = await service.createPaymentIntent(paymentIntentDto);
    expect(result).toEqual({
      client: 'intent_secret',
      status: 'succeeded',
    });
  });

  it('should retrieve the status of a checkout session', async () => {
    const sessionId = 'session_id';
    const result = await service.checkoutStatus(sessionId);

    expect(result).toEqual('complete');
  });
});
