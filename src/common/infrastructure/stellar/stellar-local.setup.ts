import {
  Asset,
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
    fee: '100',
    networkPassphrase: process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: account.publicKey(),
        amount: '1',
        asset: Asset.native(),
        source: account.publicKey(),
      }),
    )
    .setTimeout(30)
    .build();

  transaction.sign(account);

  return transaction.toXDR();
};
