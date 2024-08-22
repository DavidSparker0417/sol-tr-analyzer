import { RAYDIUM_AUTHORITY_V4, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib"
import { dbTransactionAdd, dbTransactionGet, dbTransactionGetByDuration } from "../db/service/db.transaction"
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"

async function processSignaturList(sigs: string[]) {
  console.log(`[DAVID](processSignaturList) count :`, sigs.length)
}

export async function collectRaydiumTransactions(req: any, res:any) {
  const {from, to} = req.query
  console.log(req.query)
  
  const transactionList = await dbTransactionGetByDuration(Number(from), Number(to))
  res.status(200).send({message: "ok", data: transactionList})
}