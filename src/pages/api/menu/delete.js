import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await MenuItem.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Item deleted" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete item" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
