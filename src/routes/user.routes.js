import {Router} from "express"
import { createBankAccount, updateUser } from "../controllers/user.controller.js"
import { isAuthenticated } from "../middlewares/auth.js"

const userRouter = Router()

userRouter.put("/update", updateUser)
userRouter.post("/bank", isAuthenticated, createBankAccount)

export default userRouter
