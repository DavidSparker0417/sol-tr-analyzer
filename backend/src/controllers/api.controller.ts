import { solRaydiumGetTransactions, solTrSwapInspect } from "@david-lab/sol-lib"
import { dbTransactionAdd, dbTransactionGet } from "../db/service/db.transaction"
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"

export async function collectRaydiumTransactions(req: any, res:any) {
  const transactions = await solRaydiumGetTransactions()
  const transactionList:any[] = []
  for(const signature of transactions) {
    let swapInfo = await dbTransactionGet(signature)
    if (!swapInfo) {
      swapInfo = await solTrSwapInspect(signature)
      if (swapInfo)
        await dbTransactionAdd(swapInfo)
    }
    console.log(swapInfo)
    if (swapInfo)
      transactionList.push(swapInfo)
  }

  res.status(200).send({message: "ok", data: transactionList})
}