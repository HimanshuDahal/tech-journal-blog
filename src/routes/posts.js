const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Middleware to protect routes
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash("error", "You must be logged in first!");
  res.redirect("/auth/login");
}

// GET all posts (with optional search)
router.get("/", async (req, res) => {
  try {
    let query = {};
    if (req.query.q) {
      query = { title: new RegExp(req.query.q, "i") };
    }
    const posts = await Post.find(query).populate("author");
    res.render("posts/list", { posts });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error fetching posts");
    res.redirect("/");
  }
});

// GET new post form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("posts/create");
});

// POST create new post
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;

    console.log("Session user at post creation:", req.session.user);

    await Post.create({
      title,
      content,
      author: req.session.user._id,
    });

    req.flash("success", "Post created successfully!");
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error creating post");
    res.redirect("/posts");
  }
});

// GET edit form
router.get("/:id/edit", isLoggedIn, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      req.flash("error", "Post not found");
      return res.redirect("/posts");
    }
    res.render("posts/edit", { post });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading edit form");
    res.redirect("/posts");
  }
});

// UPDATE post
router.post("/:id", isLoggedIn, async (req, res) => {
  try {
    const { title, content } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { title, content });
    req.flash("success", "Post updated successfully!");
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating post");
    res.redirect("/posts");
  }
});

// DELETE post
router.post("/:id/delete", isLoggedIn, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    req.flash("success", "Post deleted successfully!");
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error deleting post");
    res.redirect("/posts");
  }
});

module.exports = router;
