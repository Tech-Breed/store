// ===============================
// 📂 vendor.js – Vendor Directory Module
// ===============================

let vendors = JSON.parse(localStorage.getItem("vendors")) || [];
let vendorCategories = JSON.parse(localStorage.getItem("vendorCategories")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const addVendorBtn = document.querySelector(".add-vendor-btn");
  const vendorTableBody = document.querySelector("#vendorTable tbody");

  // ✅ Open Modal for Add/Edit Vendor
  function openVendorModal(mode = "add", data = null) {
    const isEdit = mode === "edit";
    const title = isEdit ? "Edit Vendor" : "Add New Vendor";
    const submitText = isEdit ? "Save Changes" : "Add Vendor";

    const categoryOptions = vendorCategories.map(
      cat => `<option value="${cat}" ${data?.category === cat ? "selected" : ""}>${cat}</option>`
    ).join("");

    openModal(`
      <h2>${title}</h2>
      <form id="vendorForm" class="inventory-form">
        <label>Vendor Name</label>
        <input type="text" name="name" required value="${data?.name || ""}" />

        <label>Contact Person</label>
        <input type="text" name="contact" required value="${data?.contact || ""}" />

        <label>Email</label>
        <input type="email" name="email" required value="${data?.email || ""}" />

        <label>Phone</label>
        <input type="tel" name="phone" required value="${data?.phone || ""}" />

        <label>Category</label>
        <select name="category" id="vendorCategorySelect">
          <option value="">Select Category</option>
          ${categoryOptions}
        </select>
        <input type="text" name="newCategory" id="newCategoryInput" placeholder="Or enter a new category" />


        <button type="submit" class="submit-btn">${submitText}</button>
      </form>
    `);

    document.getElementById("vendorForm").addEventListener("submit", e => {
      e.preventDefault();
      const form = new FormData(e.target);

      const newCategory = document.getElementById("newCategoryInput").value.trim();
const selectedCategory = form.get("category").trim();
const finalCategory = newCategory || selectedCategory;

if (!finalCategory) {
  alert("Please select an existing category or enter a new one.");
  return;
}


      if (newCategory && !vendorCategories.includes(newCategory)) {
        vendorCategories.push(newCategory);
        localStorage.setItem("vendorCategories", JSON.stringify(vendorCategories));
      }

      const vendor = {
        id: isEdit ? data.id : Date.now(),
        name: form.get("name"),
        contact: form.get("contact"),
        email: form.get("email"),
        phone: form.get("phone"),
        category: finalCategory
      };

      if (isEdit) {
        vendors = vendors.map(v => v.id === vendor.id ? vendor : v);
      } else {
        vendors.push(vendor);
      }

      localStorage.setItem("vendors", JSON.stringify(vendors));
      renderVendors();
      document.querySelector(".modal-overlay").classList.remove("active");
    });
  }

  window.editVendor = function (id) {
  const vendor = vendors.find(v => v.id === id);
  if (vendor) openVendorModal("edit", vendor);
};


  // ✅ Render Vendors in Table
  function renderVendors() {
    if (!vendorTableBody) return;
    vendorTableBody.innerHTML = "";

    vendors.forEach(v => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${v.name}</td>
        <td>${v.contact}</td>
        <td>${v.email}</td>
        <td>${v.phone}</td>
        <td>${v.category}</td>
        <td>
          <button onclick="editVendor(${v.id})" title="Edit">&#9998;</button>

          <button class="checklist-btn" data-name="${v.name}">Checklist</button>
          <button onclick="viewVendorDetails(${v.id})" title="Details">View</button>
          <button onclick="deleteVendor(${v.id})" title="Delete">&times;</button>
        </td>
      `;
      vendorTableBody.appendChild(row);
    });
  }

  // ✅ Trigger Checklist Modal
  vendorTableBody.addEventListener("click", e => {
    if (e.target.classList.contains("checklist-btn")) {
      const vendorName = e.target.getAttribute("data-name");
      toggleComplianceModal(true, vendorName);
    }
  });

  if (addVendorBtn) {
    addVendorBtn.addEventListener("click", () => openVendorModal());
  }

  renderVendors();
});

// ===============================
// ✏️ Global Vendor Functions
// ===============================
window.editVendor = function (id) {
  const vendor = vendors.find(v => v.id === id);
  if (vendor) openVendorModal("edit", vendor);
};

window.deleteVendor = function (id) {
  if (confirm("Are you sure you want to delete this vendor?")) {
    vendors = vendors.filter(v => v.id !== id);
    localStorage.setItem("vendors", JSON.stringify(vendors));
    renderVendors();
  }
};

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("close-btn")) {
    document.querySelector(".modal-overlay").classList.remove("active");
    document.querySelector(".modal-content").innerHTML = "";
  }
});


// ===============================
// 📋 Compliance Checklist Logic
// ===============================
const complianceData = JSON.parse(localStorage.getItem("vendorCompliance")) || {};
const complianceModal = document.getElementById("complianceModal");
const complianceForm = document.getElementById("complianceForm");

function toggleComplianceModal(show, vendorName = "") {
  complianceModal.classList.toggle("hidden", !show);
  if (show) {
    complianceForm.vendorName.value = vendorName;
    const checks = complianceData[vendorName] || {};
    ["registration", "taxId", "insurance", "contract"].forEach(key => {
      complianceForm[key].checked = !!checks[key];
    });
  }
}

complianceForm.addEventListener("submit", e => {
  e.preventDefault();
  const vendorName = complianceForm.vendorName.value;
  complianceData[vendorName] = {
    registration: complianceForm.registration.checked,
    taxId: complianceForm.taxId.checked,
    insurance: complianceForm.insurance.checked,
    contract: complianceForm.contract.checked
  };
  localStorage.setItem("vendorCompliance", JSON.stringify(complianceData));
  toggleComplianceModal(false);
  openModal(`<h2>Checklist updated!</h2><button class="submit-btn" onclick="document.querySelector('.modal-overlay').classList.remove('active')">OK</button>`);
});

// ===============================
// 🧾 Vendor Detail Viewer Modal
// ===============================
window.viewVendorDetails = function (vendorId) {
  const vendor = vendors.find(v => v.id === vendorId);
  const inventory = JSON.parse(localStorage.getItem("inventory")) || [];

  const suppliedItems = inventory.filter(item => item.vendor === vendor.name);
  const totalQty = suppliedItems.reduce((sum, i) => sum + parseInt(i.quantity || 0), 0);

  const productList = suppliedItems.map(item =>
    `<li>${item.name} — Qty: ${item.quantity}</li>`).join("");

  openModal(`
    <h2>${vendor.name}</h2>
    <p><strong>Contact:</strong> ${vendor.contact}</p>
    <p><strong>Email:</strong> ${vendor.email}</p>
    <p><strong>Phone:</strong> ${vendor.phone}</p>
    <p><strong>Category:</strong> ${vendor.category}</p>
    <hr>
    <h3>Supplied Items</h3>
    <ul>${productList || "<li>No items yet</li>"}</ul>
    <p><strong>Total Quantity:</strong> ${totalQty}</p>
  `);
};

// vendor profile
function renderVendorProfiles() {
  const container = document.getElementById("vendorCategoriesContainer");
  if (!container) return;

  container.innerHTML = "";

  const categories = [...new Set(vendors.map(v => v.category))];

  categories.forEach(category => {
    const categoryGroup = document.createElement("div");
    categoryGroup.classList.add("vendor-category-group");

    const heading = document.createElement("h3");
    heading.textContent = category;
    categoryGroup.appendChild(heading);

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("vendor-cards");

    const vendorsInCategory = vendors.filter(v => v.category === category);

    vendorsInCategory.forEach(vendor => {
      const card = document.createElement("div");
      card.classList.add("vendor-card");

      card.innerHTML = `
        <h4>${vendor.name}</h4>
        <p><strong>Contact:</strong> ${vendor.contact}</p>
        <p><strong>Email:</strong> ${vendor.email}</p>
        <p><strong>Phone:</strong> ${vendor.phone}</p>
      `;

      cardsContainer.appendChild(card);
    });

    categoryGroup.appendChild(cardsContainer);
    container.appendChild(categoryGroup);
  });
}

function renderVendors() {
  if (!vendorTableBody) return;
  vendorTableBody.innerHTML = "";

  vendors.forEach(v => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${v.name}</td>
      <td>${v.contact}</td>
      <td>${v.email}</td>
      <td>${v.phone}</td>
      <td>${v.category}</td>
      <td>
        <button onclick="editVendor(${v.id})" title="Edit">&#9998;</button>
        <button class="checklist-btn" data-name="${v.name}">Checklist</button>
        <button onclick="viewVendorDetails(${v.id})" title="Details">View</button>
        <button onclick="deleteVendor(${v.id})" title="Delete">&times;</button>
      </td>
    `;
    vendorTableBody.appendChild(row);
  });

  renderVendorProfiles(); // Add this line
}
