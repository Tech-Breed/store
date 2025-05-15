// ===============================
// 📂 vendor.js – Vendor Directory Module
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const addVendorBtn = document.querySelector(".add-vendor-btn");
  const vendorTableBody = document.querySelector("#vendorTable tbody");

  let vendors = JSON.parse(localStorage.getItem("vendors")) || [];

  // ✅ Open Vendor Modal for Add/Edit
  function openVendorModal(mode = "add", data = null) {
    const isEdit = mode === "edit";
    const title = isEdit ? "Edit Vendor" : "Add New Vendor";
    const submitText = isEdit ? "Save Changes" : "Add Vendor";

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
        <input type="text" name="category" required value="${data?.category || ""}" />

        <button type="submit" class="submit-btn">${submitText}</button>
      </form>
    `);

    // Handle form submission
    document.getElementById("vendorForm").addEventListener("submit", e => {
      e.preventDefault();
      const form = new FormData(e.target);

      const vendor = {
        id: isEdit ? data.id : Date.now(),
        name: form.get("name"),
        contact: form.get("contact"),
        email: form.get("email"),
        phone: form.get("phone"),
        category: form.get("category")
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

  // ✅ Render all vendors into the table
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
          <button onclick="deleteVendor(${v.id})" title="Delete">&times;</button>
        </td>
      `;
      vendorTableBody.appendChild(row);
    });
  }

  // ✅ Global Edit/Delete functions
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

  // ✅ Trigger Add Vendor
  if (addVendorBtn) {
    addVendorBtn.addEventListener("click", () => openVendorModal());
  }

  // ✅ Initial Render
  renderVendors();
});
