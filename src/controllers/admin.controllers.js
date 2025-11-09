import Transaction from "../models/transactions.model.js";
import User from "../models/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({createdAt: -1});
    return res.status(200).json({
      message: "Users fetched Successfully!",
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getNetworth = async (req, res) => {
    try {
      const result = await Transaction.aggregate([
        {
          $match: {
            service: "wallet",
            status: "success",
          },
        },
        {
          $sort: { createdAt: -1 } // newest first
        },
        {
          $group: {
            _id: "$userId",
            latestNewBalance: { $first: "$newBalance" },
          },
        },
        {
          $group: {
            _id: null,
            networth: { $sum: "$latestNewBalance" },
          },
        },
      ]);
  
      const networth = result[0]?.networth || 0;
  
      return res.status(200).json({
        success: true,
        networth,
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  
