import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import process from "process";
import TransactionModel from "../models/transactions.model.js";
import UserModel from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import { deposit as depositEmail } from "../Emails/deposit.js";
import { depositNotification } from "../Emails/depositNotification.js";
import { transfer } from "../Emails/transfer.js";

export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    const totalTransactions = await TransactionModel.countDocuments({
      user: req.user.id,
    });

    return res.status(StatusCodes.OK).json({
      message: "Transactions fetched successfully",
      success: true,
      transactions,
      total: totalTransactions,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find().sort({ createdAt: -1 });

    return res.status(StatusCodes.OK).json({
      message: "Transactions fetched successfully",
      success: true,
      transactions,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const updateBalance = async (req, res) => {
  const { amount, userId, type } = req.body;

  if (!amount || !userId || !type) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Provide required data",
      success: false,
    });
  }

  if (amount <= 100) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Amount must be greater than ₦100",
      success: false,
    });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "User not found",
        success: false,
      });
    }

    if (type === "debit" && user.wallet < amount) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Insufficient balance",
        success: false,
      });
    }

    const oldBalance = user.wallet;
    const newBalance =
      type === "credit"
        ? oldBalance + Number(amount)
        : oldBalance - Number(amount);

    // Update wallet
    user.wallet = newBalance;
    await user.save();

    // Create transaction
    const transaction = await TransactionModel.create({
      user: user.id,
      amount: Number(amount),
      type,
      service: "wallet",
      title: "Wallet " + (type === "credit" ? "funding" : "debit"),
      description: `Your wallet has been ${
        type === "credit" ? "credited" : "debited"
      } with ₦${amount}`,
      oldBalance,
      newBalance,
      transactionId: crypto.randomUUID(),
      reference: crypto.randomUUID(),
      status: "success",
    });

    return res.status(StatusCodes.OK).json({
      message: "Transaction successful",
      success: true,
      transaction,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
    });
  }
};

export const transactionWebhook = async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    const signatureHeader = req.headers["xixapay"];
    const calculatedSignature = crypto
      .createHmac("sha256", process.env.XIXAPAY_SECRET)
      .update(payload)
      .digest("hex");

    if (calculatedSignature !== signatureHeader) {
      return res.status(400).send("Invalid signature");
    }

    const data = req.body;

    if (data.notification_status !== "payment_successful") {
      return res.status(200).send("Not a payment_successful event");
    }

    const receiverAccountNumber = data.receiver?.account_number;

    const user = await UserModel.findOne({
      bankAccounts: { $elemMatch: { accountNumber: receiverAccountNumber } },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this account number",
      });
    }

    const amount = Number(data.amount_paid);
    const oldBalance = user.wallet;
    const newBalance = oldBalance + amount;

    user.wallet = newBalance;
    await user.save();

    await TransactionModel.create({
      user: user.id,
      amount,
      type: "credit",
      title: "Wallet Funding",
      service: "wallet",
      description: `Your wallet has been credited successfully with ₦${amount}`,
      oldBalance,
      newBalance,
      reference: data.transaction_id,
      status: "success",
    });

    // Send email
    await sendEmail(user.email, "Deposit", depositEmail(user.name, amount, newBalance));
    await sendEmail("usequestpay@gmail.com", "Deposit Notification", depositNotification(user.name, amount, newBalance));

    return res.status(200).json({
      message: "Webhook received",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendFunds = async (req, res) => {
  const { senderId, receipientEmail, amount } = req.body;

  if (!senderId || !receipientEmail || !amount) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Provide required data",
      success: false,
    });
  }

  try {
    const sender = await UserModel.findById({_id: senderId});
    const receipient = await UserModel.findOne({ email: receipientEmail });

    if (!sender) {
      return res.status(400).json({ message: "Sender not found", success: false });
    }

    if (!receipient) {
      return res.status(400).json({ message: "Recipient not found", success: false });
    }

    if (sender.wallet < amount) {
      return res.status(400).json({ message: "Insufficient funds", success: false });
    }

    const senderOldBalance = sender.wallet;
    const receipientOldBalance = receipient.wallet;

    sender.wallet -= amount;
    receipient.wallet += amount;

    await sender.save();
    await receipient.save();

    const reference = crypto.randomUUID();

    const senderTxn = new TransactionModel({
      user: sender.id,
      amount,
      status: "success",
      type: "debit",
      title: "Funds Transfer",
      service: "wallet",
      description: `Sent ₦${amount} to ${receipient.name}`,
      oldBalance: senderOldBalance,
      newBalance: sender.wallet,
      reference,
    });

    const receipientTxn = new TransactionModel({
      user: receipient.id,
      amount,
      status: "success",
      type: "credit",
      title: "Wallet Credit",
      service: "wallet",
      description: `Received ₦${amount} from ${sender.name}`,
      oldBalance: receipientOldBalance,
      newBalance: receipient.wallet,
      reference,
    });

    await senderTxn.save();
    await receipientTxn.save();

    await sendEmail(receipient.email, "Incoming Transfer", depositEmail(receipient.name, amount, receipient.wallet));
    await sendEmail(sender.email, "Wallet Transfer", transfer(sender.name, amount, sender.wallet, receipient.name));

    return res.status(200).json({
      message: `Transfer of ₦${amount} to ${receipient.name} was successful!`,
      success: true,
      data: {
        senderWallet: sender.wallet,
        receipientWallet: receipient.wallet,
        reference,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

