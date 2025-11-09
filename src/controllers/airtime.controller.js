import { AxiosError } from "axios";
import { StatusCodes } from "http-status-codes";
import { networks } from "../utils/data.js";
import Transaction from "../models/transactions.model.js";
import User from "../models/user.model.js";
import { aodataApi } from "../config/aodataApi.js";
import AirtimeProfitModel from "../models/airtimeprofit.model.js";

export const buyAirtime = async (req, res) => {
  const { networkId, mainAmount, discountedAmount, phone } = req.body;

  if (!networkId || !mainAmount || !discountedAmount || !phone) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "networkId, amount, and phone are required",
    });
  }

  try {
    if (Number(req.user.wallet) < Number(discountedAmount)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Insufficient balance",
      });
    }

    const payload = {
      network: networkId,
      phone,
      plan_type: "VTU",
      bypass: false,
      amount: mainAmount,
      "request-id": crypto.randomUUID(),
    };

    const response = await aodataApi.post("/topup", payload);

    const network = networks.find((network) => network.id === networkId);

    const transaction = await Transaction.create({
      user: req.user.id,
      amount: Number(discountedAmount),
      type: "debit",
      title: "Airtime purchase",
      description: `Purchased ₦${mainAmount} airtime for ${phone} on ${network.name} for ₦${discountedAmount}`,
      service: "airtime",
      oldBalance: Number(req.user.wallet),
      newBalance: Number(req.user.wallet) - Number(discountedAmount),
      transactionId: crypto.randomUUID(),
      reference: crypto.randomUUID(),
      status: response.data.status === "success" ? "success" : "failed",
    });

    if (transaction.status === "success") {
      await User.findByIdAndUpdate(req.user.id, {
        wallet: Number(req.user.wallet) - Number(discountedAmount),
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "Airtime purchase successful!",
      success: true,
      data: {
        amount: discountedAmount,
        phone,
        network: network.name,
        message: `Purchased ₦${mainAmount} airtime for ${phone} on ${network.name} for ₦${discountedAmount}`,
        status: response.data.status,
        transactionId: transaction.id,
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

export const addAirtimeProfit = async (req, res) => {
  const { name, profit } = req.body;
  if (!name || !profit) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Name and profit are required",
    });
  }
  try {
    const existingProfit = await AirtimeProfitModel.findOne({ name });
    if (existingProfit) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Airtime profit already exists",
      });
    }
    const airtimeProfit = await AirtimeProfitModel.create({
      name,
      profit,
    });
    const airtimeObject = airtimeProfit.toObject();
    delete airtimeObject._id;
    delete airtimeObject.__v;
    res.status(StatusCodes.OK).json({
      message: "Airtime profit added successfully",
      success: true,
      data: airtimeObject,
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

export const updateAirtimeProfit = async (req, res) => {
  const { name, profit } = req.body;
  if (!name || !profit) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Name and profit are required",
    });
  }
  try {
    const airtimeProfit = await AirtimeProfitModel.findOneAndUpdate(
      { name },
      { profit },
      { new: true }
    );
    if (!airtimeProfit) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Airtime profit not found",
      });
    }
    const airtimeObject = airtimeProfit.toObject();
    delete airtimeObject._id;
    delete airtimeObject.__v;
    res.status(StatusCodes.OK).json({
      message: "Airtime profit updated successfully",
      success: true,
      data: airtimeObject,
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

export const getAirtimeProfits = async (req, res) => {
  try {
    const airtimeProfits = await AirtimeProfitModel.find();
    const airtimeObject = airtimeProfits.map((airtime) => {
      const airtimeObject = airtime.toObject();
      delete airtimeObject._id;
      delete airtimeObject.__v;
      return airtimeObject;
    });
    res.status(StatusCodes.OK).json({
      message: "Airtime profits fetched successfully",
      success: true,
      data: airtimeObject,
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
