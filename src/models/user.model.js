import { Schema, model } from "mongoose";
import { toJSONPlugin } from "../plugins/toJSONPlugin.js";

const bankDataSchema = new Schema({
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  bankId: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    bankAccounts: {
      type: [bankDataSchema],
      default: [],
    },
    otpCode: {
      type: String,
    },
    otpCodeExpires: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    shareUrl:{
      type: String,
      required:false 
    },
    shareUrlExpires:{
      type: Date,
      required:false
    }
  },
  {
    timestamps: true,
  }
);

bankDataSchema.plugin(toJSONPlugin);
userSchema.plugin(toJSONPlugin);

const UserModel = model("User", userSchema);

export default UserModel;
