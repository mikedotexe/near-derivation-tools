import { Common } from "@ethereumjs/common";
import { FeeMarketEIP1559Transaction } from "@ethereumjs/tx";
import { Account, Connection, Contract } from "@near-js/accounts";
import { KeyPair } from "@near-js/crypto";
import { InMemoryKeyStore } from "@near-js/keystores";
import { ethers } from "ethers";
import { parseSeedPhrase } from 'near-seed-phrase';
import { deriveChildPublicKey, najPublicKeyStrToUncompressedHexPoint } from "./getter";
import { Address, publicToAddress } from "ethereumjs-util";
import {INFURA_API_KEY, NEAR_NETWORK, NEAR_SEED_PHRASE} from "./index";

const testnetAccountId = "test-mchain-e2e.testnet";
const multichainContract = "multichain-testnet-2.testnet";
const derivationPath = "test";
const ethReceiverAddress = "0x47bF16C0e80aacFf796E621AdFacbFaaf73a94A4";
const providerUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

const canRederiveEthAddress = async () => {
  const nearConnection = await getNearConnection();
  const testnetAccount = new Account(nearConnection, testnetAccountId);
  const multichainContractAcc = new Contract(
    testnetAccount,
    multichainContract,
    {
      changeMethods: ['sign'],
      viewMethods: ['public_key'],
      useLocalViewExecution: false
    }
  ) as Contract & { public_key: () => Promise<string>; sign: (args) => Promise<[string, string]> };

  const rootPublicKey = await multichainContractAcc.public_key();
  const publicKey = await deriveChildPublicKey(najPublicKeyStrToUncompressedHexPoint(rootPublicKey), testnetAccountId, derivationPath);

  const derivedEthAddress = new Address(publicToAddress(Buffer.from(publicKey.substring(2), 'hex'))).toString();

  const common = new Common({ chain: 'sepolia' });
  const provider = new ethers.JsonRpcProvider(
    providerUrl
  );
  const feeData = await provider.getFeeData();
  const txData = {
    to: ethReceiverAddress,
    value: ethers.parseUnits('0.0111', 'ether'),
    chainId: common.chainId(),
    gasLimit: 21000,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas,
    nonce: await provider.getTransactionCount(derivedEthAddress),
  };
  const ethTransaction = FeeMarketEIP1559Transaction.fromTxData(txData, {
    common
  });

  const [R, s] = await multichainContractAcc.sign({
    args: {
      payload: Array.from(new Uint8Array(ethTransaction.getHashedMessageToSign().slice().reverse())),
      path: derivationPath
    },
    gas: '300000000000000'
  });
  const r = Buffer.from(R.substring(2), 'hex');

  const rederivedEthAdresses = [0, 1].map(v => ethTransaction.addSignature(BigInt(v), r, Buffer.from(s, 'hex')).getSenderAddress().toString());
  const rederivedEthAddress = rederivedEthAdresses.find(address => address === derivedEthAddress);

  if (rederivedEthAddress) {
    console.log('Eth address rederived successfully: ' + rederivedEthAddress);
    return true;
  }
  console.log('Eth address rederivation failed');
  return false;
}


const getNearConnection = async () => {
  const keyStore = new InMemoryKeyStore();
  await keyStore.setKey(
    NEAR_NETWORK,
    testnetAccountId,
    KeyPair.fromString(parseSeedPhrase(NEAR_SEED_PHRASE).secretKey)
  );
  return Connection.fromConfig({
    networkId: 'testnet',
    provider: { type: 'JsonRpcProvider', args: { url: "https://rpc.testnet.near.org" } },
    signer: { type: 'InMemorySigner', keyStore },
  });
}

canRederiveEthAddress().then(console.log);
