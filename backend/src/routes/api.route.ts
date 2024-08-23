import { Router } from "express";
import { collectRaydiumTransactions, queryWalletsSummary } from "../controllers/api.controller";

const apiRoute = Router()

apiRoute.get('/raydium', collectRaydiumTransactions)

apiRoute.get('/raydium/summary', queryWalletsSummary)

export default apiRoute