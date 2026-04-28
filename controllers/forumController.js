import Post from "../models/Post.js";
import Comment from "../models/comment.js";

// ✅ Create a new Post
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log("Creating post for user:", req.user);
    
    if (!req.user?._id) {
      return res.status(401).json({ message: "You must be logged in to create a post" });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
    });

    // Immediately populate the author details for the frontend
    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to create post",
      details: error.errors?.author?.message || error.message
    });
  }
};

// ✅ Get all Posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single Post
export const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate({
        path: "comments",
        populate: { path: "author", select: "name email" },
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Post
export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    post.title = title || post.title;
    post.content = content || post.content;
    const updatedPost = await post.save();

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create Comment
export const createComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await Comment.create({
      commentText,
      author: req.user._id,
      post: post._id,
    });

    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Comments for a Post
export const getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Comment
export const updateComment = async (req, res) => {
  try {
    const { commentText } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    comment.commentText = commentText || comment.commentText;
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized" });

    await comment.deleteOne();

    // remove from Post.comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
