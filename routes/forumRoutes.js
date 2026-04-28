import express from "express";
import {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from "../controllers/forumController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POSTS
router.post("/posts", createPost);
router.get("/posts", getAllPosts);
router.get("/posts/:id", getSinglePost);
router.put("/posts/:id", authMiddleware, updatePost);
router.delete("/posts/:id", authMiddleware, deletePost);

// COMMENTS
router.post("/posts/:id/comments", authMiddleware, createComment);
router.get("/posts/:id/comments", getCommentsByPost);
router.put("/comments/:id", authMiddleware, updateComment);
router.delete("/comments/:id", authMiddleware, deleteComment);

export default router;
