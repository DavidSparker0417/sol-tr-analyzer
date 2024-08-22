import { BotModel } from "../model/model.bots";

export async function dbBotAdd(address: string) {
  let bot = await BotModel.findOne({address})
  if (!bot) {
    bot = new BotModel({address})
    await bot.save()
  }
  return bot
}

export async function dbBotIsBot(address: string): Promise<boolean> {
  const bot = await BotModel.findOne({address})
  return bot ? true : false
}