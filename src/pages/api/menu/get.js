import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const menuItems = await MenuItem.find({});
    return res.status(200).json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
