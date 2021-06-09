import * as core from "@shapeshiftoss/hdwallet-core";

import { BTCScriptType } from "./bitcoin";
import { getNetwork } from "./networks";
import * as Isolation from "./crypto/isolation";

function isSeed(x: any): x is Isolation.BIP32.SeedInterface {
  return "toMasterKey" in x && typeof x.toMasterKey === "function"
}

function getKeyPair(
  nodeOrSeed: Isolation.BIP32.SeedInterface | Isolation.BIP32.NodeInterface,
  addressNList: number[],
  coin: core.Coin,
  scriptType?: BTCScriptType,
): Isolation.Adapters.BIP32 {
  const node = (isSeed(nodeOrSeed) ? nodeOrSeed.toMasterKey() : nodeOrSeed);
  const network = getNetwork(coin, scriptType);
  const wallet = new Isolation.Adapters.BIP32(node, network);
  const path = core.addressNListToBIP32(addressNList);
  return wallet.derivePath(path);
}

// Prevent malicious JavaScript from replacing the method
export default Object.freeze({
  getKeyPair,
});
