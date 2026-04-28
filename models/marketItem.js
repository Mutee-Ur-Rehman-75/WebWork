import mongoose from "mongoose";

const marketItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Fruit", "Vegetable"],
      required: true,
    },
    pricePerKg: { type: Number, required: true, min: 0 },
    region: {
      type: String,
      enum: ["Federal", "Punjab", "Sindh", "Balochistan", "KPK"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" }, // for deletion later
  },
  { timestamps: true }
);

export default mongoose.model("MarketItem", marketItemSchema);
