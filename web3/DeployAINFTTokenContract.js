import {provider} from "./web3_obj.js";
import ethers from "ethers";
import {PRIVATE_KEY} from "./config.js";
import fs from "fs";

export default function deployAINFTTokenContract(tokenName, filePath, func) {
    console.log("Deplying AINFTToken smart contract...")
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        let contract = JSON.parse(data)[tokenName]

        // Get the bytecode and ABI
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;

        // Create wallet
        let wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        // Create contract instance with signer
        const ainfttoken = new ethers.ContractFactory(abi, bytecode, wallet);

        console.log(`Attempting to deploy from account: ${wallet.address}`);

        // 8. Send tx (initial value set to 5) and wait for receipt
        const deployedContract = await ainfttoken.deploy();
        const txReceipt = await deployedContract.deployTransaction.wait();

        func(txReceipt.contractAddress, filePath)
    });
}

deployAINFTTokenContract("PLTToken", "./build/PLTToken.json", function (address) {
    console.log(`Contract deployed at address: ${address}`);
})
