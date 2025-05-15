// =========================================
// 📜 TRANSFER HISTORY LOG MODULE
// Description: Loads and displays all past inventory transfers
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  const transferHistory = JSON.parse(localStorage.getItem("transferHistory")) || [];

  function renderTransferHistory() {
    const tableBody = document.querySelector("#transferHistoryTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (transferHistory.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No transfers recorded.</td></tr>`;
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

  // 🔁 Hook into nav section switch
  const originalSwitchSection = window.switchSection;
  window.switchSection = function(id) {
    if (typeof originalSwitchSection === "function") originalSwitchSection(id);
    if (id === "history") renderTransferHistory();
  };
});




