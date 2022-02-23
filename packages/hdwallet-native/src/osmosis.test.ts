import * as core from "@shapeshiftoss/hdwallet-core";

import * as native from "./native";

const MNEMONIC = "all all all all all all all all all all all all";

const mswMock = require("mswMock")().startServer();
afterEach(() => expect(mswMock).not.toHaveBeenCalled());

const untouchable = require("untouchableMock");

describe("NativeOsmosisWalletInfo", () => {
  const info = native.info();

  it("should return some static metadata", async () => {
    expect(await untouchable.call(info, "osmosisSupportsNetwork")).toBe(true);
    expect(await untouchable.call(info, "osmosisSupportsSecureTransfer")).toBe(false);
    expect(untouchable.call(info, "osmosisSupportsNativeShapeShift")).toBe(false);
  });

  it("should return the correct account paths", async () => {
    const paths = info.osmosisGetAccountPaths({ accountIdx: 0 });
    expect(paths).toMatchObject([{ addressNList: core.bip32ToAddressNList("m/44'/118'/0'/0/0") }]);
  });

  it("does not support getting the next account path", async () => {
    expect(untouchable.call(info, "osmosisNextAccountPath", {})).toBe(undefined);
  });
});

describe("NativeOsmosisWallet", () => {
  let wallet: native.NativeHDWallet;

  beforeEach(async () => {
    wallet = native.create({ deviceId: "native" });
    await wallet.loadDevice({ mnemonic: MNEMONIC });
    expect(await wallet.initialize()).toBe(true);
  });

  it("should generate a correct osmosis address", async () => {
    expect(
      await wallet.osmosisGetAddress({ addressNList: core.bip32ToAddressNList("m/44'/118'/0'/0/0") })
    ).toBe("osmo1knuunh0lmwyrkjmrj7sky49uxk3peyzh2tlskm");
  });

  it("should generate another correct osmosis address", async () => {
    expect(
      await wallet.osmosisGetAddress({ addressNList: core.bip32ToAddressNList("m/44'/118'/1337'/123/4") })
    ).toBe("osmo14k4dnrrmxdch6nkvvuugsywrgmvlwrqs2f6kye");
  });

  it.skip("should sign a transaction correctly", async () => {
    const signed = await wallet.osmosisSignTx({
      addressNList: core.bip32ToAddressNList("m/44'/118'/0'/0/0"),
      tx: {
        msg: [{
          "type": "cosmos-sdk/MsgSend",
          "value": {
            "from_address": "osmo15cenya0tr7nm3tz2wn3h3zwkht2rxrq7g9ypmq",
            "to_address": "osmo1qjwdyn56ecagk8rjf7crrzwcyz6775cj07qz9r",
            "amount": [
              {
                "denom": "uosmo",
                "amount": "1000"
              }
            ]
          }
        }],
        fee: {
          amount: [{ denom: "uosmo", amount: "2800" }],
          gas: "baz",
        },
        signatures: null,
        memo: "foobar",
      },
      chain_id: "osmosishub-4",
      account_number: "95421",
      sequence: "35",
    });
    await expect(signed?.signatures?.length).toBe(1);
    await expect(signed?.signatures?.[0].pub_key?.value).toMatchInlineSnapshot(
      `"AuGwbxSqxtP4HsVyUqrWiAZfb7Ur+gKYcAQ+Ru8mIBxQ"`
    );
    await expect(signed?.signatures?.[0]).toMatchInlineSnapshot(
      `"dK12yPvgiRwtXzfss9F4BWMBHbNazdp0KgdKlMOVBLpbcBEagczPLHQnqXhB+t+bP8osVA3OdwUldGodmTYgBg=="`
    );
  });
});
