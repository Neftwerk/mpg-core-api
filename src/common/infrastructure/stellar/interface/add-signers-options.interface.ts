export interface IAddSignerOptions {
  signer: {
    weight: number;
    ed25519PublicKey: string;
  };
  masterWeight?: number;
}
