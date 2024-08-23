import { getCurrentTimestamp, RAYDIUM_AUTHORITY_V4, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib"
import { dbTransactionAdd, dbTransactionGet, dbTransactionGetByDuration } from "../db/service/db.transaction"
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"
import _, { indexOf } from "lodash"

export async function collectRaydiumTransactions(req: any, res:any) {
  const {from, to} = req.query
  console.log(`[DAVID](API-REQ) collectRaydiumTransactions :: query = ${JSON.stringify(req.query)}`)
  
  let start = Number(from), end = Number(to)
  if (!start || !end)
  {
    end = getCurrentTimestamp()
    start = end - 3600 * 1000
  }
  const transactionList = await dbTransactionGetByDuration(start, end)
  res.status(200).send({message: "ok", data: transactionList})
}

export async function queryWalletsSummary(req: any, res:any) {
  const {from, to} = req.query
  console.log(`[DAVID](API-REQ) queryWalletsSummary :: query = ${JSON.stringify(req.query)}`)
  
  let start = Number(from), end = Number(to)
  if (!start || !end)
  {
    end = getCurrentTimestamp()
    start = end - 3600 * 1000
  }
  const swapInfoList = await dbTransactionGetByDuration(start, end)
  const tradeCounts = _.countBy(swapInfoList.map((s: SolTrSwapInfo) => s.who));
  const tradeResult: any = []

  Object.keys(tradeCounts).forEach((wallet: string) => {
    const numTrades = tradeCounts[wallet]
    const tradeList = swapInfoList.filter((s: SolTrSwapInfo) => s.who === wallet)
    let totalSpent = 0
    let totalReceive = 0
    let lastTradeTime = 0
    tradeList.forEach((t: SolTrSwapInfo) => {
      switch (t.how) {
        case 'buy':
          totalSpent += t.sentAsset.amount
          break;
        case 'sell':
          totalReceive += t.rcvAsset.amount
        default:
          break;
      }
      lastTradeTime = Math.max(lastTradeTime, t.when.getTime())
    })

    const profit = totalReceive - totalSpent
    const roi = (totalReceive / totalSpent) * 100

    let winRate = 0
    let totalTrad = 0
    const tokenTradesCount = _.countBy(tradeList.map((t: SolTrSwapInfo) => t.what))
    Object.keys(tokenTradesCount).forEach((token: string) => {
      // tradeList.filter((s: SolTrSwapInfo) => s.what === token)
    })
    const numTokens = Object.keys(tokenTradesCount).length
    const tradesPerToken = (tradeCounts[wallet] / numTokens).toFixed(2)

    tradeResult.push({
      wallet,
      numTrades,
      numTokens,
      totalSpent: totalSpent.toFixed(6),
      totalReceive: totalReceive.toFixed(6),
      profit: profit.toFixed(6),
      winRate,
      roi: roi.toFixed(2),
      tradesPerToken,
      lastTradeTime: new Date(lastTradeTime)
    })
  })
  // console.log(tradeResult)
  res.status(200).send({message: "ok", data: tradeResult})
}