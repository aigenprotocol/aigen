import {NFTStorage} from "nft.storage";
import {NFTSTORAGE_TOKEN} from "./config.js";

export const client = new NFTStorage({ token: NFTSTORAGE_TOKEN })
