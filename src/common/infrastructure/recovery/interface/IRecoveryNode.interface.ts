import { IRegisteredAccountResponse } from '@module/recovery/application/interface/IRegisteredAccountResponse.interface';

export interface IRecoveryNode {
  getSep10Challenge(publicKey: string): Promise<string>;
  getSep10Token(transaction: string): Promise<string>;
  registerAccount(
    account: string,
    token: string,
    email: string,
  ): Promise<IRegisteredAccountResponse>;
  sendExternalAuthCode(address: string, value: string): Promise<void>;
  authenticateWithExternalAuthCode(
    address: string,
    value: string,
    code: string,
  ): Promise<string>;
  getNodeDomain(): Promise<string>;
  generateSignature(
    address: string,
    signingAddress: string,
    transaction: string,
    token: string,
  ): Promise<string>;
}
