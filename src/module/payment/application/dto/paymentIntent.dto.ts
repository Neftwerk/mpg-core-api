import { IsNumber, IsString } from 'class-validator';

export class PaymentIntentoDto {
  @IsString()
  customerId: string;
  @IsString()
  paymentMethodId: string;
  @IsNumber()
  paymentAmount: number;
}
