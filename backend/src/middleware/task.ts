import { getCurrentTimestamp, JUPITER, PUMPFUN, RAYDIUM_AUTHORITY_V4, sleep, solTrEvWalletStart, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib";
import { dbTransactionAdd, dbTransactionEarliestTimestamp, dbTransactionGetByDuration } from "../db/service/db.transaction";
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type";
import { dbBotAdd, dbBotIsBot } from "../db/service/db.bot";
import { timeStamp } from "console";
import _, { indexOf } from "lodash"
import { wssSend } from "./websocket";

async function detectBot(swapInfoList: SolTrSwapInfo[]): Promise<number> {
  let botsCount = 0
  const timestamps = Array.from(new Set(swapInfoList.map((s: SolTrSwapInfo) => s.when.getTime())));
  for (const tm of timestamps) {
    const walletsInSec = swapInfoList.filter((s: SolTrSwapInfo) => s.when.getTime() === tm)
      .map((s: any) => s.who)

    const itemCounts = _.countBy(walletsInSec);
    const bots = Object.keys(itemCounts).filter(item => itemCounts[item] > 1);
    for (const bot of bots) {
      await dbBotAdd(bot)
    }
    botsCount += bots.length
  }
  console.log(`[DAVID] ::::::: ${botsCount} bots detected`)
  return botsCount
}

async function processSigList(sigList: string[any], platform: string) {
  console.log(`[DAVID] (processSigList) sigCount =`, sigList.length)

  // 1. fetching transacition detailes fron onchain
  const swapInfoList: SolTrSwapInfo[] = []
  for (const sig of sigList) {
    const swapInfo: SolTrSwapInfo | undefined = await solTrSwapInspect(sig, platform)
    const isBot = swapInfo && await dbBotIsBot(swapInfo.who)
    const state = !swapInfo ? 'failed transaction' : (isBot ? 'bot' : swapInfo.how)
    wssSend({
      cmd: 'transaction',
      signature: sig,
      state: state,
      platform: swapInfo?.where
    })
    if (swapInfo && !isBot) {
      // console.log(`[DAVID] adding data to db sig :`, swapInfo.signature)
      // await dbTransactionAdd(swapInfo)
      swapInfoList.push(swapInfo)
    }
  }

  // 2. bot detection
  let botsCount = 0
  const timestamps = Array.from(new Set(swapInfoList.map((s: SolTrSwapInfo) => s.when.getTime())));
  // console.log(`[DAVID] ++++++++++++++++++++++ timestamps: `, timestamps)
  for (const tm of timestamps) {
    const walletsInSec = swapInfoList.filter((s: SolTrSwapInfo) => s.when.getTime() === tm)
      .map((s: any) => s.who)

    const itemCounts = _.countBy(walletsInSec);
    const bots = Object.keys(itemCounts).filter(item => itemCounts[item] > 1);
    // console.log(`[DAVID] ::::::: bots = `, bots)
    for (const bot of bots) {
      await dbBotAdd(bot)
    }
    botsCount += bots.length
  }

  // 3. add to db
  for (const swapInfo of swapInfoList) {
    if (await dbBotIsBot(swapInfo.who))
      continue
    // console.log(`[DAVID](${platform}) ::::::: adding transaction to db : ${swapInfo.signature} `)
    await dbTransactionAdd(swapInfo)
  }

  console.log(`[DAVID] Finished to analyze ${sigList.length} transactions. added ${swapInfoList.length} entries to db.`)
  // send result via websocket
  wssSend({
    cmd: "siglist",
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

let raydiumBuffer: SolTrSwapInfo[] = []
let jupiterBuffer: SolTrSwapInfo[] = []
let pumpfunBuffer: SolTrSwapInfo[] = []

async function processRaydiumTr(signature: string) {
  const swapInfo = await solTrSwapInspect(signature, "Raydium")
  if (!swapInfo)
    return

  raydiumBuffer.push(swapInfo)
}

async function processPumpfunTr(signature: string) {
  const swapInfo = await solTrSwapInspect(signature, "PumpFun")
  if (!swapInfo)
    return

  pumpfunBuffer.push(swapInfo)
}

async function processJupiterTr(signature: string) {
  const swapInfo = await solTrSwapInspect(signature, "Jupiter")
  if (!swapInfo)
    return

  jupiterBuffer.push(swapInfo)
}

async function dbSync(cache: SolTrSwapInfo[]) {
  while (true) {
    const timestamps = Array.from(new Set(cache.map((s: SolTrSwapInfo) => s.when.getTime())));
    if (timestamps.length < 2) {
      await sleep(100)
      continue
    }
    await detectBot(cache)
    for (let tr = cache.pop(); tr; tr = cache.pop()) {
      if (await dbBotIsBot(tr.who)) {
        // console.log(`[DAVID](${tr.who}) bot: skipping...`)
        continue
      }
      // console.log(`[DAVID] Adding tr to db. (${tr.signature})`)
      await dbTransactionAdd(tr)
    }
    await sleep(100)
  }
}

export function startTasks() {
  solTrEvWalletStart(RAYDIUM_AUTHORITY_V4, processRaydiumTr)
  solTrEvWalletStart(PUMPFUN, processPumpfunTr)
  solTrEvWalletStart(JUPITER, processJupiterTr)
  dbSync(raydiumBuffer)
  dbSync(jupiterBuffer)
  dbSync(pumpfunBuffer)
}