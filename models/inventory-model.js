const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return data;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

/* ***************************
 *  Get a single inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory
      WHERE inv_id = $1
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryById error:", error);
    throw error;
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `;
    const data = await pool.query(sql, [classification_name]);
    return data.rows[0]; // Return the newly inserted row
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(invData) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      invData.classification_id,
      invData.inv_make,
      invData.inv_model,
      invData.inv_description,
      invData.inv_image || "/images/vehicles/no-image.png",
      invData.inv_thumbnail || "/images/vehicles/no-image-tn.png",
      invData.inv_price,
      invData.inv_year,
      invData.inv_miles,
      invData.inv_color,
    ];

    const data = await pool.query(sql, values);
    return data.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Edit inventory item by ID
 * ************************** */
async function editInventoryById(id, invData) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        classification_id = $1,
        inv_make = $2,
        inv_model = $3,
        inv_description = $4,
        inv_image = $5,
        inv_thumbnail = $6,
        inv_price = $7,
        inv_year = $8,
        inv_miles = $9,
        inv_color = $10
      WHERE inv_id = $11
      RETURNING *;
    `;

    const values = [
      invData.classification_id,
      invData.inv_make,
      invData.inv_model,
      invData.inv_description,
      invData.inv_image || "/images/vehicles/no-image.png",
      invData.inv_thumbnail || "/images/vehicles/no-image-tn.png",
      invData.inv_price,
      invData.inv_year,
      invData.inv_miles,
      invData.inv_color,
      id,
    ];

    const data = await pool.query(sql, values);
    return data.rows[0];
  } catch (error) {
    console.error("editInventoryById error:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make = $1,
        inv_model = $2,
        inv_description = $3,
        inv_image = $4,
        inv_thumbnail = $5,
        inv_price = $6,
        inv_year = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *;
    `;

    const values = [
      inv_make,
      inv_model,
      inv_description,
      inv_image || "/images/vehicles/no-image.png",
      inv_thumbnail || "/images/vehicles/no-image-tn.png",
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ];

    const data = await pool.query(sql, values);
    return data.rows[0];
  } catch (error) {
    console.error("updateInventory error:", error);
    throw error;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    throw new Error("Delete Inventory Error: " + error.message)
  }
}

/* ***************************
 *  Export all functions
 * ************************** */
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventory,
  editInventoryById,
  updateInventory,
   deleteInventoryItem,
};
