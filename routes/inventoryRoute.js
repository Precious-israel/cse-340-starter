const express = require("express");
const router = new express.Router();
const invCont = require("../controllers/invController");
const utilities = require("../utilities");

// ===== Public Inventory Views ===== //
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invCont.buildByInventoryId));
router.get("/", utilities.handleErrors(invCont.buildManagement));

// ===== Admin / Employee Only: Add Classification ===== //
router.get("/add-classification", utilities.requireAuth, utilities.handleErrors(invCont.buildAddClassification));
router.post(
  "/add-classification",
  utilities.requireAuth,
  utilities.classificationRules(),
  utilities.checkClassificationData,
  utilities.handleErrors(invCont.addClassification)
);

// ===== Admin / Employee Only: Add Inventory ===== //
router.get("/add-inventory", utilities.requireAuth, utilities.handleErrors(invCont.buildAddInventory));
router.post(
  "/add-inventory",
  utilities.requireAuth,
  utilities.vehicleRules(),
  utilities.checkVehicleData,
  utilities.handleErrors(invCont.addInventory)
);

// ===== AJAX Inventory JSON Fetch (Public) ===== //
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJSON));

// ===== Admin / Employee Only: Edit Inventory ===== //
router.get("/edit/:inv_id", utilities.requireAuth, utilities.handleErrors(invCont.editInventoryView));

// ===== Admin / Employee Only: Update Inventory ===== //
router.post(
  "/update",
  utilities.requireAuth,
  utilities.vehicleRules(),
  utilities.checkVehicleData,
  utilities.handleErrors(invCont.updateInventory)
);

// ===== Admin / Employee Only: Delete Inventory ===== //
router.get("/delete/:inv_id", utilities.requireAuth, utilities.handleErrors(invCont.buildDeleteConfirm));
router.post("/delete", utilities.requireAuth, utilities.handleErrors(invCont.deleteInventoryItem));

module.exports = router;