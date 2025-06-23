import { EthereumBlock } from "@subql/types-ethereum";
import { CollectiveData } from "../types";

import { ZERO_BD } from "../utils";

export async function handleBlock(block: EthereumBlock): Promise<void> {
  logger.info(`BLOCK ::: ${block.number}`);
  const transactions = block.transactions;
  if (block.transactions) {
    let collectiveData = await CollectiveData.get("1");
    if (collectiveData === null) {
      collectiveData = await CollectiveData.create({
        id: "1",
        totalBlobTransactionCount: ZERO_BD,
        totalValue: ZERO_BD,
        totalValueEth: ZERO_BD,
        totalGasEth: ZERO_BD,
        totalFeeEth: ZERO_BD,
        totalGasUsed: ZERO_BD,
        totalCumulativeGasUsed: ZERO_BD,
        totalBlobGas: ZERO_BD,
        totalBlobGasFeeCap: ZERO_BD,
        totalBlobHashesCount: ZERO_BD,
        totalBlobGasEth: ZERO_BD,
        totalBlobBlocks: ZERO_BD,
        totalFeeUSD: ZERO_BD,
        totalGasUSD: ZERO_BD,
        totalValueUSD: ZERO_BD,
        totalBlobGasUSD: ZERO_BD,
        avgEthPrice: ZERO_BD,
        currentEthPrice: ZERO_BD,
        totalFeeBurnedETH: ZERO_BD,
        totalFeeBurnedUSD: ZERO_BD,
        totalTransactionCount: ZERO_BD,
        totalTransactionCountLegacy: ZERO_BD,
        totalTransactionCountAccessList: ZERO_BD,
        totalTransactionCountDynamicFee: ZERO_BD,
      });
    }
  }
  for (let index = 0; index < transactions.length; index++) {
    const txn = transactions[index];

    if (txn.type === "0x3") {
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
}
