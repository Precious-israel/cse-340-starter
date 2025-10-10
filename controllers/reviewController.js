const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

const reviewController = {};

/* ****************************************
 *  Process Add Review
 * *************************************** */
reviewController.addReview = async function (req, res) {
  try {
    const { review_text, inv_id } = req.body;
    const account_id = res.locals.accountData.account_id;

    // Server-side validation
    if (!review_text || review_text.trim().length === 0) {
      req.flash("error", "Review text is required.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    if (review_text.length > 1000) {
      req.flash("error", "Review must be less than 1000 characters.");
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    const result = await reviewModel.addReview(review_text.trim(), inv_id, account_id);

    if (result) {
      req.flash("success", "Review added successfully!");
    } else {
      req.flash("error", "Failed to add review. Please try again.");
    }

    return res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("addReview error:", error);
    req.flash("error", "An error occurred while adding the review.");
    return res.redirect(`/inv/detail/${req.body.inv_id}`);
  }
};

/* ****************************************
 *  Show Edit Review Form
 * *************************************** */
reviewController.showEditReview = async function (req, res) {
  try {
    const review_id = parseInt(req.params.review_id);
    const account_id = res.locals.accountData.account_id;

    // Check if user owns the review
    const ownsReview = await reviewModel.checkReviewOwnership(review_id, account_id);
    if (!ownsReview) {
      req.flash("error", "You can only edit your own reviews.");
      return res.redirect("/account/");
    }

    const review = await reviewModel.getReviewById(review_id);
    if (!review) {
      req.flash("error", "Review not found.");
      return res.redirect("/account/");
    }

    const nav = await utilities.getNav();
    res.render("review/edit", {
      title: "Edit Review",
      nav,
      errors: null,
      review,
    });
  } catch (error) {
    console.error("showEditReview error:", error);
    req.flash("error", "An error occurred while loading the review.");
    return res.redirect("/account/");
  }
};

/* ****************************************
 *  Process Update Review
 * *************************************** */
reviewController.updateReview = async function (req, res) {
  try {
    const review_id = parseInt(req.params.review_id);
    const { review_text } = req.body;
    const account_id = res.locals.accountData.account_id;

    // Check if user owns the review
    const ownsReview = await reviewModel.checkReviewOwnership(review_id, account_id);
    if (!ownsReview) {
      req.flash("error", "You can only edit your own reviews.");
      return res.redirect("/account/");
    }

    // Server-side validation
    if (!review_text || review_text.trim().length === 0) {
      const nav = await utilities.getNav();
      const review = await reviewModel.getReviewById(review_id);
      return res.render("review/edit", {
        title: "Edit Review",
        nav,
        errors: [{ msg: "Review text is required." }],
        review: { ...review, review_text },
      });
    }

    if (review_text.length > 1000) {
      const nav = await utilities.getNav();
      const review = await reviewModel.getReviewById(review_id);
      return res.render("review/edit", {
        title: "Edit Review",
        nav,
        errors: [{ msg: "Review must be less than 1000 characters." }],
        review: { ...review, review_text },
      });
    }

    const result = await reviewModel.updateReview(review_id, review_text.trim());

    if (result) {
      req.flash("success", "Review updated successfully!");
    } else {
      req.flash("error", "Failed to update review. Please try again.");
    }

    return res.redirect("/account/");
  } catch (error) {
    console.error("updateReview error:", error);
    req.flash("error", "An error occurred while updating the review.");
    return res.redirect("/account/");
  }
};

/* ****************************************
 *  Process Delete Review
 * *************************************** */
reviewController.deleteReview = async function (req, res) {
  try {
    const review_id = parseInt(req.params.review_id);
    const account_id = res.locals.accountData.account_id;

    // Check if user owns the review
    const ownsReview = await reviewModel.checkReviewOwnership(review_id, account_id);
    if (!ownsReview) {
      req.flash("error", "You can only delete your own reviews.");
      return res.redirect("/account/");
    }

    const result = await reviewModel.deleteReview(review_id);

    if (result) {
      req.flash("success", "Review deleted successfully!");
    } else {
      req.flash("error", "Failed to delete review. Please try again.");
    }

    return res.redirect("/account/");
  } catch (error) {
    console.error("deleteReview error:", error);
    req.flash("error", "An error occurred while deleting the review.");
    return res.redirect("/account/");
  }
};

module.exports = reviewController;