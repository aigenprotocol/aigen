import Web3 from "web3";
import {PRIVATE_KEY, PROVIDER_URL} from "./config.js";
import ethers from "ethers";
import {getPublicKeyFromPrivateKey} from "./encryption.js";

export const provider = new ethers.providers.JsonRpcProvider({url: PROVIDER_URL});
export const web3 = new Web3(PROVIDER_URL)
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
export let PublicKey = getPublicKeyFromPrivateKey(PRIVATE_KEY)
