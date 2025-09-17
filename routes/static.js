const express = require("express");
const path = require("path");
const router = express.Router();

// Serve the whole public folder
router.use(express.static(path.join(__dirname, "..", "public")));

// Optional: explicit sub-folders (all point to the same public dir)
router.use("/css", express.static(path.join(__dirname, "..", "public", "css")));
router.use("/js", express.static(path.join(__dirname, "..", "public", "js")));
router.use("/images", express.static(path.join(__dirname, "..", "public", "images")));

module.exports = router;
