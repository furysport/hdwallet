import * as core from "@sudophunk/hdwallet-core";

import { highburyTests as tests } from "./highbury";

export function highburyTests(get: () => { wallet: core.HDWallet; info: core.HDWalletInfo }): void {
  tests(get);
}
