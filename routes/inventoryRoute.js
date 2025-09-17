// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController")
// const expressLayouts = require("express-ejs-layouts");
// require("dotenv").config();
// const app = express();

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;



// const staticRoutes = require("./static");
// const baseController = require("../controllers/baseController");


// // View Engine
// app.set("view engine", "ejs");
// app.use(expressLayouts);
// app.set("layout", "./layouts/layout");

// // Index route
// app.get("/", baseController.home);

// // Other routes
// app.use(staticRoutes);

// // Server
// const port = process.env.PORT || 5500;
// const host = process.env.HOST || "localhost";

// app.listen(port, () => {
//   console.log(`App listening on ${host}:${port}`);
// });
