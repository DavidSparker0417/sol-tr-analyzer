import mongoose, { Schema } from "mongoose"

interface Bot {
  address: string
}

const BotSchema: Schema = new Schema({
  address: {type: String, unique: true}
})

export const BotModel = mongoose.model<Bot>('Bot', BotSchema)