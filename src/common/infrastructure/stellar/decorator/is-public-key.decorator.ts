import { StrKey } from '@stellar/stellar-sdk';
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsStellarPublicKeyConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    return typeof value === 'string' && StrKey.isValidEd25519PublicKey(value);
  }

  defaultMessage() {
    return 'Invalid Stellar public key';
  }
}

export function IsStellarPublicKey(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStellarPublicKeyConstraint,
    });
  };
}
