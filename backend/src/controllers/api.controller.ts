import { getCurrentTimestamp, RAYDIUM_AUTHORITY_V4, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib"
import { dbTransactionAdd, dbTransactionGet, dbTransactionGetByDuration } from "../db/service/db.transaction"
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"

async function processSignaturList(sigs: string[]) {
  console.log(`[DAVID](processSignaturList) count :`, sigs.length)
}

export async function collectRaydiumTransactions(req: any, res:any) {
  const {from, to} = req.query
  console.log(`[DAVID](API-REQ) collectRaydiumTransactions :: query = ${req.query}`)
  
  let start = Number(from), end = Number(to)
  if (!start || !end)
  {
    end = getCurrentTimestamp()
    start = end - 3600 * 1000
  }
  const transactionList = await dbTransactionGetByDuration(start, end)
  res.status(200).send({message: "ok", data: transactionList})
}