const Post = require("../models/Post");

exports.list = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.render("posts/list", { posts });
};

exports.createForm = (req, res) => res.render("posts/create");

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
    req.flash("success", "Post created");
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    req.flash("error", "Failed to create post");
    res.redirect("/posts/new");
  }
};

exports.detail = async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "username"
  );
  if (!post) return res.status(404).render("home/404");
  res.render("posts/detail", { post });
};
