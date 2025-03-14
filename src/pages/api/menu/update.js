import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "PUT") {
    try {
      const { id, name, price, category, imageUrl } = req.body;
      
      const updateFields = { name, price, category };
      if (imageUrl) updateFields.imageUrl = imageUrl; // Only update image if provided

      const updatedItem = await MenuItem.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );

      return res.status(200).json({ success: true, item: updatedItem });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update item" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
