const express = require("express")
const router = new express.Router()
const invCont = require("../controllers/invController")
const utilities = require("../utilities")
const checkAccountType = require("../utilities/checkAccountType") // ✅ middleware

const handleErrors = utilities.handleErrors

// ===== Public Inventory Views ===== //
router.get("/type/:classificationId", handleErrors(invCont.buildByClassificationId))
router.get("/detail/:inv_id", handleErrors(invCont.buildByInventoryId))
router.get("/", handleErrors(invCont.buildManagement))

// ===== Admin / Employee Only: Add Classification ===== //
router.get("/add-classification", checkAccountType, handleErrors(invCont.buildAddClassification))
router.post(
  "/add-classification",
  checkAccountType,
  utilities.classificationRules(),
  utilities.checkClassificationData,
  handleErrors(invCont.addClassification)
)

// ===== Admin / Employee Only: Add Inventory ===== //
router.get("/add-inventory", checkAccountType, handleErrors(invCont.buildAddInventory))
router.post(
  "/add-inventory",
  checkAccountType,
  utilities.vehicleRules(),
  utilities.checkVehicleData,
  handleErrors(invCont.addInventory)
)

// ===== AJAX Inventory JSON Fetch (Public) ===== //
router.get("/getInventory/:classification_id", handleErrors(invCont.getInventoryJSON))

// ===== Admin / Employee Only: Edit Inventory ===== //
router.get("/edit/:inv_id", checkAccountType, handleErrors(invCont.editInventoryView))

// ===== Admin / Employee Only: Update Inventory ===== //
router.post(
  "/update",
  checkAccountType,
  utilities.vehicleRules(),
  utilities.checkVehicleData,
  handleErrors(invCont.updateInventory)
)

// ===== Admin / Employee Only: Delete Inventory ===== //
router.get("/delete/:inv_id", checkAccountType, handleErrors(invCont.buildDeleteConfirm))
router.post("/delete", checkAccountType, handleErrors(invCont.deleteInventoryItem))

module.exports = router
