const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();
const app = express();

const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const baseController = require("./controllers/baseController");
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities/");

// View Engine
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Index route
app.get("/", baseController.buildHome);

// Inventory routes
app.use("/inv", inventoryRoute);

// Other routes
app.use(staticRoutes);
app.use("/", errorRoute); // ✅ Moved here before error handlers

// File Not Found Route (404) - keep only ONE
app.use((req, res, next) => {
  const error = new Error("Sorry, we appear to have lost that page.");
  error.status = 404;
  next(error);
});

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status === 404 ? "404 Not Found" : "Server Error",
    message: err.message,
    status: err.status || 500,
    nav,
  });
});

// Server
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
