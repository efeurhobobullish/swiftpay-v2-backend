import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { getUserTransactions, getAllTransactions, transactionWebhook, updateBalance, sendFunds } from "../controllers/transactions.controller.js";

const transactionRouter = Router();

transactionRouter.get("/user", isAuthenticated, getUserTransactions);
transactionRouter.post("/create", isAuthenticated, updateBalance);
transactionRouter.get("/all", isAuthenticated, getAllTransactions)
transactionRouter.post("/send", isAuthenticated, sendFunds)
transactionRouter.post("/webhook", transactionWebhook)

export default transactionRouter;

