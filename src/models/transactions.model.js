import { Schema, model } from "mongoose";
import { toJSONPlugin } from "../plugins/toJSONPlugin.js";
import { autoPopulateUser } from "../plugins/autoPopulateUser.js";

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      enum: ["airtime", "data", "cable", "electricity", "bill", "wallet"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    oldBalance: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    },

    reference: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.plugin(toJSONPlugin)
transactionSchema.plugin(autoPopulateUser)

const TransactionModel = model("Transaction", transactionSchema);

export default TransactionModel;
