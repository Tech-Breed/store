// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM Elements =====
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".content-section");
  const modalOverlay = document.querySelector(".modal-overlay");
  const closeBtn = document.querySelector(".close-btn");
  const addItemBtn = document.querySelector(".add-item-btn");
  const scanItemBtn = document.querySelector(".scan-item-btn");
  const inventoryList = document.getElementById("inventoryList");
  const warehouseFilter = document.getElementById("warehouseFilter");

  const transferBtn = document.querySelector(".transfer-item-btn");

if (transferBtn) {
  transferBtn.addEventListener("click", () => {
    const options = inventory.map(item => `<option value="${item.id}">${item.name} (${item.locationType})</option>`).join("");

    openModal(`
      <h2>Transfer Inventory</h2>
      <form id="transferForm" class="inventory-form">
        <label>Item</label>
        <select name="itemId" required>${options}</select>

        <label>Transfer Quantity</label>
        <input type="number" name="qty" min="1" required />

        <label>Transfer To</label>
        <select name="destination" required>
          <option value="">Select Destination</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Store A">Store A</option>
          <option value="Store B">Store B</option>
        </select>

        <button type="submit" class="submit-btn">Transfer</button>
      </form>
    `);

    document.getElementById("transferForm").addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const itemId = parseInt(formData.get("itemId"));
      const qty = parseInt(formData.get("qty"));
      const destination = formData.get("destination");

      const itemIndex = inventory.findIndex(i => i.id === itemId);
      const item = inventory[itemIndex];

      if (!item || item.locationType === destination) {
        alert("Invalid transfer.");
        return;
      }

      if (qty > parseInt(item.quantity)) {
        alert("Not enough quantity.");
        return;
      }

      // Subtract from source
      inventory[itemIndex].quantity -= qty;

      // Add to destination (create or merge)
      const existing = inventory.find(i => i.code === item.code && i.locationType === destination);
      if (existing) {
        existing.quantity = parseInt(existing.quantity) + qty;
      } else {
        inventory.push({
          ...item,
          id: Date.now(),
          locationType: destination,
          quantity: qty
        });
      }

      

      localStorage.setItem("inventory", JSON.stringify(inventory));
      renderInventory();
// ===========================
// ✅ NEW: Save Transfer History
// ===========================
let transferHistory = JSON.parse(localStorage.getItem("transferHistory")) || [];

transferHistory.push({
  itemName: item.name,
  quantity: qty,
  from: item.locationType,
  to: destination,
  date: new Date().toLocaleString()
});

localStorage.setItem("transferHistory", JSON.stringify(transferHistory));


      modalOverlay.classList.remove("active");
    });
  });
}


  // ===== Global Inventory State =====
  let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

  // ===== Initialize App =====
  const savedSection = localStorage.getItem("activeSection") || "dashboard";
  switchSection(savedSection);

  // ===== Section Navigation =====
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");
      switchSection(sectionId);
    });
  });

  // ===== Modal Close Event =====
  closeBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
    modalOverlay.querySelector(".modal-content").innerHTML = "";
  });

  // ===== Section Switching Logic =====
  function switchSection(id) {
  localStorage.setItem("activeSection", id);

  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("data-section") === id);
  });

  sections.forEach(section => {
    section.classList.add("hidden");
    section.style.opacity = 0;
  });

  const target = document.getElementById(`${id}-section`);
  if (target) {
    target.classList.remove("hidden");
    setTimeout(() => (target.style.opacity = 1), 50);
    document.querySelector(".page-title").textContent = capitalize(id);

    // ✅ Render transfer history when that tab is active
    if (id === "history") {
      renderTransferHistory();
    }
  }

  if (id === "warehouse") renderInventory();
}


  // ===== Capitalize String Utility =====
  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // ===== Open Modal Utility =====
  function openModal(contentHTML) {
    modalOverlay.classList.add("active");
    modalOverlay.querySelector(".modal-content").innerHTML = contentHTML;
  }

  // ===== Inventory Form Modal (Add/Edit) =====
  function openInventoryForm(mode = "add", itemData = null) {
    const isEdit = mode === "edit";
    const formTitle = isEdit ? "Edit Inventory Item" : "Add Inventory Item";
    const submitLabel = isEdit ? "Save Changes" : "Add Item";

    openModal(`
      <h2>${formTitle}</h2>
      <form id="inventoryForm" class="inventory-form">
        <label>Name</label>
        <input type="text" name="name" required value="${itemData?.name || ""}" />
        
        <label>Category</label>
        <input type="text" name="category" required value="${itemData?.category || ""}" />

        <label>Quantity</label>
        <input type="number" name="quantity" required min="0" value="${itemData?.quantity || ""}" />

        <label>Location</label>
        <input type="text" name="location" required value="${itemData?.location || ""}" />

        <label>Barcode / Code</label>
        <input type="text" name="code" required pattern="^[a-zA-Z0-9-_]+$" value="${itemData?.code || ""}" />

        <label>Assign To</label>
        <select name="locationType" required>
          <option value="Warehouse" ${itemData?.locationType === "Warehouse" ? "selected" : ""}>Warehouse</option>
          <option value="Store A" ${itemData?.locationType === "Store A" ? "selected" : ""}>Store A</option>
          <option value="Store B" ${itemData?.locationType === "Store B" ? "selected" : ""}>Store B</option>
        </select>

        <button type="submit" class="submit-btn">${submitLabel}</button>
      </form>
    `);

    document.getElementById("inventoryForm").addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const updatedItem = {
        id: isEdit ? itemData.id : Date.now(),
        name: formData.get("name"),
        category: formData.get("category"),
        quantity: formData.get("quantity"),
        location: formData.get("location"),
        code: formData.get("code").trim().toUpperCase(),
        locationType: formData.get("locationType")
      };

      const isDuplicateCode = inventory.some(item =>
        item.code === updatedItem.code && (!isEdit || item.id !== updatedItem.id)
      );

      if (isDuplicateCode) {
        alert("This barcode/code is already used. Please enter a unique one.");
        return;
      }

      if (isEdit) {
        inventory = inventory.map(item => item.id === itemData.id ? updatedItem : item);
      } else {
        inventory.push(updatedItem);
      }

      localStorage.setItem("inventory", JSON.stringify(inventory));
      renderInventory();
      modalOverlay.classList.remove("active");
    });
  }

  // ===== Add Item Button Trigger =====
  if (addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      openInventoryForm("add");
    });
  }

  // ===== Scan Item Button Trigger =====
  if (scanItemBtn) {
    scanItemBtn.addEventListener("click", () => {
      openModal(`
        <h2>Scan Barcode / QR</h2>
        <form id="scanForm" class="scan-form">
          <label>Enter Code</label>
          <input type="text" name="code" required placeholder="e.g. TOOL-00123" />
          <button type="submit" class="submit-btn">Scan</button>
        </form>
      `);

      document.getElementById("scanForm").addEventListener("submit", e => {
        e.preventDefault();
        const code = new FormData(e.target).get("code").trim().toLowerCase();

        const matchedItem = inventory.find(item =>
          item.code.toLowerCase() === code
        );

        if (matchedItem) {
          openModal(`
            <h2>Item Found</h2>
            <p><strong>Name:</strong> ${matchedItem.name}</p>
            <p><strong>Category:</strong> ${matchedItem.category}</p>
            <p><strong>Quantity:</strong> ${matchedItem.quantity}</p>
            <p><strong>Location:</strong> ${matchedItem.location}</p>
            <p><strong>Assigned To:</strong> ${matchedItem.locationType}</p>
            <p><strong>Code:</strong> ${matchedItem.code}</p>
          `);
        } else {
          openModal(`
            <h2>Not Found</h2>
            <p>No item matched the code: <strong>${code}</strong></p>
          `);
        }
      });
    });
  }

  // ===== Render Inventory Cards with Location Filter =====
  function renderInventory() {
    if (!inventoryList) return;
    inventoryList.innerHTML = "";

    // Stock thresholds
    const minQty = 25;
    const maxQty = 100;

    // Filter by locationType
    const filter = warehouseFilter?.value || "all";

    const filteredInventory = filter === "all"
      ? inventory
      : inventory.filter(item => item.locationType === filter);

    // Update dropdown options
    if (warehouseFilter) {
      const options = ["Warehouse", "Store A", "Store B"];
      warehouseFilter.innerHTML = `<option value="all">All</option>`;
      options.forEach(loc => {
        warehouseFilter.innerHTML += `<option value="${loc}">${loc}</option>`;
      });
      warehouseFilter.onchange = renderInventory;
    }

    filteredInventory.forEach(item => {
      const quantity = parseInt(item.quantity, 10);
      let statusClass = "";

      if (quantity < minQty) {
        statusClass = "low-stock";
      } else if (quantity > maxQty) {
        statusClass = "over-stock";
      }

      const card = document.createElement("div");
      card.className = `inventory-card ${statusClass}`;
      card.innerHTML = `
        <div class="card-actions">
          <button onclick="editItem(${item.id})" title="Edit">&#9998;</button>
          <button onclick="deleteItem(${item.id})" title="Delete">&times;</button>
        </div>
        <h3>${item.name}</h3>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Qty:</strong> ${item.quantity}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Assigned To:</strong> ${item.locationType}</p>
        <p><strong>Code:</strong> ${item.code}</p>
      `;
      inventoryList.appendChild(card);
    });
  }

  // ===== Delete Inventory Item (Global) =====
  window.deleteItem = function (id) {
    inventory = inventory.filter(item => item.id !== id);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventory();
  };

  // ===== Edit Inventory Item (Global) =====
  window.editItem = function (id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
      openInventoryForm("edit", item);
    }
  };
});

// ========================
// 🔄 Transfer History Renderer
// ========================
function renderTransferHistory() {
  const tableBody = document.querySelector("#transferHistoryTable tbody");
  if (!tableBody) return;

  const transferHistory = JSON.parse(localStorage.getItem("transferHistory")) || [];

  tableBody.innerHTML = "";

  if (transferHistory.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5">No transfers recorded yet.</td></tr>`;
    return;
  }

  transferHistory.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.itemName}</td>
      <td>${entry.quantity}</td>
      <td>${entry.from}</td>
      <td>${entry.to}</td>
    `;
    tableBody.appendChild(row);
  });
}
