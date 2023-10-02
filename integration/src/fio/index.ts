import * as core from "@sudophunk/hdwallet-core";

import { fioTests as tests } from "./fio";

export function fioTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo; wallet2: core.HDWallet }): void {
  tests(get);
}
