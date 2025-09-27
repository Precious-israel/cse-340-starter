const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path"); // ✅ Needed for robust static file pathing
const app = express();

// Database and utilities
const pool = require("./database/");
const utilities = require("./utilities/");

// Routes and controllers
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const errorRoute = require("./routes/errorRoute");
const baseController = require("./controllers/baseController");

// -------------------------
// Middleware
// -------------------------

// ✅ Session setup
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,              // ✅ Use false to avoid unnecessary session writes
    saveUninitialized: true,   // ✅ Only save session if something is stored
    name: "sessionId",
    cookie: {
      maxAge: 1000 * 60 * 60, // Optional: 1 hour expiration
      secure: false, // set to true if using HTTPS
      httpOnly: true,
    },
  })
);

// ✅ Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  res.locals.loggedin = req.session.loggedin || false; // Optional: useful for UI
  next();
});

// ✅ Serve static files robustly
app.use(express.static(path.join(__dirname, "public"))); // <-- FIXED

// -------------------------
// View Engine
// -------------------------

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// -------------------------
// Routes
// -------------------------

app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

// Static and error routes
app.use(staticRoutes);
app.use("/", errorRoute); // catch-all route

// -------------------------
// 404 Not Found Handler
// -------------------------

app.use((req, res, next) => {
  const error = new Error("Sorry, we appear to have lost that page.");
  error.status = 404;
  next(error);
});

// -------------------------
// Global Error Handler
// -------------------------

app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  const status = err.status || 500;
  const message =
    status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  res.status(status).render("errors/error", {
    title: status === 404 ? "Not Found" : "Server Error",
    message,
    status,
    nav,
  });
});

// -------------------------
// Start Server
// -------------------------

const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
