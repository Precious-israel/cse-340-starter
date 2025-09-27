const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities"); // Validation and utilities

// Wrap async controller methods for error handling
const handleErrors = utilities.handleErrors;

// ----- Existing Routes -----

// Route to build inventory by classification view
router.get("/type/:classificationId", handleErrors(invController.buildByClassificationId));

// Route to display specific vehicle details
router.get("/detail/:inv_id", handleErrors(invController.buildByInventoryId));

// ----- Task 1: Inventory Management View -----
router.get("/", handleErrors(invController.buildManagement));

// ----- Task 2: Add Classification View -----
router.get("/add-classification", handleErrors(invController.buildAddClassification));

// Process Add Classification Form
router.post(
  "/add-classification",
  utilities.classificationRules(),
  utilities.checkClassificationData,
  handleErrors(invController.addClassification)
);

// ----- Task 3: Add Inventory View -----
router.get("/add-inventory", handleErrors(invController.buildAddInventory));

// Process Add Inventory Form
router.post(
  "/add-inventory",
  utilities.vehicleRules(),
  utilities.checkVehicleData,
  handleErrors(invController.addInventory)
);



module.exports = router;
