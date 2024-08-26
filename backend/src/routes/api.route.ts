import { Router } from "express";
import { collectRaydiumTransactions, fetchTransactions, queryWalletsSummary } from "../controllers/api.controller";

const apiRoute = Router()

apiRoute.get('/raydium', collectRaydiumTransactions)

apiRoute.get('/summary', queryWalletsSummary)
apiRoute.get('/fetch', fetchTransactions)

export default apiRoute