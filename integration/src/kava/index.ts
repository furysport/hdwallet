import * as core from "@sudophunk/hdwallet-core";

import { kavaTests as tests } from "./kava";

export function kavaTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo }): void {
  tests(get);
}
