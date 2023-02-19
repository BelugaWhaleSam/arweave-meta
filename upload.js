import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import base58 from "bs58";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

/* *******************************  Polyfill AbortController for node 14 *******************************  */

import { AbortController } from "node-abort-controller";
global.AbortController = AbortController;

/* ******************************** Bundlr configs for devnet ******************************** */

// Connection endpoint, for devnet
const ENDPOINT = clusterApiUrl("devnet");

// Devnet Bundlr address
const BUNDLR_ADDRESS = "https://devnet.bundlr.network";

/* ******************************** Video name and path ******************************** */

const NFT_VIDEO_PATH = "dragon.webm";
const NFT_VID_NAME = "khaleesi.webm";


/* ******************************** Main Function ******************************** */

/* ******************************** Private key from funded wallet ******************************** */
async function main() {
  // Get the shop keypair from the environment variable
  const shopPrivateKey =
    "3rTqFycRK7URNXihwZheXG5i4byaY94fUXE9FdRCZsvjRzR7sGUGhGJsGQc3oV7nkJoHyTcA963qayq2dcvxtdsa"; /* process.env.SHOP_PRIVATE_KEY or funded wallet private key */ 
  if (!shopPrivateKey) throw new Error("SHOP_PRIVATE_KEY not found");
  const shopKeypair = Keypair.fromSecretKey(base58.decode(shopPrivateKey));
  const connection = new Connection(ENDPOINT);

/* ******************************** creating the nft video for upload ******************************** */

  const nfts = Metaplex.make(connection, { cluster: "devnet" })
    .use(keypairIdentity(shopKeypair))
    .use(
      bundlrStorage({
        address: BUNDLR_ADDRESS,
        providerUrl: ENDPOINT,
        timeout: 60000,
      })
    )
    .nfts();

/* ******************************** making file out of video ******************************** */

  const videoBuffer = fs.readFileSync(NFT_VIDEO_PATH);
  const fileVid = toMetaplexFile(videoBuffer, NFT_VID_NAME);

/* ******************************** uploading the using nft function and get url ******************************** */

  const uploadedMetadata = await nfts.uploadMetadata([fileVid]);
  console.log(`Uploaded video: ${uploadedMetadata.metadata}`);
}

/* ******************************** calling the main function and error handling ******************************** */

main()
  .then(() => {
    console.log("Done!");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
