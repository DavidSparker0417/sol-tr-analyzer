import { getCurrentTimestamp, RAYDIUM_AUTHORITY_V4, sleep, solTrQueryTransactions, solTrSwapInspect } from "@david-lab/sol-lib";
import { dbTransactionAdd, dbTransactionGetByDuration } from "../db/service/db.transaction";

export async function processSigList(sigList: string[any]) {
  console.log(`[DAVID] (processSigList) sigCount =`, sigList.length)
  for(const sig of sigList) {
    const swapInfo = await solTrSwapInspect(sig)
    if (swapInfo) {
      // console.log(swapInfo)
      console.log(`[DAVID] adding data to db sig :`, swapInfo.signature)
      await dbTransactionAdd(swapInfo)
    }
  }
}
export async function dbSyncTask() {

  const curTime = getCurrentTimestamp()
  let start = curTime - 30 * 1000
  let end = curTime
  
  // await dbTransactionGetByDuration(start - 1800 * 1000, end)
  while(false) {  
    console.log(`[DAVID]------------- fetching from ${start} to ${end} -------------`)
    await solTrQueryTransactions(RAYDIUM_AUTHORITY_V4, processSigList, start, end)
    start = end
    end = getCurrentTimestamp()
    await sleep(100)
  }
}