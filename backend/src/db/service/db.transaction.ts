import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"
import { TransactionModel } from "../model/model.transaction"

export async function dbTransactionAdd(tr: SolTrSwapInfo): Promise<SolTrSwapInfo | undefined> {
  try {
    let transaction = await TransactionModel.findOne({ signature: tr.signature })
    if (!transaction) {
      transaction = new TransactionModel(tr)
      await transaction.save()
    }
    return transaction
  } catch (error) {
    return undefined
  }
}

export async function dbTransactionGet(signature: string): Promise<SolTrSwapInfo | undefined> {
  let transaction = await TransactionModel.findOne({ signature })
  return transaction?.toObject()
}

export async function dbTransactionGetByDuration(start: number, end: number) {
  const startTime = new Date(start)
  const endTime = new Date(end)

  // console.log(`[DAVID](DB) fetching transactions from (${start})${startTime} to (${end})${endTime}`)
  const query = {
    when: {
      $gte: startTime,
      $lt: endTime
    }
  };

  const transactions = await TransactionModel.find(query)
    .sort({ when: 1 });
  return transactions
}

export async function dbTransactionEarliestTimestamp() {
  const earliestTr = await TransactionModel.findOne()
    .sort({ when: 1 })

  if (earliestTr)
    return earliestTr.when.getTime()
  return 0
}