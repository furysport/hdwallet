import * as core from "@sudophunk/hdwallet-core";
import * as bech32 from "bech32";
import CryptoJS from "crypto-js";
import * as txBuilder from "tendermint-tx-builder";

import * as Isolation from "./crypto/isolation";
import { NativeHDWalletBase } from "./native";
import * as util from "./util";

export function MixinNativeHighburyWalletInfo<TBase extends core.Constructor<core.HDWalletInfo>>(Base: TBase) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return class MixinNativeHighburyWalletInfo extends Base implements core.HighburyWalletInfo {
    readonly _supportsHighburyInfo = true;

    async highburySupportsNetwork(): Promise<boolean> {
      return true;
    }

    async highburySupportsSecureTransfer(): Promise<boolean> {
      return false;
    }

    highburySupportsNativeShapeShift(): boolean {
      return false;
    }

    highburyGetAccountPaths(msg: core.HighburyGetAccountPaths): Array<core.HighburyAccountPath> {
      const slip44 = core.slip44ByCoin("Fury");
      return [
        {
          addressNList: [0x80000000 + 44, 0x80000000 + slip44, 0x80000000 + msg.accountIdx, 0, 0],
        },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    highburyNextAccountPath(msg: core.HighburyAccountPath): core.HighburyAccountPath | undefined {
      // Only support one account for now (like portis).
      return undefined;
    }
  };
}

export function MixinNativeHighburyWallet<TBase extends core.Constructor<NativeHDWalletBase>>(Base: TBase) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  return class MixinNativeHighburyWallet extends Base {
    readonly _supportsHighbury = true;

    #masterKey: Isolation.Core.BIP32.Node | undefined;

    async highburyInitializeWallet(masterKey: Isolation.Core.BIP32.Node): Promise<void> {
      this.#masterKey = masterKey;
    }

    highburyWipe(): void {
      this.#masterKey = undefined;
    }

    highburyBech32ify(address: ArrayLike<number>, prefix: string): string {
      const words = bech32.toWords(address);
      return bech32.encode(prefix, words);
    }

    createHighburyAddress(publicKey: string) {
      const message = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(publicKey));
      const hash = CryptoJS.RIPEMD160(message as any).toString();
      const address = Buffer.from(hash, `hex`);
      return this.highburyBech32ify(address, `fury`);
    }

    async highburyGetAddress(msg: core.HighburyGetAddress): Promise<string | null> {
      return this.needsMnemonic(!!this.#masterKey, async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const keyPair = await util.getKeyPair(this.#masterKey!, msg.addressNList, "highbury");
        return this.createHighburyAddress(keyPair.publicKey.toString("hex"));
      });
    }

    async highburySignTx(msg: core.HighburySignTx): Promise<core.HighburySignedTx | null> {
      return this.needsMnemonic(!!this.#masterKey, async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const keyPair = await util.getKeyPair(this.#masterKey!, msg.addressNList, "fury");
        // @TODO: This needs to be fixed after the change to tendermint serialization
        const adapter = await Isolation.Adapters.Cosmos.create(keyPair);
        const result = await txBuilder.sign(msg.tx, adapter, msg.sequence, msg.account_number, msg.chain_id);
        return txBuilder.createSignedTx(msg.tx, result);
      });
    }
  };
}
