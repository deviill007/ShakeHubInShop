import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const { name, price, imageUrl, category } = req.body;

    // Validation check (removing mandatory check for imageUrl)
    if (!name || !price || !category) {
      return res.status(400).json({ error: "Name, price, and category are required" });
    }

    // Create the menu item (imageUrl is optional)
    const newItem = new MenuItem({ name, price, imageUrl: imageUrl || "", category });
    await newItem.save();

    return res.status(201).json({ message: "Menu item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding menu item:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
