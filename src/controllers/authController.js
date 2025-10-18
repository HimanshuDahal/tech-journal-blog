const User = require("../models/User");

exports.getSignup = (req, res) => res.render("auth/signup");
exports.getLogin = (req, res) => res.render("auth/login");

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password, confirm } = req.body;
    if (password !== confirm) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/auth/signup");
    }
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ username, email, passwordHash });
    req.session.user = { id: user._id, username: user.username };
    req.flash("success", "Signup successful");
    res.redirect("/");
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/auth/signup");
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.validatePassword(password))) {
      req.flash("error", "Invalid credentials");
      return res.redirect("/auth/login");
    }
    req.session.user = { id: user._id, username: user.username };
    req.flash("success", "Welcome back");
    res.redirect("/");
  } catch (err) {
    req.flash("error", "Login failed");
    res.redirect("/auth/login");
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/"));
};
