import solc from "solc";
import {fileURLToPath} from "url";
import path from "path";
import fs from 'fs'
import fsExtra from "fs-extra";

function createInput(tokenName, tokenTicker) {
    const currentTokenName = 'AINFTToken.sol'
    const currentTokenTicker = "AINFT"
    const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const inboxPath = path.resolve(__dirname, 'contracts', currentTokenName); //current working directory
    let source = fs.readFileSync(inboxPath, 'utf8').replaceAll(currentTokenName, tokenName).replaceAll(currentTokenTicker, tokenTicker); //read raw source file
    let sources = {}
    sources[tokenName+".sol"] = {content: source}

    return {
        language: 'Solidity',
        sources: sources, settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
}

function findImports(relativePath) {
    //my imported sources are stored under the node_modules folder!
    const __dirname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const absolutePath = path.resolve(__dirname, 'node_modules', relativePath);
    const source = fs.readFileSync(absolutePath, 'utf8');
    return {contents: source};
}

export default function compileAINFTTokenContract(tokenName, tokenTicker) {
    console.log("Compiling AINFTToken smart contract...")

    const input = createInput(tokenName, tokenTicker)
    const buildPath = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "build");
    const contractsPath = path.resolve(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "contracts");

    // Removes folder build and every file in it
    fsExtra.removeSync(buildPath);

    let output = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports})).contracts;

    // list all smart contracts
    // for (const contractName in output[tokenName+'.sol']) {
    //     console.log(contractName + ': ' + output[tokenName+'.sol'][contractName].evm.bytecode.object);
    // }

    fsExtra.ensureDirSync(buildPath);
    const filePath = path.join(buildPath, tokenName + ".json")

    // Output contains all objects from all contracts
    // Write the contents of each to different files
    for (let contract in output) {
        //console.log(contract)
        fsExtra.outputJsonSync(
            filePath,
            output[contract]
        );
    }

    console.log('Contract compiled successfully!')
    return filePath
}

const contractPath = compileAINFTTokenContract("PLTToken", "PLT")
console.log("Contract compiled and stored at location:", contractPath)