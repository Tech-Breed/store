// ==========================
// 📦 Stock Adjustment Module
// ==========================

// Define openModal globally
function openModal(contentHTML) {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.classList.add("active");
  modalOverlay.querySelector(".modal-content").innerHTML = contentHTML;
}

// Define closeModal globally
function closeModal() {
  const modalOverlay = document.querySelector(".modal-overlay");
  modalOverlay.classList.remove("active");
  modalOverlay.querySelector(".modal-content").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const adjustmentBtn = document.querySelector(".add-adjustment-btn");
  const modalOverlay = document.querySelector(".modal-overlay");

  // Load from localStorage or initialize
  let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
  let adjustments = JSON.parse(localStorage.getItem("adjustments")) || [];

  // Render Adjustment Log Table
  function renderAdjustments() {
    const tableBody = document.querySelector("#adjustmentTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    adjustments.slice().reverse().forEach(log => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${log.date}</td>
        <td>${log.itemName}</td>
        <td class="${log.change < 0 ? 'negative' : 'positive'}">${log.change > 0 ? '+' : ''}${log.change}</td>
        <td>${log.reason}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Open Stock Adjustment Modal
  function openAdjustmentModal() {
    const itemOptions = inventory.map(item =>
      `<option value="${item.id}">${item.name} (${item.locationType})</option>`
    ).join("");

    openModal(`
      <h2>Adjust Stock</h2>
      <form id="adjustmentForm" class="inventory-form">
        <label>Item</label>
        <select name="itemId" required>${itemOptions}</select>

        <label>Quantity Change (use - for decrease)</label>
        <input type="number" name="qty" required placeholder="e.g. -2 or 5" />

        <label>Reason</label>
        <input type="text" name="reason" required placeholder="Damaged, Correction, etc." />

        <button type="submit" class="submit-btn">Apply Adjustment</button>
      </form>
    `);

    // Handle Form Submission
    document.getElementById("adjustmentForm").addEventListener("submit", e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const itemId = parseInt(formData.get("itemId"));
      const qty = parseInt(formData.get("qty"));
      const reason = formData.get("reason");

      const itemIndex = inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return alert("Item not found.");

      // Update inventory quantity
      inventory[itemIndex].quantity = parseInt(inventory[itemIndex].quantity) + qty;

      // Log the adjustment
      adjustments.push({
        itemName: inventory[itemIndex].name,
        change: qty,
        reason,
        date: new Date().toLocaleString()
      });

      // Save updates
      localStorage.setItem("inventory", JSON.stringify(inventory));
        localStorage.setItem("adjustments", JSON.stringify(adjustments));
        renderAdjustments();

        // ✅ Also update inventory UI if warehouse section is active
        if (typeof renderInventory === "function") renderInventory();

        closeModal();

    });
  }

  // Register Adjustment Button
  if (adjustmentBtn) {
    adjustmentBtn.addEventListener("click", openAdjustmentModal);
  }

  // Initial Render of Logs if on Adjustment Section
  const onAdjustmentPage = document.getElementById("adjustmentTable");
  if (onAdjustmentPage) {
    renderAdjustments();
  }
});


