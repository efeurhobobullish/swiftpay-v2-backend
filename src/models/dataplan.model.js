import mongoose from "mongoose";

const DataProfitSchema = new mongoose.Schema({
  network: {
    type: String,
    enum: ["MTN", "Glo", "Airtel", "9mobile"],
    required: true,
  },
  profit: {
    type: Number,
    default: 0,
  },
});

const DataPlanSchema = new mongoose.Schema(
  {
    planId: {
      type: Number,
      required: true,
    },
    days: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      enum: ["MTN", "Glo", "Airtel", "9mobile"],
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    volume: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const DataProfitModel = mongoose.model("DataProfit", DataProfitSchema);
const DataPlanModel = mongoose.model("DataPlan", DataPlanSchema);

export { DataProfitModel, DataPlanModel };
