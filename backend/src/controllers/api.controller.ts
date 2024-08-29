import { getCurrentTimestamp, JUPITER, PUMPFUN, RAYDIUM_AUTHORITY_V4, sleep, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib"
import { dbTransactionAdd, dbTransactionGet, dbTransactionGetByDuration, dbTransactionInspect, dbTrasnactionGetWalletCount } from "../db/service/db.transaction"
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"
import _, { indexOf } from "lodash"
import { ok } from "assert"
import { processJupiterfunSigList, processPumpfunSigList, processRaydiumSigList } from "../middleware/task"

export async function collectRaydiumTransactions(req: any, res: any) {
  const { from, to } = req.query
  console.log(`[DAVID](API-REQ) collectRaydiumTransactions :: query = ${JSON.stringify(req.query)}`)

  let start = Number(from), end = Number(to)
  if (!start || !end) {
    end = getCurrentTimestamp()
    start = end - 3600 * 1000
  }
  const transactionList = await dbTransactionGetByDuration(start, end)
  res.status(200).send({ message: "ok", data: transactionList })
}

export async function queryWalletsSummary(req: any, res: any) {
  const query = req.query
  console.log(`[DAVID](API-REQ) queryWalletsSummary :: query = ${JSON.stringify(req.query)}`)

  let start = Number(query.from), end = Number(query.to)
  if (!start || !end) {
    end = getCurrentTimestamp()
    start = end - 3600 * 1000
  }
  const sortBy = query.sortBy || 'numTrades'
  const isDecending = query.isDecending && query.isDecending === 'true' ? true : false
  const tradeResult = await dbTransactionInspect(start, end, sortBy, isDecending)
  // const swapInfoList = await dbTransactionGetByDuration(start, end)
  // console.log(`[DAVID](API-REQ) queryWalletsSummary :: 1. got list from db. count = ${swapInfoList.length}`)
  // const traders = _.countBy(swapInfoList.map((s: SolTrSwapInfo) => s.who));
  // console.log(`[DAVID](API-REQ) queryWalletsSummary :: 2. traders count = ${Object.keys(traders).length}`)
  // const tradeResult: any = []

  // // for(const swapInfo of swapInfoList) {
  // //   if (traderResult[swapInfo.who])
  // // }

  // for(const wallet of Object.keys(traders))
  // {
  //   const numTrades = traders[wallet]
  //   const tradeList = swapInfoList.filter((s: SolTrSwapInfo) => s.who === wallet)
  //   let totalSpent = 0
  //   let totalReceive = 0
  //   let lastTradeTime = 0
  //   // console.log(`[DAVID](API-REQ) queryWalletsSummary :: 3-1. Analyzing wallet(${wallet})`)
  //   tradeList.forEach((t: SolTrSwapInfo) => {
  //     switch (t.how) {
  //       case 'buy':
  //         totalSpent += t.sentAsset.amount
  //         break;
  //       case 'sell':
  //         totalReceive += t.rcvAsset.amount
  //       default:
  //         break;
  //     }
  //     lastTradeTime = Math.max(lastTradeTime, t.when.getTime())
  //   })

  //   const profit = totalReceive - totalSpent
  //   const roi = (!totalReceive || !totalSpent) ? 0 : (totalReceive / totalSpent) * 100

  //   let sucessCnt: number = 0; 
  //   const tokenTradesCount = _.countBy(tradeList.map((t: SolTrSwapInfo) => t.what))
  //   Object.keys(tokenTradesCount).forEach((token: string) => {
  //     const spent:any = tradeList
  //       .filter((s: SolTrSwapInfo) => s.what === token)
  //       .filter((s: SolTrSwapInfo) => s.how === 'buy')
  //       .reduce((acc: any, curItem: SolTrSwapInfo) => acc + curItem.sentAsset.amount, 0)
  //     const got:any = tradeList
  //       .filter((s: SolTrSwapInfo) => s.what === token)
  //       .filter((s: SolTrSwapInfo) => s.how === 'sell')
  //       .reduce((acc: any, curItem: SolTrSwapInfo) => acc + curItem.rcvAsset.amount, 0)
  //     sucessCnt += (got > spent) ? 1 : 0
  //   })
  //   const winRate = ((sucessCnt / Object.keys(tokenTradesCount).length) * 100).toFixed(2)
  //   // console.log(`[DAVID] win rate for(${wallet}) succ cnt = ${sucessCnt}, totalTokenCount = ${Object.keys(tokenTradesCount).length}`)
  //   const numTokens = Object.keys(tokenTradesCount).length
  //   const tradesPerToken = (traders[wallet] / numTokens).toFixed(2)

  //   tradeResult.push({
  //     wallet,
  //     numTrades,
  //     numTokens,
  //     totalSpent: totalSpent.toFixed(6),
  //     totalReceive: totalReceive.toFixed(6),
  //     profit: profit.toFixed(6),
  //     winRate,
  //     roi: roi.toFixed(2),
  //     tradesPerToken,
  //     lastTradeTime: new Date(lastTradeTime)
  //   })
  // }
  // console.log(tradeResult.length)
  // const page = Number(query.page || 0)
  // const numPerPage = Number(query.numPerPage || 100)
  // let resultData: any[] = []
  // try {
  //   resultData = tradeResult.sort((a: any, b: any) => (a[sortBy] < b[sortBy] ? 1 : -1))  
  // } catch (error) {
  //   resultData = tradeResult
  // }
  // resultData = resultData.slice(page * numPerPage, (page + 1) * numPerPage)
  res.status(200).send({ message: "ok", data: tradeResult, totalCount: await dbTrasnactionGetWalletCount() })
}

export async function fetchTransactions(req: any, res: any) {
  const { from, to } = req.query
  console.log(`[DAVID](API-REQ) fetchTransactions :: query = ${JSON.stringify(req.query)}`)
  res.status(200).send({ message: "ok", trCount: 0 })
  let start = Number(from), end = Number(to)
  if (!start || !end) {
    end = getCurrentTimestamp()
    start = end - 20 * 1000
  }

  const jupiterTrCount = await solTrQueryTransactions(JUPITER, processJupiterfunSigList, start, end)
  console.log(`[DAVID](API-REQ) ------------------ fetchTransactions :: jupiter transaction count = ${jupiterTrCount} --------------`)
  const pumpfunTrCount = await solTrQueryTransactions(PUMPFUN, processPumpfunSigList, start, end)
  console.log(`[DAVID](API-REQ) ------------------ fetchTransactions :: pumpfun transaction count = ${pumpfunTrCount} --------------`)
  const raydiumTrCount = await solTrQueryTransactions(RAYDIUM_AUTHORITY_V4, processRaydiumSigList, start, end)
  console.log(`[DAVID](API-REQ) ------------------ fetchTransactions :: raydium transaction count = ${raydiumTrCount} --------------`)
  const totalTrCount = jupiterTrCount + pumpfunTrCount + raydiumTrCount

  res.status(200).send({ message: "ok", trCount: totalTrCount })
}