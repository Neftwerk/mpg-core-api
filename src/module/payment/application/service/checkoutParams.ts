import { IPaymentParams } from './payment-provider.service.interface';

export class CheckoutParams {
  customerId: string;
  paymentParams: IPaymentParams[];

  constructor(customerId: string, paymentParams: IPaymentParams[]) {
    this.customerId = customerId;
    this.paymentParams = paymentParams;
  }

  mapPaymentDetails(): IPaymentDetails[] {
    return this.paymentParams.map((paymentDetail) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: paymentDetail.name,
          },
          unit_amount: paymentDetail.price * 100,
        },
        quantity: 1,
      };
    });
  }
}

interface IPaymentDetails {
  price_data: IPriceData;
  quantity: number;
}

interface IPriceData {
  currency: string;
  product_data: IProductName;
  unit_amount: number;
}

interface IProductName {
  name: string;
}
