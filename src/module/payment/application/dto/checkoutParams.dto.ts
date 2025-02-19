import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

class PaymentsParamsDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}

export class CheckoutParamsDto {
  @IsString()
  customerId: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentsParamsDto)
  paymentParams: PaymentsParamsDto[];
}
