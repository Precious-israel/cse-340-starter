const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

const app = express();

// Routes and utilities
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const errorRoute = require("./routes/errorRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities/");
const pool = require("./database/");

/// -------------------------
// Middleware
// -------------------------

// Session setup
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // handles form data

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Serve static files (CSS, JS, etc.)
app.use(express.static("public"));


// -------------------------
// View Engine
// -------------------------

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// -------------------------
// Routes
// -------------------------

// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Feature routes
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);


// Static and error routes
app.use(staticRoutes);
app.use("/", errorRoute); // catch-all for unhandled paths

// -------------------------
// 404 Not Found Handler
// -------------------------

app.use((req, res, next) => {
  const error = new Error("Sorry, we appear to have lost that page.");
  error.status = 404;
  next(error);
});

// -------------------------
// Express Global Error Handler
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
  console.log(`App listening on ${host}:${port}`);
});
