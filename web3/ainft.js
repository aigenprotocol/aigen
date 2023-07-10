import path from "path";
import {createAINFT} from "./create_ainft.js"
import {downloadAINFT} from "./download_ainft.js"

let action = process.env.npm_config_action
let model_name = process.env.npm_config_model_name
let model_dir = process.env.npm_config_model_dir
let download_dir = path.join(model_dir, "downloaded_shards")

if (action === "createAINFT") {
    createAINFT(model_name, model_dir).then(status => {
        if (status) {
            console.log("All AINFTs created successfully!!!")
        }
    })
} else if (action === "downloadAINFT") {
    downloadAINFT(model_name + "_metadata.json", download_dir).then(r => {
        console.log(r)
        console.log("AINFTs downloaded")
    })
} else {
    console.log("Invalid action!")
}
