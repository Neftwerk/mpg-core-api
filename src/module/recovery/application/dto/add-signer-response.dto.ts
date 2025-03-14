import { Signer } from '@module/recovery/domain/signer.entity';

export class AddSignerResponseDto {
  signers: Omit<Signer, 'id' | 'user'>[];
}
