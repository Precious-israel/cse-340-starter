const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ****************************************
 * Constructs the nav HTML unordered list
 * *************************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += "<li>";
      list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    throw error;
  }
};

/* ****************************************
 * Build the classification grid for inventory listing
 * *************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"></a>`;
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`;
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ****************************************
 * Build the vehicle detail view
 * *************************************** */
Util.buildVehicleDetail = function (vehicle) {
  const formatter = new Intl.NumberFormat("en-US");
  const price = formatter.format(vehicle.inv_price);
  const miles = formatter.format(vehicle.inv_miles);

  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p><strong>Price:</strong> $${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      </div>
    </div>
  `;
};

/* ****************************************
 *  Build classification dropdown <option> list
 * *************************************** */
Util.buildClassificationList = async function (selectedId = null) {
  const data = await invModel.getClassifications();
  let options = '<option value="">Choose a Classification</option>';
  data.rows.forEach((row) => {
    options += `<option value="${row.classification_id}"`;
    if (selectedId != null && row.classification_id == selectedId) {
      options += " selected";
    }
    options += `>${row.classification_name}</option>`;
  });
  return options;
};

/* ****************************************
 * Validation Rules & Middleware
 * *************************************** */

// -- Classification Name Rules (no spaces or special chars)
Util.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("No spaces or special characters allowed."),
  ];
};

// -- Classification Form Validation Handler
Util.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav();
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"));
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: req.flash(),
    });
  }
  next();
};

// -- Inventory Item Rules
Util.vehicleRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a number greater than 0."),
    body("inv_year").isInt({ min: 1886 }).withMessage("Year must be a valid number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
    body("inv_color").trim().notEmpty().withMessage("Color is required."),
    body("classification_id").notEmpty().withMessage("Classification must be selected."),
  ];
};

// -- Inventory Form Validation Handler (with sticky form)
Util.checkVehicleData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await Util.getNav();
    const classificationList = await Util.buildClassificationList(req.body.classification_id);
    req.flash("notice", errors.array().map((err) => err.msg).join("<br>"));
    return res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_year: req.body.inv_year,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    });
  }
  next();
};

/* ****************************************
 * JWT Token Middleware
 * *************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies?.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // Token is invalid
        res.locals.loggedin = 0;
        res.locals.accountData = null;
        res.locals.account_firstname = null;
      } else {
        // Token is valid
        res.locals.loggedin = 1;
        res.locals.accountData = decoded;
        res.locals.account_firstname = decoded.account_firstname;
        res.locals.account_type = decoded.account_type;
        res.locals.account_id = decoded.account_id;
      }
      next();
    });
  } else {
    // No token found
    res.locals.loggedin = 0;
    res.locals.accountData = null;
    res.locals.account_firstname = null;
    res.locals.account_type = null;
    res.locals.account_id = null;
    next();
  }
};

/* ****************************************
 * Check Login Middleware (Basic login check)
 * *************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Require Auth Middleware (Employee or Admin only)
 * *************************************** */
Util.requireAuth = (req, res, next) => {
  if (res.locals.loggedin) {
    if (res.locals.account_type === "Employee" || res.locals.account_type === "Admin") {
      next();
    } else {
      req.flash("notice", "Access denied. Employees or Admins only.");
      return res.redirect("/account/login");
    }
  } else {
    req.flash("notice", "Please log in to access this area.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * General Error Wrapper
 * *************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;