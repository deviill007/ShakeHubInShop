import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: false }, // Image is now optional
  category: { 
    type: String, 
    required: true,
    enum: ["Shake", "Special", "Juice", "Icecream Cup", "Pizza", "Burger", "Grill Sandwich", "Sandwich", "Mojio"],
  },
});

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
