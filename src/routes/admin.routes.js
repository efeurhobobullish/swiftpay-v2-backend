import {Router} from "express"
import { getNetworth, getUsers } from "../controllers/admin.controllers.js"
import { isAuthenticated } from "../middlewares/auth.js"

const adminRouter = Router()

adminRouter.get("/users", isAuthenticated, getUsers)
adminRouter.get("/networth", isAuthenticated, getNetworth)

export default adminRouter