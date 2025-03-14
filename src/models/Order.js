import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true }, // To track user sessions
    table: { type: String, required: true },
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "in-progress", "ready"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
