import express from "express";
import cors from "cors";
import process from "process";
import connectDatabase from "./config/connectDatabase.js";
import authRouter from "./routes/auth.routes.js";
import transactionRouter from "./routes/transaction.route.js";
import serviceRouter from "./routes/service.routes.js";
import userRouter from "./routes/user.routes.js";
import adminRouter from "./routes/admin.routes.js";

const port = process.env.PORT || 3000;

const app = express();

connectDatabase();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: ["https://questpay.ng", "http://localhost:7000", "http://localhost:9001", "https://admin.questpay.ng"],
    credentials: true,
  }
));

app.get("/", (_req, res) => {
  res.json({ message: "API is running 🔥" });
});

app.use("/auth", authRouter)
app.use("/transactions", transactionRouter)
app.use("/services", serviceRouter)
app.use("/user", userRouter)
app.use("/admin", adminRouter)

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
