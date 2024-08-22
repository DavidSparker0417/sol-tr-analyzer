import { getCurrentTimestamp, RAYDIUM_AUTHORITY_V4, sleep, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib";
import { dbTransactionAdd, dbTransactionEarliestTimestamp, dbTransactionGetByDuration } from "../db/service/db.transaction";
import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type";
import { dbBotAdd, dbBotIsBot } from "../db/service/db.bot";
import { timeStamp } from "console";
import _, { indexOf } from "lodash"

export async function processSigList(sigList: string[any]) {
  console.log(`[DAVID] (processSigList) sigCount =`, sigList.length)
  const swapInfoList: SolTrSwapInfo[] = []
  for (const sig of sigList) {
    const swapInfo: SolTrSwapInfo | undefined = await solTrSwapInspect(sig)
    console.log(`[DAVID] processSigList :: (${indexOf(sigList, sig)}/${sigList.length})`)
    if (swapInfo && !await dbBotIsBot(swapInfo.who)) {
      // console.log(`[DAVID] adding data to db sig :`, swapInfo.signature)
      await dbTransactionAdd(swapInfo)
      swapInfoList.push(swapInfo)
    }
  }

  // bot detection
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
  }
}

export async function dbSyncTask() {
  const curTime = getCurrentTimestamp()
  let start = curTime - 20 * 1000
  let end = curTime

  // const swapInfoList = await dbTransactionGetByDuration(start - 3600 * 1000, end)
  while (true) {
    console.log(`[DAVID]------------- fetching from ${start} to ${end} -------------`)
    await solTrQueryTransactions(RAYDIUM_AUTHORITY_V4, processSigList, start, end)
    await sleep(100)
    start = end
    end = getCurrentTimestamp()
  }
}

export function startTasks() {
  dbSyncTask()
}