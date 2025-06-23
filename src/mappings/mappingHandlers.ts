import { EthereumBlock } from "@subql/types-ethereum";
import { BlobData, CollectiveData, TransactionData } from "../types";

import { BYTES_PER_BLOB, ZERO_BD } from "../utils";
import {
  handleAccount,
  handleAccountDayData,
  handleAccountHourData,
} from "./entities/accountData";
import { handleNewPriceMinute } from "./pricefeed/savePrices";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  const priceData = await handleNewPriceMinute({ block });

  logger.info(`PRICE DATA FOUND ::  ${priceData?.nativePrice}`);
  logger.info(`BLOCK ::: ${block.number}`);
  const transactions = block.transactions;
  const accountsToSave = [];
  const accountDayDatas = [];
  const accountHourDatas = [];
  const blobs: BlobData[] = [];
  let txnRecords: TransactionData[] = [];

  for (let index = 0; index < transactions.length; index++) {
    const txn = transactions[index];
    const dataSubmissionSize =
      (txn.blobVersionedHashes?.length || 0) * BYTES_PER_BLOB;
    const fees = Number(txn.gas) * Number(txn.gasPrice);
    const feesUSD = fees * priceData!.nativePrice;

    const feesDA =
      Number(txn.maxFeePerBlobGas) *
      Number(txn.blobVersionedHashes?.length) *
      BYTES_PER_BLOB;
    const feesUSDDA = feesDA * priceData!.nativePrice;

    const transactionToSave = TransactionData.create({
      id: txn.hash,
      amount: Number(txn.value),
      denomination: "ETH",
      hash: txn.hash,
      isBlobTransaction: txn.type === "0x3" ? true : false,
      nDataSubs: txn?.blobVersionedHashes?.length || 0,
      nEvents: txn?.logs?.length || 0,
      nMessages: 0,
      timestamp: Number(block.timestamp) * 1000,
      totalBytes: dataSubmissionSize,
      txFeeNative: fees,
      blockHeightId: block.number.toString(),
      signerId: txn.from,
      lastPriceFeedId: priceData!.id,
    });
    txnRecords.push(transactionToSave);

    const acc = await handleAccount(txn, priceData!, {
      height: block.number,
      timestamp: Number(block.timestamp) * 1000,
    });
    accountsToSave.push(acc);

    const accDayData = await handleAccountDayData(txn, priceData!, {
      height: block.number,
      timestamp: Number(block.timestamp) * 1000,
    });
    accountDayDatas.push(accDayData);

    const accHourData = await handleAccountHourData(txn, priceData!, {
      height: block.number,
      timestamp: Number(block.timestamp) * 1000,
    });
    accountHourDatas.push(accHourData);

    let hashes: string[] = [];

    if (txn.blobVersionedHashes) {
      for (let index = 0; index < txn.blobVersionedHashes.length; index++) {
        const blobHashRaw = txn.blobVersionedHashes[index];
        const blobHash = blobHashRaw;
        // hashes.push(blobHash);
        const blob = await BlobData.create({
          id: blobHash,
          commitment: "",
          data: "",
          signerId: txn.from,
          size: BYTES_PER_BLOB,
          shareVersion: "",
          transactionId: txn.hash,
        });
        blobs.push(blob);
      }
    }
  }
  await store.bulkUpdate("AccountEntity", accountsToSave);
  await store.bulkUpdate("AccountDayData", accountDayDatas);
  await store.bulkUpdate("AccountHourData", accountHourDatas);
  await store.bulkUpdate("BlobData", blobs);
  await store.bulkUpdate("TransactionData", txnRecords);
}
