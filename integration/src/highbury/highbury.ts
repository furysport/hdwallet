import * as core from "@sudophunk/hdwallet-core";

import tx_unsigned from "./tx01.mainnet.highbury.json";
import tx_signed from "./tx01.mainnet.highbury.signed.json";

const MNEMONIC12_NOPIN_NOPASSPHRASE = "alcohol woman abuse must during monitor noble actual mixed trade anger aisle";

const TIMEOUT = 60 * 1000;

/**
 *  Main integration suite for testing HighburyWallet implementations' Highbury support.
 */
export function highburyTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo }): void {
  let wallet: core.HighburyWallet & core.HDWallet;

  describe("Highbury", () => {
    beforeAll(async () => {
      const { wallet: w } = get();
      if (core.supportsHighbury(w)) wallet = w;
    });

    beforeEach(async () => {
      if (!wallet) return;
      await wallet.wipe();
      await wallet.loadDevice({
        mnemonic: MNEMONIC12_NOPIN_NOPASSPHRASE,
        label: "test",
        skipChecksum: true,
      });
    }, TIMEOUT);

    test(
      "highburyGetAccountPaths()",
      () => {
        if (!wallet) return;
        const paths = wallet.highburyGetAccountPaths({ accountIdx: 0 });
        expect(paths.length > 0).toBe(true);
        expect(paths[0].addressNList[0] > 0x80000000).toBe(true);
      },
      TIMEOUT
    );

    test(
      "describePath() highbury",
      async () => {
        if (!wallet) return;
        expect(
          wallet.describePath({
            path: core.bip32ToAddressNList("m/44'/459'/0'/0/0"),
            coin: "Highbury",
          })
        ).toMatchInlineSnapshot(`
          Object {
            "accountIdx": 0,
            "coin": "Highbury",
            "isKnown": true,
            "isPrefork": false,
            "verbose": "Highbury Account #0",
            "wholeAccount": true,
          }
        `);
      },
      TIMEOUT
    );

    test(
      "highburyGetAddress()",
      async () => {
        if (!wallet) return;
        expect(
          await wallet.highburyGetAddress({
            addressNList: core.bip32ToAddressNList("m/44'/459'/0'/0/0"),
            showDisplay: false,
            testnet: true,
          })
        ).toEqual("highbury1l4ylj687wmm7d0mk2l29pf9y4k3f09v5zzl0tx");
      },
      TIMEOUT
    );

    test(
      "highburySignTx()",
      async () => {
        if (!wallet) return;
        const input: core.HighburySignTx = {
          tx: tx_unsigned as any,
          addressNList: core.bip32ToAddressNList("m/44'/459'/0'/0/0"),
          chain_id: "highbury",
          account_number: "223646",
          sequence: "2",
        };

        const res = await wallet.highburySignTx(input);
        switch (wallet.getVendor()) {
          case "KeepKey":
            //not supported yet
            //expect(res?.signatures?.[0].signature).toEqual(tx_signed.signatures[0].signature_keepkey);
            break;
          default:
            // eslint-disable-next-line jest/no-conditional-expect
            expect(res?.signatures?.[0].signature).toEqual(tx_signed.signatures[0].signature);
            break;
        }
      },
      TIMEOUT
    );
  });
}
