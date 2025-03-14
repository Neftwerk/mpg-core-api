import { IIdentity } from '@module/recovery/application/interface/identity.interface';
import { ISigners } from '@module/recovery/application/interface/signers.interface';

export interface IRegisteredAccountResponse {
  address: string;
  identities: Partial<IIdentity>[];
  signers: ISigners[];
}
