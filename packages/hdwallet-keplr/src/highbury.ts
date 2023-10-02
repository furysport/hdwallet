import { StdTx } from "@cosmjs/amino";
import { SignerData } from "@cosmjs/stargate";
import { ChainReference } from "@shapeshiftoss/caip";
import * as core from "@sudophunk/hdwallet-core";
import {
  HighburyAccountPath,
  HighburyGetAccountPaths,
  HighburySignedTx,
  HighburySignTx,
  slip44ByCoin,
} from "@sudophunk/hdwallet-core";
import { sign } from "@shapeshiftoss/proto-tx-builder";

export function highburyDescribePath(path: core.BIP32Path): core.PathDescription {
  const pathStr = core.addressNListToBIP32(path);
  const unknown: core.PathDescription = {
    verbose: pathStr,
    coin: "Fury",
    isKnown: false,
  };

  if (path.length != 5) {
    return unknown;
  }

  if (path[0] != 0x80000000 + 44) {
    return unknown;
  }

  if (path[1] != 0x80000000 + slip44ByCoin("Fury")) {
    return unknown;
  }

  if ((path[2] & 0x80000000) >>> 0 !== 0x80000000) {
    return unknown;
  }

  if (path[3] !== 0 || path[4] !== 0) {
    return unknown;
  }

  const index = path[2] & 0x7fffffff;
  return {
    verbose: `Highbury Account #${index}`,
    accountIdx: index,
    wholeAccount: true,
    coin: "Fury",
    isKnown: true,
    isPrefork: false,
  };
}

export function highburyGetAccountPaths(msg: HighburyGetAccountPaths): Array<HighburyAccountPath> {
  return [
    {
      addressNList: [0x80000000 + 44, 0x80000000 + slip44ByCoin("Fury"), 0x80000000 + msg.accountIdx, 0, 0],
    },
  ];
}

export async function highburyGetAddress(provider: any): Promise<string | undefined> {
  const offlineSigner = provider.getOfflineSigner(ChainReference.HighburyMainnet);
  const highburyAddress = (await offlineSigner?.getAccounts())?.[0]?.address;
  return highburyAddress;
}

export async function highburySignTx(provider: any, msg: HighburySignTx): Promise<HighburySignedTx> {
  const offlineSigner = provider.getOfflineSigner(ChainReference.HighburyMainnet);

  const address = await highburyGetAddress(provider);
  if (!address) throw new Error("failed to get address");

  const signerData: SignerData = {
    sequence: Number(msg.sequence),
    accountNumber: Number(msg.account_number),
    chainId: msg.chain_id,
  };

  return await sign(address, msg.tx as StdTx, offlineSigner, signerData);
}

/**
 * @todo: Add support for sign/verify message see documentation at:
 * https://github.com/chainapsis/keplr-wallet/blob/fbbc0b6d8eb4859a1663988d1bd90f07c9b74708/docs/api/README.md
 */
