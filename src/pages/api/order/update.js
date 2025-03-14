import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "PUT") {
    try {
      const { orderId } = req.body;

      // Find the order and update its status to "ready"
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: "ready" },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      return res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
