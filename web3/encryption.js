import crypto from "crypto";
import {encrypt, getEncryptionPublicKey} from "@metamask/eth-sig-util";
import {bufferToHex, toBuffer} from "ethereumjs-util";
import {PRIVATE_KEY} from "./config.js";
import {decrypt} from "eth-sig-util";

export function generateKey() {
    //return crypto.pbkdf2Sync('my password', crypto.randomBytes(16), 100000, 256/8, 'sha256');
    return crypto.randomBytes(32);
}

export function generateInitVector() {
    return crypto.randomBytes(16);
}

export function encryptDataRSA(data, key) {
    const encryptedKey = crypto.publicEncrypt(
        {
            key: key,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(data)
    );

    console.log("Encrypted key:", encryptedKey.toString("base64"))
    return encryptedKey;
}

export function encryptDataAES(data, key, iv) {
    //console.log(key)
    // the cipher function
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    // encrypt the message, input encoding, output encoding
    let encryptedData = cipher.update(data, "utf-8", "hex");

    encryptedData += cipher.final("hex");

    //console.log("Encrypted data: " + encryptedData);

    return encryptedData
}

export function decryptDataAES(data, key, iv) {
    // the decipher function
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decryptedData = decipher.update(data, "hex", "utf-8");

    decryptedData += decipher.final("utf8");

    //console.log("Decrypted data:", decryptedData);

    return decryptedData
}

export function encryptDataEth(data, key) {
    return bufferToHex(
        Buffer.from(
            JSON.stringify(
                encrypt(
                    {data: data, publicKey: key, version: 'x25519-xsalsa20-poly1305'},
                )
            ),
            'utf8'
        )
    );
}

export function decryptDataEth(data, key) {
    return decrypt(JSON.parse(toBuffer(data).toString()), key)
}

export function getPublicKeyFromPrivateKey() {
    return getEncryptionPublicKey(PRIVATE_KEY)
}
