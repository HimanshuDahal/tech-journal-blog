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

exports.editForm = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.session.user.id) {
    req.flash("error", "Not authorized");
    return res.redirect("/posts");
  }
  res.render("posts/edit", { post });
};

exports.update = async (req, res) => {
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
  req.flash("success", "Post updated");
  res.redirect(`/posts/${post._id}`);
};

exports.remove = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post || post.author.toString() !== req.session.user.id) {
    req.flash("error", "Not authorized");
    return res.redirect("/posts");
  }
  await post.deleteOne();
  req.flash("success", "Post deleted");
  res.redirect("/posts");
};
