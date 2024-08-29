import { SolTrSwapInfo } from "@david-lab/sol-lib/dist/type"
import { TransactionModel } from "../model/model.transaction"

export async function dbTransactionAdd(tr: SolTrSwapInfo): Promise<SolTrSwapInfo | undefined> {
  try {
    let transaction = await TransactionModel.findOne({ signature: tr.signature })
    if (!transaction) {
      transaction = new TransactionModel(tr)
      await transaction.save()
    }
    return transaction
  } catch (error) {
    return undefined
  }
}

export async function dbTransactionGet(signature: string): Promise<SolTrSwapInfo | undefined> {
  let transaction = await TransactionModel.findOne({ signature })
  return transaction?.toObject()
}

export async function dbTransactionGetByDuration(start: number, end: number) {
  const startTime = new Date(start)
  const endTime = new Date(end)

  // console.log(`[DAVID](DB) fetching transactions from (${start})${startTime} to (${end})${endTime}`)
  const query = {
    when: {
      $gte: startTime,
      $lt: endTime
    }
  };

  const transactions = await TransactionModel.find(query)
    .sort({ when: 1 });
  return transactions
}

export async function dbTransactionInspect(start: number, end: number, numPerPage: number = 100, pageNum: number = 0, _sortBy: string | undefined = "profit", isDecending: boolean = true) {
  const startTime = new Date(start)
  const endTime = new Date(end)

  // console.log(`[DAVID](DB) fetching transactions from (${start})${startTime} to (${end})${endTime}`)
  const query = {
    when: {
      $gte: startTime,
      $lt: endTime
    }
  };
  const sortBy = _sortBy || "winRate"

  const [transactions, totalCount] = await Promise.all([
    // This part runs the paginated and sorted query
    TransactionModel.aggregate([
      {
        $group: {
          _id: {
            wallet: "$who",
            token: "$what"
          },
          totalSell: {
            $sum: {
              $cond: [
                { $eq: ["$how", "sell"] },
                "$rcvAsset.amount",
                0
              ]
            }
          },
          totalBuy: {
            $sum: {
              $cond: [
                { $eq: ["$how", "buy"] },
                "$sentAsset.amount",
                0
              ]
            }
          },
          numTrades: { $sum: 1 },
          lastTradeTime: { $max: "$when" }
        }
      },
      {
        $project: {
          wallet: "$_id.wallet",
          token: "$_id.token",
          isWinner: {
            $cond: [
              { $gt: ["$totalSell", "$totalBuy"] },
              1,
              0
            ]
          },
          numTrades: 1,
          totalSell: 1,
          totalBuy: 1,
          lastTradeTime: 1
        }
      },
      {
        $group: {
          _id: "$wallet",
          winnerTokens: { $sum: "$isWinner" },
          lossTokens: {
            $sum: {
              $cond: [
                { $eq: ["$isWinner", 0] },
                1,
                0
              ]
            }
          },
          numTrades: { $sum: "$numTrades" },
          numTokens: { $addToSet: "$token" },
          totalSpent: { $sum: "$totalBuy" },
          totalReceive: { $sum: "$totalSell" },
          lastTradeTime: { $max: "$lastTradeTime" }
        }
      },
      {
        $project: {
          _id: 0,
          wallet: "$_id",
          winnerTokens: 1,
          lossTokens: 1,
          numTrades: 1,
          numTokens: { $size: "$numTokens" },
          totalSpent: { $round: ["$totalSpent", 6] },
          totalReceive: { $round: ["$totalReceive", 6] },
          profit: { $round: [{ $subtract: ["$totalReceive", "$totalSpent"] }, 6] },
          winRate: {
            $cond: [
              { $eq: [{ $size: "$numTokens" }, 0] },
              "N/A",
              { $round: [{ $divide: ["$winnerTokens", { $size: "$numTokens" }] }, 2] }
            ]
          },
          roi: {
            $cond: [
              { $eq: ["$totalSpent", 0] },
              "N/A",
              { $round: [{ $divide: [{ $subtract: ["$totalSpent", "$totalReceive"] }, "$totalSpent"] }, 2] }
            ]
          },
          tradesPerToken: {
            $cond: [
              { $eq: [{ $size: "$numTokens" }, 0] },
              "N/A",
              { $round: [{ $divide: ["$numTrades", { $size: "$numTokens" }] }, 2] }
            ]
          },
          lastTradeTime: 1
        }
      },
      {
        $sort: { [sortBy]: isDecending ? -1 : 1 }
      },
      {
        $skip: pageNum * numPerPage
      },
      {
        $limit: numPerPage
      }
    ]),
  
    // This part runs the counting query
    TransactionModel.aggregate([
      {
        $group: {
          _id: {
            wallet: "$who",
            token: "$what"
          }
        }
      },
      {
        $group: {
          _id: "$_id.wallet",
        }
      },
      {
        $count: "totalCount"
      }
    ])
  ]);

  const total = totalCount.length > 0 ? totalCount[0].totalCount : 0;
  // console.log(totalCount)
  // return []
  return {tradeResult: transactions, totalCount: total}
}

export async function dbTrasnactionGetWalletCount() {
  // return await TransactionModel.distinct("who").countDocuments();
  const distinctCount = await TransactionModel.aggregate([
    {
      // Group by the fields you want to be distinct
      $group: {
        _id: {
          who: "$who",
          what: "$what"
        }
      }
    },
    {
      // Count the number of distinct groups
      $count: "distinctCount"
    }
  ]);
  const count = distinctCount.length > 0 ? distinctCount[0].distinctCount : 0;
  return count
}

export async function dbTransactionEarliestTimestamp() {
  const earliestTr = await TransactionModel.findOne()
    .sort({ when: 1 })

  if (earliestTr)
    return earliestTr.when.getTime()
  return 0
}