import { AxiosError } from "axios";
import User from "../models/user.model.js";
import process from "process"
import { xixaApi } from "../config/xixapay.js";

const BUSINESS_ID = process.env.XIXAPAY_BUSINESS_ID


export const updateUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required to update user",
    });
  }

  try {
    const user = await User.findOneAndUpdate({ email }, req.body, {
      new: true,
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const createBankAccount = async (req, res) => {
  const { idNumber } = req.body;

  try {
    const user = await User.findById(req.user._id); 

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const payload = {
      email: user.email,
      name: user.name,
      phoneNumber: user.phone,
      bankCode: ["20867"], 
      businessId: BUSINESS_ID,
      accountType: "static",
      id_type: "nin",
      id_number: idNumber,
    };

    const response = await xixaApi.post("/createVirtualAccount", payload);

    if (response.data.status === "success") {
      const bankAccounts = response.data.bankAccounts;

      const formattedAccounts = bankAccounts.map((account) => ({
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        accountHolderName: account.accountName,
        bankId: account.Reserved_Account_Id,
      }));

      user.bankAccounts.push(...formattedAccounts);

      await user.save();

      return res.status(201).json({
        success: true,
        message: "Bank account(s) created successfully",
        bankAccounts: user.bankAccounts,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to create virtual account",
        response: response.data,
      });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.error || "Axios request failed",
        error: error.message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};


