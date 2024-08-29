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
  const sortBy = _sortBy || "totalSpent"

  // const transactions = await TransactionModel.aggregate([
  //   {
  //     $group: {
  //       _id: "$who", // First level of grouping by 'who'
  //       numTrades: { $sum: 1 },
  //       numTokens: { $addToSet: "$what" },
  //       totalSpent: {
  //         $sum: {
  //           $cond: [
  //             { $eq: ["$how", "buy"] }, // Condition: if 'how' is 'buy'
  //             "$sentAsset.amount", // Then: include 'sentAsset.amount' in the sum
  //             0 // Else: add 0 to the sum
  //           ]
  //         }
  //       },
  //       totalReceive: {
  //         $sum: {
  //           $cond: [
  //             { $eq: ["$how", "sell"] }, // Condition: if 'how' is 'sell'
  //             "$rcvAsset.amount", // Then: include 'rcvAsset.amount' in the sum
  //             0 // Else: add 0 to the sum
  //           ]
  //         }
  //       },
  //       transactionsPerToken: { $push: "$what" }, // Collect tokens traded
  //       trades: {
  //         $push: {
  //           when: "$when", // Include trade time
  //           how: "$how",
  //           sentAssetAmount: "$sentAsset.amount",
  //           rcvAssetAmount: "$rcvAsset.amount"
  //         }
  //       },
  //       lastTradeTime: { $max: "$when" },
  //     }
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       wallet: "$_id",
  //       numTokens: { $size: "$numTokens" },
  //       numTrades: 1,
  //       totalSpent: { $round: ["$totalSpent", 6] },
  //       totalReceive: { $round: ["$totalReceive", 6] },
  //       profit: { $round: [{ $subtract: ["$totalReceive", "$totalSpent"] }, 6] },
  //       roi: {
  //         $cond: [
  //           { $eq: ["$totalSpent", 0] }, // Condition: if 'totalSpent' is 0
  //           "N/A", // Return 'N/A' for ROI to avoid division by zero
  //           {
  //             $round: [
  //               {
  //                 $multiply: [
  //                   { $divide: [{ $subtract: ["$totalReceive", "$totalSpent"] }, "$totalSpent"] }, // Calculate ROI as a fraction
  //                   100 // Convert to percentage
  //                 ]
  //               }, 2 // Round ROI to 2 decimal places
  //             ]
  //           }
  //         ]
  //       },
  //       tradesPerToken: {
  //         $cond: [
  //           { $eq: [{ $size: "$numTokens" }, 0] }, // Condition: if 'numTokens' size is 0
  //           "N/A", // Return 'N/A' to avoid division by zero
  //           {
  //             $round: [
  //               { 
  //                 $divide: ["$numTrades", { $size: "$numTokens" }] // Calculate trades per token
  //               }, 2 // Round to 2 decimal places
  //             ]
  //           }
  //         ]
  //       },
  //       winRate: 1,
  //       lastTradeTime: 1
  //     }
  //   }
  // ])

  // const transactions = await TransactionModel.aggregate([
  //   {
  //     // Group by wallet and token to calculate total sell and buy amounts per token
  //     $group: {
  //       _id: {
  //         wallet: "$who",
  //         token: "$what"
  //       },
  //       totalSell: {
  //         $sum: {
  //           $cond: [
  //             { $eq: ["$how", "sell"] }, // If 'how' is 'sell'
  //             "$rcvAsset.amount",       // Sum the sentAsset.amount
  //             0                          // Else, add 0
  //           ]
  //         }
  //       },
  //       totalBuy: {
  //         $sum: {
  //           $cond: [
  //             { $eq: ["$how", "buy"] },  // If 'how' is 'buy'
  //             "$sentAsset.amount",        // Sum the rcvAsset.amount
  //             0                          // Else, add 0
  //           ]
  //         }
  //       },
  //       numTrades: { $sum: 1 }, // Count the number of trades per wallet/token combination
  //       lastTradeTime: { $max: "$when" } // Track the latest trade time per wallet/token
  //     }
  //   },
  //   {
  //     // Determine if each token is a winner or a loss
  //     $project: {
  //       wallet: "$_id.wallet",
  //       token: "$_id.token",
  //       isWinner: {
  //         $cond: [
  //           { $gt: ["$totalSell", "$totalBuy"] }, // If totalSell > totalBuy
  //           1,                                    // It's a winner
  //           0                                     // Else, it's a loss
  //         ]
  //       },
  //       numTrades: 1, // Pass through the number of trades
  //       totalSell: 1,  // Pass through the total sell amount
  //       totalBuy: 1,    // Pass through the total buy amount
  //       lastTradeTime: 1 // Pass through the last trade time
  //     }
  //   },
  //   {
  //     // Group by wallet to aggregate data across all tokens for each wallet
  //     $group: {
  //       _id: "$wallet", // Group by wallet
  //       winnerTokens: { $sum: "$isWinner" }, // Sum the winner tokens
  //       lossTokens: {
  //         $sum: {
  //           $cond: [
  //             { $eq: ["$isWinner", 0] }, // If not a winner (isWinner = 0)
  //             1,                         // Count as a loss
  //             0                          // Else, add 0
  //           ]
  //         }
  //       },
  //       numTrades: { $sum: "$numTrades" }, // Sum the total number of trades per wallet
  //       numTokens: { $addToSet: "$token" }, // Count unique tokens per wallet
  //       totalSpent: { $sum: "$totalBuy" }, // Sum total spent across all tokens
  //       totalReceive: { $sum: "$totalSell" }, // Sum total received across all tokens
  //       lastTradeTime: { $max: "$lastTradeTime" } // Track the latest trade time per wallet
  //     }
  //   },
  //   {
  //     // Final projection to include all the calculated fields
  //     $project: {
  //       _id: 0,
  //       wallet: "$_id",
  //       winnerTokens: 1,
  //       lossTokens: 1,
  //       numTrades: 1,
  //       numTokens: { $size: "$numTokens" }, // Calculate the number of unique tokens
  //       totalSpent: { $round: ["$totalSpent", 6] },
  //       totalReceive: { $round: ["$totalReceive", 6] },
  //       profit: { $round: [{ $subtract: ["$totalReceive", "$totalSpent"] }, 6] }, // Calculate profit as totalSpent - totalReceive
  //       winRate: {
  //         $cond: [
  //           { $eq: [{ $size: "$numTokens" }, 0] }, // Avoid division by zero
  //           "N/A",
  //           { $round: [{ $divide: ["$winnerTokens", { $size: "$numTokens" }] }, 2] } // Calculate winRate as winnerTokens / numTokens
  //         ]
  //       },
  //       roi: {
  //         $cond: [
  //           { $eq: ["$totalSpent", 0] }, // Avoid division by zero
  //           "N/A",
  //           { $round: [{ $divide: [{ $subtract: ["$totalSpent", "$totalReceive"] }, "$totalSpent"] }, 2] } // Calculate ROI as profit / totalSpent
  //         ]
  //       },
  //       tradesPerToken: {
  //         $cond: [
  //           { $eq: [{ $size: "$numTokens" }, 0] }, // Avoid division by zero
  //           "N/A",
  //           { $round: [{ $divide: ["$numTrades", { $size: "$numTokens" }] }, 2] } // Calculate tradesPerToken as numTrades / numTokens
  //         ]
  //       },
  //       lastTradeTime: 1 // Include the last trade time
  //     }
  //   },
  //   {
  //     $sort: { [sortBy]: isDecending ? -1 : 1 }
  //   },
  //   {
  //     // Pagination: Skip the documents to reach the desired page
  //     $skip: pageNum * numPerPage
  //   },
  //   {
  //     // Limit the results to 100 entries
  //     $limit: numPerPage
  //   }
  // ]);

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