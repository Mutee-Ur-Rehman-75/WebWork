
import express from "express";
import { register, login } from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "Authenticated route", user: req.user });
});
router.post("/logout", authMiddleware, (req, res) => {});

export default router;
