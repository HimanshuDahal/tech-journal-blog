const Post = require("../models/Post");

// 📄 List all posts (with optional search)
exports.list = async (req, res) => {
  try {
    const query = req.query.q;
    let filter = {};

    if (query) {
      // Case-insensitive search in title or content
      filter = {
        $or: [
          { title: new RegExp(query, "i") },
          { content: new RegExp(query, "i") },
        ],
      };
    }

    const posts = await Post.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.render("posts/list", { posts });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load posts");
    res.redirect("/");
  }
};

// 🆕 Show create form
exports.createForm = (req, res) => {
  res.render("posts/create");
};

// 📝 Create a new post
exports.create = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await Post.create({
      title,
      content,
      category,
      tags: (tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      author: req.session.user.id,
    });
    req.flash("success", "Post created successfully");
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create post");
    res.redirect("/posts/new");
  }
};

// 🔍 Show a single post
exports.detail = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!post) {
      return res.status(404).render("home/404");
    }
    res.render("posts/detail", { post });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load post");
    res.redirect("/posts");
  }
};

// ✏️ Show edit form
exports.editForm = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.author.toString() !== req.session.user.id) {
      req.flash("error", "Not authorized");
      return res.redirect("/posts");
    }
    res.render("posts/edit", { post });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load edit form");
    res.redirect("/posts");
  }
};

// 💾 Update a post
exports.update = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post || post.author.toString() !== req.session.user.id) {
      req.flash("error", "Not authorized");
      return res.redirect("/posts");
    }

    post.title = title;
    post.content = content;
    post.category = category;
    post.tags = (tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await post.save();
    req.flash("success", "Post updated successfully");
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update post");
    res.redirect("/posts");
  }
};

// 🗑️ Delete a post
exports.remove = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.author.toString() !== req.session.user.id) {
      req.flash("error", "Not authorized");
      return res.redirect("/posts");
    }
    await post.deleteOne();
    req.flash("success", "Post deleted successfully");
    res.redirect("/posts");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete post");
    res.redirect("/posts");
  }
};
