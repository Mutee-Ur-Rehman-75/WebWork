import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import MarketItem from "../models/marketItem.js";

// ➕ Create Item with Image Upload
export const addItem = async (req, res) => {
  try {
    const { name, category, pricePerKg, region, date } = req.body;

    if (!name || !category || !pricePerKg || !region)
      return res.status(400).json({ message: "All fields are required" });

    let imageUrl = "";
    let imagePublicId = "";

    // Upload image if provided
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "market_items",
        resource_type: "image",
      });

      imageUrl = uploadResult.secure_url;
      imagePublicId = uploadResult.public_id;

      // delete local temp file
      fs.unlinkSync(req.file.path);
    }

    const newItem = await MarketItem.create({
      name,
      category,
      pricePerKg,
      region,
      date,
      imageUrl,
      imagePublicId,
    });

    res.status(201).json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding item", error: error.message });
  }
};

// 📖 Get All Items
export const getItems = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = {
      name: { $regex: search, $options: "i" },
    };

    const items = await MarketItem.find(query).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error: error.message });
  }
};

// ✏️ Update Item (and replace image if uploaded)
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MarketItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.file) {
      // delete old image from Cloudinary if exists
      if (item.imagePublicId) await cloudinary.uploader.destroy(item.imagePublicId);

      // upload new image
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "market_items",
        resource_type: "image",
      });

      req.body.imageUrl = uploadResult.secure_url;
      req.body.imagePublicId = uploadResult.public_id;

      // remove local file
      fs.unlinkSync(req.file.path);
    }

    const updatedItem = await MarketItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Item updated", item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error: error.message });
  }
};

// ❌ Delete Item (remove from DB and Cloudinary)
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MarketItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.imagePublicId) await cloudinary.uploader.destroy(item.imagePublicId);

    await item.deleteOne();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error: error.message });
  }
};
