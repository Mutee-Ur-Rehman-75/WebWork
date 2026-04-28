import express from "express";
import {
    addItem,
    getItems,
    updateItem,
    deleteItem,
} from "../controllers/marketItemContollers.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin Routes
router.post("/add", authMiddleware, upload.single("image"), addItem);
router.get("/", authMiddleware, getItems);
router.put("/:id", authMiddleware, upload.single("image"), updateItem);
router.delete("/:id", authMiddleware, deleteItem);

export default router;
