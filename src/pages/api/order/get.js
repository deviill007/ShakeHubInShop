import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { toast } from "react-toastify";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const pendingOrders = await Order.find({ status: "pending" }).sort({ createdAt: -1 }); // Fetch only pending orders, sorted by latest

      return res.status(200).json({ success: true, orders: pendingOrders });
    } catch (error) {
     toast.error("Error fetching orders:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
