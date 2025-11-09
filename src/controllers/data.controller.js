import { StatusCodes } from "http-status-codes";
import { aodataApi } from "../config/aodataApi.js";
import Transaction from "../models/transactions.model.js";
import { networks } from "../utils/data.js";
import User from "../models/user.model.js";
import { AxiosError } from "axios";
import sendEmail from "../utils/sendEmail.js";
import { data as dataEmail } from "../Emails/data.js";
import { DataPlanModel, DataProfitModel } from "../models/dataplan.model.js";

export const buyData = async (req, res) => {
  const { networkId, planId, planAmount, planName, phone } = req.body;

  if (!networkId || !planId || !phone || !planName || !planAmount) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message:
        "networkId, planId, planName, planAmount, and phone are required",
    });
  }

  try {
    if (Number(req.user.wallet) < Number(planAmount)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Insufficient balance",
      });
    }

    const payload = {
      network: networkId,
      phone,
      data_plan: planId,
      bypass: false,
      "request-id": crypto.randomUUID(),
    };

    const response = await aodataApi.post("/data", payload);

    const network = networks.find((network) => network.id === networkId);

    const transaction = await Transaction.create({
      user: req.user.id,
      amount: Number(planAmount),
      type: "debit",
      title: "Data purchase",
      service:"data",
      description: `Purchased ${planName} for ${phone} on ${network.name}`,
      oldBalance: Number(req.user.wallet),
      newBalance: Number(req.user.wallet) - Number(planAmount),
      reference: crypto.randomUUID(),
      status: response.data.status === "success" ? "success" : "failed",
    });

    if (transaction.status === "success") {
      await User.findByIdAndUpdate(req.user._id, {
        wallet: Number(req.user.wallet) - Number(planAmount),
      });
    }

    const newBalance = Number(req.user.wallet) - Number(planAmount)

    await sendEmail(
      req.user.email,
      "Data Purchase",
      dataEmail(req.user.name, planName, newBalance, phone)
    );

    return res.status(StatusCodes.OK).json({
      message: "Data purchase successful!",
      success: true,
      data: {
        amount: Number(planAmount),
        phone,
        network: network.name,
        message: `Purchased ${planName} for ${phone} on ${network.name}`,
        status: response.data.status,
        transactionId: transaction._id,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.log(error);

    if (error instanceof AxiosError) {
      return res.status(error.response.status).json({
        message: error.response.data.message,
      });
    } else if (error instanceof Error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const addDataPlan = async (req, res) => {
  const { planId, days, network, planType, volume, price, extension } =
    req.body;
  if (
    !planId ||
    !days ||
    !network ||
    !planType ||
    !volume ||
    !price ||
    !extension
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "All fields are required",
    });
  }
  try {
    const existingPlan = await DataPlanModel.findOne({ planId });
    if (existingPlan) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Plan ID already exists",
        success: false,
      });
    }

    const profitObj = await DataProfitModel.findOne({ network });
    if (!profitObj) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Network not found, please add the network first",
        success: false,
      });
    }

    const dataPlan = await DataPlanModel.create({
      planId,
      days: Number(days) > 1 ? `${days} days` : `${days} day`,
      network,
      planType,
      volume,
      price: Math.ceil(price * (1 + profitObj.profit / 100)),
      originalPrice: price,
      extension,
      planName: `${network} ${planType} ${volume}${extension}`,
    });

    const dataObject = dataPlan.toObject();
    delete dataObject._id;
    delete dataObject.__v;

    res.status(StatusCodes.OK).json({
      message: "Data plan added successfully",
      success: true,
      data: dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const deleteDataPlan = async (req, res) => {
  const { planId } = req.params;
  if (!planId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Plan ID is required",
    });
  }
  try {
    const dataPlan = await DataPlanModel.findOneAndDelete({ planId });
    if (!dataPlan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Data plan not found",
      });
    }
    res.status(StatusCodes.OK).json({
      message: "Data plan deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const updateDataPlan = async (req, res) => {
  const { planId } = req.body;
  if (!planId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Plan ID is required",
    });
  }
  try {
    const dataPlan = await DataPlanModel.findOneAndUpdate(
      { planId },
      { ...req.body, planName: `${req.body.network} ${req.body.planType} ${req.body.volume}${req.body.extension}` },
      { new: true, runValidators: true }
    );
    if (!dataPlan) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Data plan not found",
      });
    }

    const dataObject = dataPlan.toObject();
    delete dataObject._id;
    delete dataObject.__v;
    res.status(StatusCodes.OK).json({
      message: "Data plan updated successfully",
      success: true,
      data: dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

export const getDataPlans = async (req, res) => {
  try {
    const dataPlans = await DataPlanModel.find();

    const plans = dataPlans.map((plan) => {
      return {
        planId: plan.planId,
        days: plan.days,
        network: plan.network,
        planType: plan.planType,
        volume: plan.volume,
        price: plan.price,
        extension: plan.extension,
        planName: plan.planName,
      };
    });

    res.status(StatusCodes.OK).json({
      message: "Data plans fetched successfully",
      success: true,
      data: plans,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const updateDataPlanPriceByNetwork = async (req, res) => {
  const { network, topupPercent } = req.body;
  if (!network || topupPercent == null) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Network and topup percent are required",
    });
  }

  try {
    const dataPlans = await DataPlanModel.find({ network });
    const profit = await DataProfitModel.findOne({ network });
    if (!profit) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Profit not found",
      });
    }
   

    await Promise.all(
      dataPlans.map(async (plan) => {
        plan.price = Math.ceil(plan.originalPrice * (1 + topupPercent / 100));
        await plan.save();
      })
    );

    profit.profit = topupPercent;
    await profit.save();

    res.status(StatusCodes.OK).json({
      message: "Data plans updated successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};


export const addDataProfit = async (req, res) => {
  const { network, profit } = req.body;
  if (!network) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Network and profit are required",
    });
  }
  try {
    const existingProfit = await DataProfitModel.findOne({ network });
    if (existingProfit) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Profit already exists",
        success: false,
      });
    }
    const dataProfit = await DataProfitModel.create({
      network,
      profit,
    });

    const dataObject = dataProfit.toObject();
    delete dataObject._id;
    delete dataObject.__v;

    res.status(StatusCodes.OK).json({
      message: "Data profit added successfully",
      success: true,
      data: dataObject,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getDataProfits = async (req, res) => {
  try {
    const dataProfits = await DataProfitModel.find();
    const dataObject = dataProfits.map((profit) => {
      const profitObj = profit.toObject();
      delete profitObj._id;
      delete profitObj.__v;
      return profitObj;
    });
    res.status(StatusCodes.OK).json({
      message: "Data profits fetched successfully",
      success: true,
      data: dataObject,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};

// export const updateDataProfit = async (req, res) => {
//   const { name, profit } = req.body;
//   if (!name || !profit) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       message: "Name and profit are required",
//     });
//   }
//   try {
//     const dataProfit = await DataProfitModel.findOneAndUpdate(
//       { name },
//       { profit },
//       { new: true }
//     );
//     const dataObject = dataProfit.toObject();
//     delete dataObject._id;
//     delete dataObject.__v;
//     res.status(StatusCodes.OK).json({
//       message: "Data profit updated successfully",
//       success: true,
//       data: dataObject,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: "Internal server error",
//       error: error.message,
//       success: false,
//     });
//   }
// };


