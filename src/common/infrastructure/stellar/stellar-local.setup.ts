import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';
import axios from 'axios';

const sourceAccount = {
  public: 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI',
  secret: 'SC5O7VZUXDJ6JBDSZ74DSERXL7W3Y5LTOAMRF7RQRL3TAGAPS7LUVG3L',
};

export const createAccount = async () => {
  const account = Keypair.random();

  const publicKey = account.publicKey();

  await axios.get(`http://localhost:8000/friendbot?addr=${publicKey}`);

  return account;
};

export const generateXdr = async () => {
  const account = Keypair.fromSecret(sourceAccount.secret);
  const server = new Horizon.Server('http://localhost:8000', {
    allowHttp: true,
  });

  const accountInfo = await server.loadAccount(account.publicKey());

  const transaction = new TransactionBuilder(accountInfo, {
    fee: BASE_FEE,
    networkPassphrase: process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.bumpSequence({
        bumpTo: accountInfo.sequence + 1,
      }),
    )
    .setTimeout(30)
    .build();

  transaction.sign(account);

  return transaction.toXDR();
};

export const getSignatureFromTransaction = async (
  address: Keypair,
): Promise<{ transaction: string; signature: string }> => {
  const server = new Horizon.Server('http://localhost:8000', {
    allowHttp: true,
  });

  const account = await server.loadAccount(address.publicKey());

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: address.publicKey(),
        asset: Asset.native(),
        amount: '10',
        source: address.publicKey(),
      }),
    )
    .setTimeout(30)
    .build();

  transaction.sign(address);

  return {
    transaction: transaction.toXDR(),
    signature: transaction.signatures[0].signature().toString('base64'),
  };
};

export const setAccountSigners = async (
  address: Keypair,
  signers: { publicKey: string; weight: number }[],
) => {
  const server = new Horizon.Server('http://localhost:8000', {
    allowHttp: true,
  });

  const account = await server.loadAccount(address.publicKey());

  const signersOperations = signers.map((signer) =>
    Operation.setOptions({
      signer: {
        weight: signer.weight,
        ed25519PublicKey: signer.publicKey,
      },
    }),
  );
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE,
  })
    .addOperation(signersOperations[0])
    .addOperation(signersOperations[1])
    .addOperation(signersOperations[2])
    .setTimeout(30)
    .build();
  transaction.sign(address);

  return await server.submitTransaction(transaction);
};
