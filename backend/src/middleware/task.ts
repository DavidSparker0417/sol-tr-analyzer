import { getCurrentTimestamp, JUPITER, PUMPFUN, RAYDIUM_AUTHORITY_V4, sleep, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib";
import { dbTransactionAdd, dbTransactionEarliestTimestamp, dbTransactionGetByDuration } from "../db/service/db.transaction";
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type";
import { dbBotAdd, dbBotIsBot } from "../db/service/db.bot";
import { timeStamp } from "console";
import _, { indexOf } from "lodash"
import { wssSend } from "./websocket";

async function processSigList(sigList: string[any], platform: string) {
  console.log(`[DAVID] (processSigList) sigCount =`, sigList.length)
  
  // 1. fetching transacition detailes fron onchain
  const swapInfoList: SolTrSwapInfo[] = []
  for (const sig of sigList) {
    const swapInfo: SolTrSwapInfo|undefined = await solTrSwapInspect(sig, platform)
    if (swapInfo && !await dbBotIsBot(swapInfo.who)) {
      // console.log(`[DAVID] adding data to db sig :`, swapInfo.signature)
      // await dbTransactionAdd(swapInfo)
      swapInfoList.push(swapInfo)
    }
  }

  // 2. bot detection
  let botsCount = 0
  console.log(`[DAVID] added ${swapInfoList.length} entries to db.`)
  const timestamps = Array.from(new Set(swapInfoList.map((s: SolTrSwapInfo) => s.when.getTime())));
  // console.log(`[DAVID] ++++++++++++++++++++++ timestamps: `, timestamps)
  for (const tm of timestamps) {
    const walletsInSec = swapInfoList.filter((s: SolTrSwapInfo) => s.when.getTime() === tm)
      .map((s: any) => s.who)

    const itemCounts = _.countBy(walletsInSec);
    const bots = Object.keys(itemCounts).filter(item => itemCounts[item] > 1);
    console.log(`[DAVID] ::::::: bots = `, bots)
    for (const bot of bots) {
      await dbBotAdd(bot)
    }
    botsCount += bots.length
  }

  // 3. add to db
  for(const swapInfo of swapInfoList) {
    if (await dbBotIsBot(swapInfo.who)) 
      continue
    console.log(`[DAVID](${platform}) ::::::: adding transaction to db : ${swapInfo.signature} `)
    await dbTransactionAdd(swapInfo)
  }

  // send result via websocket
  wssSend({
    platform,
    trCount: sigList.length,
    dbSyncCount: swapInfoList.length,
    botsCount
  })
}

export async function processRaydiumSigList(sigList: string[any]) {
  processSigList(sigList, 'Raydium')
}

export async function processPumpfunSigList(sigList: string[any]) {
  processSigList(sigList, 'PumpFun')
}

export async function processJupiterfunSigList(sigList: string[any]) {
  processSigList(sigList, 'Jupiter')
}

export async function dbSyncTask() {
  const curTime = getCurrentTimestamp()
  let start = curTime - 20 * 1000
  let end = curTime

  // const swapInfoList = await dbTransactionGetByDuration(start - 3600 * 1000, end)
  while (true) {
    console.log(`[DAVID]------------- fetching from ${start} to ${end} -------------`)
    await solTrQueryTransactions(JUPITER, processJupiterfunSigList, start, end)
    // await solTrQueryTransactions(PUMPFUN, processPumpfunSigList, start, end)
    // await solTrQueryTransactions(RAYDIUM_AUTHORITY_V4, processRaydiumSigList, start, end)
    await sleep(100)
    console.log(`[DAVID]------------------------------------------------------------`)
    start = end
    end = getCurrentTimestamp()
    break
  }
}

export function startTasks() {
  // dbSyncTask()
}