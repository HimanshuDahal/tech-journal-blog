require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const connectDB = require("./config/db");

// --- Initialize app FIRST ---
const app = express();

// --- Middleware ---
app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);

app.use(flash());

// --- Views ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Static ---
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// --- Globals ---
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// --- Routes ---
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

app.use("/", homeRoutes);
app.use("/auth", authRoutes);
app.use("/posts", postRoutes);

// --- Errors ---
app.use((req, res) => res.status(404).render("home/404"));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("home/500", { error: err.message });
});

// --- Start server ---
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    const port = process.env.PORT || 3000;
    app.listen(port, () =>
      console.log(`Server running on http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  }
})();
