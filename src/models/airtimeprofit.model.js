import mongoose from "mongoose";


const AirtimeProfitSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["MTN", "Glo", "Airtel", "9mobile"],
    required: true,
  },
  profit: {
    type: Number,
    default: 0,
  },
});

const AirtimeProfitModel = mongoose.model("AirtimeProfit", AirtimeProfitSchema);
export default AirtimeProfitModel;