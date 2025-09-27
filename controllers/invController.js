const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/* ***************************
 * Task 1: Build Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Task 2: Show Add Classification Form
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Task 2: Handle Add Classification Form Submission
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;
  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("success", `Successfully added "${classification_name}" classification.`);
      return res.redirect("/inv/");
    } else {
      req.flash("error", "Failed to add classification. Please try again.");
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Task 3: Show Add Inventory Form
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      // default empty form values
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    next(error);
  }
};

// inventoryController.js
const inventoryController = {}

inventoryController.buildManagementView = async (req, res) => {
  try {
    const messages = req.flash("info")
    res.render("inventory/management", {
      title: "Inventory Management",
      messages
    })
  } catch (error) {
    console.error("Error building management view:", error)
    res.status(500).send("Server Error")
  }
}

// Placeholder for Task 2 & 3
inventoryController.buildAddClassificationView = (req, res) => {
  res.render("inventory/add-classification", { title: "Add Classification" })
}

inventoryController.buildAddInventoryView = (req, res) => {
  res.render("inventory/add-inventory", { title: "Add Inventory" })
}

module.exports = inventoryController



/* ***************************
 * Task 3: Handle Add Inventory Form Submission
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    } = req.body;

    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });

    if (result) {
      req.flash("success", `Successfully added ${inv_year} ${inv_make} ${inv_model}.`);
      return res.redirect("/inv/");
    } else {
      req.flash("error", "Failed to add vehicle. Please try again.");
      return res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Existing: Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0]?.classification_name || "No Vehicles Found";
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 * Existing: Build vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.inv_id);
    const nav = await utilities.getNav();

    const vehicleData = await invModel.getVehicleById(invId);
    if (!vehicleData) {
      const error = new Error("Vehicle not found.");
      error.status = 404;
      throw error;
    }

    const vehicleHtml = utilities.buildVehicleDetail(vehicleData);

    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
