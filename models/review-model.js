const pool = require("../database/");

const reviewModel = {};

/* **************************
 *   Add new review
 * ************************ */
reviewModel.addReview = async function (review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO public.review (review_text, inv_id, account_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(sql, [review_text, inv_id, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("addReview error:", error);
    throw error;
  }
};

/* **************************
 *   Get reviews by inventory ID
 * ************************ */
reviewModel.getReviewsByInventoryId = async function (inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname
      FROM public.review r
      JOIN public.account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC;
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByInventoryId error:", error);
    throw error;
  }
};

/* **************************
 *   Get reviews by account ID
 * ************************ */
reviewModel.getReviewsByAccountId = async function (account_id) {
  try {
    const sql = `
      SELECT r.*, i.inv_make, i.inv_model, i.inv_year
      FROM public.review r
      JOIN public.inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC;
    `;
    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByAccountId error:", error);
    throw error;
  }
};

/* **************************
 *   Get review by ID
 * ************************ */
reviewModel.getReviewById = async function (review_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname, i.inv_make, i.inv_model, i.inv_year
      FROM public.review r
      JOIN public.account a ON r.account_id = a.account_id
      JOIN public.inventory i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1;
    `;
    const result = await pool.query(sql, [review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getReviewById error:", error);
    throw error;
  }
};

/* **************************
 *   Update review
 * ************************ */
reviewModel.updateReview = async function (review_id, review_text) {
  try {
    const sql = `
      UPDATE public.review 
      SET review_text = $1, review_date = NOW()
      WHERE review_id = $2
      RETURNING *;
    `;
    const result = await pool.query(sql, [review_text, review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("updateReview error:", error);
    throw error;
  }
};

/* **************************
 *   Delete review
 * ************************ */
reviewModel.deleteReview = async function (review_id) {
  try {
    const sql = "DELETE FROM public.review WHERE review_id = $1";
    const result = await pool.query(sql, [review_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("deleteReview error:", error);
    throw error;
  }
};

/* **************************
 *   Check if user owns review
 * ************************ */
reviewModel.checkReviewOwnership = async function (review_id, account_id) {
  try {
    const sql = "SELECT 1 FROM public.review WHERE review_id = $1 AND account_id = $2";
    const result = await pool.query(sql, [review_id, account_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("checkReviewOwnership error:", error);
    throw error;
  }
};

module.exports = reviewModel;