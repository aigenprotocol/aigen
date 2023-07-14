import fs from "fs/promises";
import fs1 from "fs";
import path from "path";
import {downloadAndDecryptContent} from "./nftstorage.js";

export function downloadAINFTs(model_name, model_dir) {
    let download_dir = path.join(model_dir, "downloaded_shards")
    let metadata_file = path.join(model_dir, model_name + "_metadata.json")
    fs.readFile(metadata_file).then(content => {
        let finalMetadata = JSON.parse(content.toString())

        for (const metadata of finalMetadata) {
            console.log("AINFT:", metadata)
            if (!fs1.existsSync(download_dir)) {
                fs1.mkdirSync(download_dir);
            }

            downloadAndDecryptContent("https://" + metadata.metadataCid + ".ipfs.nftstorage.link", download_dir).then(()=>{
            })
        }
    })
}
