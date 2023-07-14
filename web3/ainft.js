import {createAINFT} from "./create_ainft.js"
import {downloadAINFTs} from "./download_ainfts.js"

let action = process.env.npm_config_action
let model_name = process.env.npm_config_model_name
let model_dir = process.env.npm_config_model_dir

if (action === "createAINFT") {
    createAINFT(model_name, model_dir).then(status => {
        if (status) {
            console.log("All AINFTs created successfully!!!")
        }
    })
} else if (action === "downloadAINFT") {
    downloadAINFTs(model_name, model_dir)
} else {
    console.log("Invalid action!")
}
