/// <reference types="bip32/types/crypto" />

export * from "../../core/bip39";
import * as BIP39 from "../../core/bip39";

import * as bip32crypto from "bip32/src/crypto";
import { TextEncoder } from "web-encoding";

import { safeBufferFrom } from "../../types";
import * as BIP32 from "./bip32";

// Poor man's single-block PBKDF2 implementation
//TODO: get something better
function pbkdf2_sha512_singleblock(
    password: string,
    salt: Uint8Array,
    iterations: number
): Uint8Array & { length: 64 } {
    function be32Buf(index: number): Buffer {
    const indexBE = Buffer.alloc(4);
    indexBE.writeUInt32BE(index);
    return indexBE;
    }

    const pwBuffer = safeBufferFrom(new TextEncoder().encode(password));

    let out = bip32crypto.hmacSHA512(pwBuffer, Buffer.concat([salt, be32Buf(1)])) as Buffer & { length: 64 };
    let lastU = out;
    for (let i = 2; i <= iterations; i++) {
    let newU = bip32crypto.hmacSHA512(pwBuffer, lastU) as Buffer & { length: 64 };
    for (let j = 0; j < out.length; j++) out[j] ^= newU[j];
    lastU = newU;
    }

    return out;
}

export class Mnemonic implements BIP39.MnemonicInterface {
    readonly #mnemonic: string;
    constructor(mnemonic: string) {
        this.#mnemonic = mnemonic.normalize("NFKD");
    }
    toSeed(passphrase?: string): BIP32.Seed {
        if (passphrase !== undefined && typeof passphrase !== "string") throw new Error("bad passphrase type");

        const mnemonic = this.#mnemonic;
        const salt = new TextEncoder().encode(`mnemonic${passphrase ?? ""}`.normalize("NFKD"));

        return new BIP32.Seed(pbkdf2_sha512_singleblock(mnemonic, salt, 2048));
    }
}
