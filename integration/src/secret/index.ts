import * as core from "@sudophunk/hdwallet-core";

import { secretTests as tests } from "./secret";

export function secretTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo }): void {
  tests(get);
}
