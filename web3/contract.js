import {wallet} from "./web3_obj.js";
import {AINFT_CONTRACT_ADDRESS} from "./config.js";
import {readFile} from 'fs/promises';
import {ethers} from "ethers";

const abi = JSON.parse(
    await readFile(
        new URL('./ainft_abi.json', import.meta.url)
    )
);

export const contract = new ethers.Contract(AINFT_CONTRACT_ADDRESS, abi, wallet);