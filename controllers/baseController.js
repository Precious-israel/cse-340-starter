const utilities = require("../utilities");

const baseController = {};

baseController.home = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  } catch (err) {
    console.error("Error in baseController.home:", err);
    res.status(500).send("Server Error");
  }
};

module.exports = baseController;
