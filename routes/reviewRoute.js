const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");

// Process Add Review (from vehicle detail page)
router.post(
  "/add",
  utilities.checkLogin,
  utilities.reviewRules(),
  utilities.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

// Show Edit Review Form
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.showEditReview)
);

// Process Update Review
router.post(
  "/update/:review_id",
  utilities.checkLogin,
  utilities.reviewRules(),
  utilities.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
);

// Process Delete Review
router.post(
  "/delete/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;