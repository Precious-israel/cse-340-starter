const { validationResult } = require("express-validator");
const utilities = require("./utilities"); // adjust path as needed

/**
 * Check inventory data and return errors.
 * Redirect back to add-inventory view on errors.
 */
async function checkInventoryData(req, res, next) {
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

  // Get validation errors from request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Await getNav
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
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
    return;
  }
  next();
}

/**
 * Check inventory data and return errors.
 * Redirect back to edit-inventory view on errors.
 */
async function checkUpdateData(req, res, next) {
  const {
    inv_id,
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

  // Get validation errors from request
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav(); // Await getNav
    res.render("inventory/edit-inventory", {  // Correct view name
      title: "Edit Vehicle",
      nav,
      errors: errors.array(),
      inv_id,
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
    return;
  }
  next();
}

module.exports = {
  checkInventoryData,
  checkUpdateData,
};
