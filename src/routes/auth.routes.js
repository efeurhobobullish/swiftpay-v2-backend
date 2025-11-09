import {Router} from "express"
import { register, verifyOtp, login, checkAuth, resendOtp } from "../controllers/auth.controller.js"
import { isAuthenticated } from "../middlewares/auth.js"
const authRouter = Router()

authRouter.post("/register", register)
authRouter.post("/verify", verifyOtp)
authRouter.post("/resend-otp", resendOtp)
authRouter.post("/login", login)
authRouter.get("/check", isAuthenticated, checkAuth)

export default authRouter