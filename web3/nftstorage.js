import fs_promises from "fs/promises";
import path from "path";
import {encryptDataAES, encryptDataEth, generateInitVector, generateKey} from "./encryption.js";
import {client} from "./nftstorage_client.js";
import {PublicKey} from "./web3_obj.js";
import {Blob} from "nft.storage";

export async function deployFilesToNFTStorage(dirPath) {
    let fileNames = await fs_promises.readdir(dirPath);
    let all_metadata = [];

    for (const fileName of fileNames) {
        console.log("\nProcessing:", fileName)

        console.log("Deploying file to NFTStorage")
        let content = await fs_promises.readFile(path.join(dirPath, fileName))

        // generate key for this file
        let contentPrivateKey = generateKey()
        let contentInitVector = generateInitVector()

        // encrypt content
        console.log("\nEncrypting content...")
        let encryptedContent = encryptDataAES(content.toString(), contentPrivateKey, contentInitVector)
        //console.log("Content encrypted using:", contentPrivateKey.toString('hex'))
        console.log("Content encrypted successfully!")

        let contentKeys = {
            key: contentPrivateKey.toString("hex"),
            iv: contentInitVector.toString("hex")
        }

        // encrypt keys
        console.log("\nEncrypting content keys...")
        let encryptedKeys = encryptDataEth(JSON.stringify(contentKeys), PublicKey)
        console.log("Content keys encrypted successfully!")

        console.log("\nUploading data to NFTStorage...")
        const result = await client.storeBlob(new Blob([encryptedContent]))
        console.log("Data uploaded successfully!")

        console.log("\nUploading metadata to NFTStorage...")
        let result1 = await client.storeBlob(new Blob([JSON.stringify({
            name: fileName, cid: result.toString(),
            keys: encryptedKeys
        })]))
        console.log("Metadata uploaded successfully!")

        let final_metadata = {
            fileName: fileName,
            dataCid: result.toString(),
            format: "json",
            metadataCid: result1.toString()
        }
        all_metadata.push(final_metadata)
    }

    return all_metadata;
}