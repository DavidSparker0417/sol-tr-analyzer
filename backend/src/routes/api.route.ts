import { Router } from "express";
import { collectRaydiumTransactions } from "../controllers/api.controller";

const apiRoute = Router()

apiRoute.get('/raydium', collectRaydiumTransactions)

export default apiRoute