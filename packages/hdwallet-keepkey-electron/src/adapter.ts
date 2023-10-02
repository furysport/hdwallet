import * as keepkey from "@sudophunk/hdwallet-keepkey";

import { AdapterDelegateProxy } from "./proxies";

export const Adapter = keepkey.Adapter.fromDelegate(AdapterDelegateProxy);
