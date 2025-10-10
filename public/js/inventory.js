'use strict'

// Global variables for pagination
let currentPage = 1;
let itemsPerPage = 10;
let currentData = [];

// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classification_id");

classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);
  
  // Reset pagination
  currentPage = 1;
  
  // Show loading state
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  inventoryDisplay.innerHTML = '<div class="loading">Loading inventory...</div>';

  let classIdURL = "/inv/getInventory/" + classification_id;

  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      currentData = data;
      buildInventoryTable(currentData);
      updatePaginationControls();
    })
    .catch(function (error) {
      console.log('There was a problem: ', error.message);
      let inventoryDisplay = document.getElementById("inventoryDisplay");
      inventoryDisplay.innerHTML = '<div class="error-message">Error loading inventory data. Please try again.</div>';
    });
});

// Build professional inventory table with pagination
function buildInventoryTable(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  let paginationControls = document.getElementById("paginationControls");

  // If no data returned
  if (!data || data.length === 0) {
    inventoryDisplay.innerHTML = `
      <div class="no-data">
        <i class="fas fa-box-open"></i>
        <h3>No Inventory Found</h3>
        <p>No vehicles found for this classification.</p>
        <a href="/inv/add-inventory" class="btn btn-primary">Add New Vehicle</a>
      </div>
    `;
    paginationControls.innerHTML = '';
    return;
  }

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const pageData = data.slice(startIndex, endIndex);

  // Build table
  let tableHTML = `
    <div class="table-container">
      <div class="table-header">
        <h3>Inventory Items (${data.length} total)</h3>
        <div class="table-actions">
          <a href="/inv/add-inventory" class="btn btn-sm btn-primary">
            <i class="fas fa-plus"></i> Add New Vehicle
          </a>
        </div>
      </div>
      <table class="inventory-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Vehicle Details</th>
            <th>Price</th>
            <th>Year</th>
            <th class="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Iterate over current page vehicles
  pageData.forEach(function (vehicle) {
    tableHTML += `
      <tr class="inventory-item">
        <td class="vehicle-image">
          <img src="${vehicle.inv_thumbnail || '/images/vehicles/no-image-tn.png'}" 
               alt="${vehicle.inv_make} ${vehicle.inv_model}"
               onerror="this.src='/images/vehicles/no-image-tn.png'">
        </td>
        <td class="vehicle-details">
          <div class="vehicle-name">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</div>
          <div class="vehicle-description">${vehicle.inv_description ? vehicle.inv_description.substring(0, 100) + '...' : 'No description available'}</div>
          <div class="vehicle-meta">
            <span class="mileage"><i class="fas fa-tachometer-alt"></i> ${numberWithCommas(vehicle.inv_miles)} miles</span>
            <span class="color"><i class="fas fa-palette"></i> ${vehicle.inv_color}</span>
          </div>
        </td>
        <td class="vehicle-price">
          $${numberWithCommas(vehicle.inv_price)}
        </td>
        <td class="vehicle-year">
          ${vehicle.inv_year}
        </td>
        <td class="vehicle-actions">
          <div class="action-buttons">
            <a href="/inv/edit/${vehicle.inv_id}" class="btn-action btn-edit" title="Edit Vehicle">
              <i class="fas fa-edit"></i> Edit
            </a>
            <a href="/inv/delete/${vehicle.inv_id}" class="btn-action btn-delete" title="Delete Vehicle" onclick="return confirmDelete('${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}')">
              <i class="fas fa-trash"></i> Delete
            </a>
          </div>
        </td>
      </tr>
    `;
  });

  tableHTML += `
        </tbody>
      </table>
    </div>
  `;

  inventoryDisplay.innerHTML = tableHTML;
}

// Update pagination controls
function updatePaginationControls() {
  const paginationControls = document.getElementById("paginationControls");
  const totalPages = Math.ceil(currentData.length / itemsPerPage);

  if (totalPages <= 1) {
    paginationControls.innerHTML = '';
    return;
  }

  let paginationHTML = `
    <div class="pagination">
      <div class="pagination-info">
        Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, currentData.length)}-${Math.min(currentPage * itemsPerPage, currentData.length)} of ${currentData.length} items
      </div>
      <div class="pagination-buttons">
  `;

  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">
      <i class="fas fa-chevron-left"></i> Previous
    </button>`;
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="pagination-btn active">${i}</button>`;
    } else {
      paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">
      Next <i class="fas fa-chevron-right"></i>
    </button>`;
  }

  paginationHTML += `
      </div>
      <div class="items-per-page">
        <label for="itemsPerPage">Items per page:</label>
        <select id="itemsPerPage" onchange="changeItemsPerPage(this.value)">
          <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
          <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
          <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
          <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
        </select>
      </div>
    </div>
  `;

  paginationControls.innerHTML = paginationHTML;
}

// Change page function
function changePage(page) {
  currentPage = page;
  buildInventoryTable(currentData);
  updatePaginationControls();
  
  // Scroll to top of table
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.scrollIntoView({ 
      behavior: 'smooth' 
    });
  }
}

// Change items per page
function changeItemsPerPage(newItemsPerPage) {
  itemsPerPage = parseInt(newItemsPerPage);
  currentPage = 1;
  buildInventoryTable(currentData);
  updatePaginationControls();
}

// Utility function to format numbers with commas
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Confirm delete function
function confirmDelete(vehicleName) {
  return confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`);
}