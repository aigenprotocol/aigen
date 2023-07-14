import fs_promises from "fs/promises";
import path from "path";
import {
    decryptDataAES,
    decryptDataEth,
    encryptDataAES,
    encryptDataEth,
    generateInitVector,
    generateKey
} from "./encryption.js";
import {client} from "./nftstorage_client.js";
import {PublicKey} from "./web3_obj.js";
import {Blob} from "nft.storage";
import fs from "fs";
import https from "https";
import {PRIVATE_KEY} from "./config.js";
import {addHexPrefix, toBuffer} from "ethereumjs-util";
import fs1 from "fs";
import axios from "axios";

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

export async function downloadFileFromNFTStorage(url, filePath) {
    const file = fs.createWriteStream(filePath);
    https.get(url, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    });
}

export async function downloadAndDecryptContent(url, download_dir) {
    try {
        console.log("Downloading...")
        let response = await axios.get(url)
        if (response.status === 200) {
            const metadata = await response.data;

            console.log("Metadata downloaded")
            // store metadata
            fs1.writeFileSync(path.join(download_dir, "metadata_" + metadata.name), JSON.stringify(metadata))

            console.log("\nDecrypting keys...")
            // decrypt content keys
            let decryptedKeys = JSON.parse(decryptDataEth(metadata.keys, PRIVATE_KEY))
            console.log("Keys decrypted")

            try {
                console.log("\nDownload content...")
                // download the content from NFTStorage
                let response1 = await axios.get("https://" + metadata.cid + ".ipfs.nftstorage.link")
                if (response1.status === 200) {
                    console.log("Content downloaded")
                    let content = await response1.data

                    console.log("\nDecrypting content...")
                    // decrypt content
                    let decryptedContent = decryptDataAES(content, toBuffer(addHexPrefix(decryptedKeys.key)),
                        toBuffer(addHexPrefix(decryptedKeys.iv)))
                    console.log("Content decrypted")

                    // store actual content
                    fs1.writeFileSync(path.join(download_dir, metadata.name), decryptedContent)
                    console.log("Content stored successfully! ", path.join(download_dir, metadata.name))
                }else{
                    console.log(response1)
                }
            } catch (error) {
                console.log(error)
            }
        }else{
            console.log(response)
        }
    } catch (error) {
        console.log(error);
    }
}