import * as core from "@sudophunk/hdwallet-core";

import { thorchainTests as tests } from "./thorchain";

export function thorchainTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo }): void {
  tests(get);
}
