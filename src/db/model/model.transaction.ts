import { SolAsset, SolTrSwapInfo } from "@david-lab/sol-lib/dist/type";
import { Document } from "mongodb";
import mongoose, { Schema } from "mongoose";

const TransactionSchema: Schema = new Schema({
  signature: {type: String, default: "", required: true, unique: true},
  when: {type: Date},
  who: {type: String},
  where: {type: String},
  what: {type: String},
  how: {type: String},
  sentAsset: {
    address: {type: String},
    name: {type: String},
    amount: {type: Number}
  },
  rcvAsset: {
    address: {type: String},
    name: {type: String},
    amount: {type: Number}
  }
})

export const TransactionModel = mongoose.model<SolTrSwapInfo>('Transaction', TransactionSchema)