import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"
import { TransactionModel } from "../model/model.transaction"

export async function dbTransactionAdd(tr: SolTrSwapInfo):Promise<SolTrSwapInfo> {
  let transaction = await TransactionModel.findOne({signature: tr.signature})
  if (!transaction) {
    transaction = new TransactionModel(tr)
    await transaction.save()
  }
  return transaction
}

export async function dbTransactionGet(signature: string): Promise<SolTrSwapInfo|undefined> {
  let transaction = await TransactionModel.findOne({signature})
  return transaction?.toObject()
}
