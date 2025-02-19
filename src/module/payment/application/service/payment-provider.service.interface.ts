import { PaymentIntentoDto } from '../dto/paymentIntent.dto';

export const PAYMENT_SERVICE_KEY = 'PAYMENT_SERVICE_PROVIDER';

export interface IPaymentParams {
  name: string;
  price: number;
}

export interface ICheckoutParams {
  customerId: string;
  paymentParams: IPaymentParams[];
}

export interface IClientSecret {
  clientSecret: string;
}

export enum Status {
  Complete = 'complete',
  Expired = 'expired',
  Open = 'open',
}

interface ISession {
  id: string;
  object: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  client_secret: string;
  mode: string;
}

export interface IRetrieveSession {
  object: string;
  data: ISession[];
  has_more: boolean;
  url: string;
}

export interface IPaymentIntent {
  client: string;
  status: string;
  error: string;
}

export interface IPaymentServiceProvider {
  createCustomer(email: string): Promise<string>;
  createCheckoutSession(
    checkoutParams: ICheckoutParams,
  ): Promise<IClientSecret>;
  checkoutStatus(sessionId: string): Promise<Status>;
  retrieveSessions(customerId: string): Promise<IRetrieveSession>;
  createPaymentIntent({
    customerId,
    paymentMethodId,
    paymentAmount,
  }: PaymentIntentoDto): Promise<Partial<IPaymentIntent>>;
}
