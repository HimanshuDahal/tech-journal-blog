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

const app = express();

app.use(helmet());
app.use(compression());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 },
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  })
);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const homeRoutes = require("./routes/home");
app.use("/", homeRoutes);

app.use((req, res) => res.status(404).render("home/404"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("home/500");
});

(async () => {
  await connectDB(process.env.MONGODB_URI);
  const port = process.env.PORT || 3000;
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`)
  );
})();
