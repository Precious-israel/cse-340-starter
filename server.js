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
app.get("/", utilities.handleErrors(baseController.buildHome));


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
  const nav = await utilities.getNav();
  const status = err.status || 500;
  const message = status === 404
    ? err.message
    : 'Oh no! There was a crash. Maybe try a different route?';

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  res.status(status).render("errors/error", {
    title: status === 404 ? "404 Not Found" : "Server Error",
    message,
    status,  // ✅ Pass it explicitly to the view
    nav
  });
});

// Server
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
