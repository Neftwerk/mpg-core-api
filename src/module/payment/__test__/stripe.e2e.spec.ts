import { Test, TestingModule } from '@nestjs/testing';

import { CheckoutParamsDto } from '../application/dto/checkoutParams.dto';
import { PaymentIntentoDto } from '../application/dto/paymentIntent.dto';
import {
  IClientSecret,
  IPaymentIntent,
  IRetrieveSession,
  Status,
} from '../application/service/payment-provider.service.interface';
import { PaymentService } from '../application/service/payment.service';
import { PaymentController } from '../interface/payment.controller';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPaymentProviderCheckout: jest.fn(),
            paymentProviderCheckoutStatus: jest.fn(),
            retrieveSessions: jest.fn(),
            createPaymentIntent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call createPaymentProviderCheckout and return the client secret', async () => {
    const checkoutParams: CheckoutParamsDto = {
      customerId: 'customer_id',
      paymentParams: [{ name: 'product', price: 5000 }],
    };
    const expectedClientSecret: IClientSecret = { clientSecret: 'secret' };

    jest
      .spyOn(paymentService, 'createPaymentProviderCheckout')
      .mockResolvedValue(expectedClientSecret);

    const result =
      await controller.createPaymentProviderCheckout(checkoutParams);

    expect(paymentService.createPaymentProviderCheckout).toHaveBeenCalledWith(
      checkoutParams,
    );
    expect(result).toEqual(expectedClientSecret);
  });

  it('should call paymentProviderCheckoutStatus and return the status', async () => {
    const sessionId = 'session_123';
    const expectedStatus: Status.Complete = Status.Complete;

    jest
      .spyOn(paymentService, 'paymentProviderCheckoutStatus')
      .mockResolvedValue(expectedStatus);

    const result = await controller.paymentProviderCheckoutStatus(sessionId);

    expect(paymentService.paymentProviderCheckoutStatus).toHaveBeenCalledWith(
      sessionId,
    );
    expect(result).toEqual(expectedStatus);
  });

  it('should call retrieveSessions and return the session data', async () => {
    const customerId = 'customer_123';
    const expectedSession: IRetrieveSession = {
      object: 'checkout.session',
      has_more: false,
      url: 'https://api.stripe.com/v1/checkout/sessions',
      data: [
        {
          id: 'session_123',
          object: 'checkout.session',
          amount_subtotal: 1000,
          amount_total: 1000,
          currency: 'usd',
          client_secret: 'secret',
          mode: 'payment',
        },
      ],
    };

    jest
      .spyOn(paymentService, 'retrieveSessions')
      .mockResolvedValue(expectedSession);

    const result = await controller.retrieveSessions(customerId);

    expect(paymentService.retrieveSessions).toHaveBeenCalledWith(customerId);
    expect(result).toEqual(expectedSession);
  });

  it('should call createPaymentIntent and return the payment intent', async () => {
    const paymentIntentDto: PaymentIntentoDto = {
      customerId: 'customer_123',
      paymentMethodId: 'pm_123',
      paymentAmount: 100,
    };
    const expectedPaymentIntent: Partial<IPaymentIntent> = {
      client: 'intent_secret',
      status: 'succeeded',
    };

    jest
      .spyOn(paymentService, 'createPaymentIntent')
      .mockResolvedValue(expectedPaymentIntent);

    const result = await controller.createPaymentIntent(paymentIntentDto);

    expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
      paymentIntentDto,
    );
    expect(result).toEqual(expectedPaymentIntent);
  });
});
