import { EthereumBlock } from "@subql/types-ethereum";
import { CollectiveData } from "../types";

import { ZERO_BD } from "../utils";
import { handleAccount } from "./entities/accountData";
import { handleNewPriceMinute } from "./pricefeed/savePrices";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  const priceData = await handleNewPriceMinute({ block });

  logger.info(`PRICE DATA FOUND ::  ${priceData?.nativePrice}`);
  logger.info(`BLOCK ::: ${block.number}`);
  const transactions = block.transactions;
  const accountsToSave = [];
  for (let index = 0; index < transactions.length; index++) {
    const txn = transactions[index];

    if (txn.type === "0x3") {
      const acc = await handleAccount(txn, priceData!, {
        height: block.number,
        timestamp: Number(block.timestamp) * 1000,
      });
      accountsToSave.push(acc);
      let hashes: string[] = [];

      if (txn.blobVersionedHashes) {
        for (let index = 0; index < txn.blobVersionedHashes.length; index++) {
          const blobHashRaw = txn.blobVersionedHashes[index];
          const blobHash = blobHashRaw;
          hashes.push(blobHash);
        }
      }

      if (txn.receipt !== null && txn.maxFeePerBlobGas! !== null) {
        const blobGasPrice = txn.maxFeePerBlobGas;
        logger.info(
          `${block.number} :: ${index} BLOB TXN GGAS:: ${blobGasPrice}  TOTAL BLOBS ::: ${txn.blobVersionedHashes}`
        );
      }

      // handleBlobTransaction(txn, block);
      // handleCollectiveDataOtherTxn(txn, block);
      // const hashes = txn.blobVersionedHashes.map((v: Uint8Array) => {
      //   return Bytes.fromUint8Array(v).toHexString();
      // });
    } else {
      // handleBlobBlockRegular(txn, block);
      // handleCollectiveDataOtherTxn(txn, block);
    }
  }
  await store.bulkUpdate("AccountEntity", accountsToSave);
}
