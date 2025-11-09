import { Router } from "express";
import {
  buyAirtime,
  addAirtimeProfit,
  updateAirtimeProfit,
  getAirtimeProfits,
} from "../controllers/airtime.controller.js";
import {
  buyData,
  addDataPlan,
  addDataProfit,
  getDataPlans,
  deleteDataPlan,
  updateDataPlan,
  getDataProfits,
  updateDataPlanPriceByNetwork,
} from "../controllers/data.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const serviceRouter = Router();

// airtime routes
serviceRouter.post("/airtime", isAuthenticated, buyAirtime);
serviceRouter.post("/airtime/profit", isAuthenticated, addAirtimeProfit);
serviceRouter.put("/airtime/profit", isAuthenticated, updateAirtimeProfit);
serviceRouter.get("/airtime/profits", isAuthenticated, getAirtimeProfits);

// data routes
serviceRouter.post("/data", isAuthenticated, buyData);
serviceRouter.post("/data/plan", isAuthenticated, addDataPlan);
serviceRouter.delete("/data/plan/:planId", isAuthenticated, deleteDataPlan);
serviceRouter.put("/data/plan", isAuthenticated, updateDataPlan);
serviceRouter.get("/data/plans", isAuthenticated, getDataPlans);
serviceRouter.put(
  "/data/plans/prices",
  isAuthenticated,
  updateDataPlanPriceByNetwork
);
serviceRouter.post("/data/profit", isAuthenticated, addDataProfit);
serviceRouter.get("/data/profits", isAuthenticated, getDataProfits);
// serviceRouter.put("/data/profit", isAuthenticated, updateDataProfit);

export default serviceRouter;
