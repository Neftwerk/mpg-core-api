import { AddSignerResponseDto } from '@module/recovery/application/dto/add-signer-response.dto';
import { Signer } from '@module/recovery/domain/signer.entity';

export class SignerResponseMapper {
  toSignerResponse(signers: Signer[]): AddSignerResponseDto {
    return {
      signers: signers.map((signer) => ({
        domain: signer.domain,
        publicKey: signer.publicKey,
      })),
    };
  }
}
