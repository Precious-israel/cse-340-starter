const pool = require("../database/")

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      ) VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *;
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ])
    return result.rows[0] // return inserted row
  } catch (error) {
    console.error("❌ Error in registerAccount:", error)
    return null
  }
}

/* *****************************
 *   Check for existing email
 * *************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_email FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rowCount > 0 // true if email exists
  } catch (error) {
    console.error("❌ Error checking existing email:", error)
    return false
  }
}

/* *****************************
 *   Get account by email
 * *************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
      FROM account
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [account_email])
    return result.rows[0] || null // return the account object
  } catch (error) {
    console.error("❌ Error fetching account by email:", error)
    return null
  }
}

async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1",
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    console.error("getAccountById error:", error)
    throw error
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
   getAccountById,
  getAccountByEmail,
}
