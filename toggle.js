// TOGGLE BUTTON

document.addEventListener('DOMContentLoaded', function () {
  const interfaceToggle = document.getElementById('interfaceToggle');
  const toggleLabel = document.getElementById('toggleLabel');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateSidebarLinks() {
    const isVendor = interfaceToggle.checked;
    const currentInterface = isVendor ? 'vendor' : 'store';

    navLinks.forEach(link => {
      const interfaces = link.getAttribute('data-interface');
      if (interfaces === 'both' || interfaces === currentInterface) {
        link.style.display = '';
      } else {
        link.style.display = 'none';
      }
    });

    toggleLabel.textContent = isVendor ? 'Vendor' : 'Store/Warehouse';
  }

  // Initial update
  updateSidebarLinks();

  // Update on toggle change
  interfaceToggle.addEventListener('change', updateSidebarLinks);
});


// ROLE SWITCH
const roleSwitch = document.getElementById("roleSwitch");
const roleLabel = document.getElementById("roleLabel");

function updateRoleUI(role) {
  document.querySelectorAll("[data-role]").forEach(el => {
    el.style.display = el.getAttribute("data-role") === role ? "" : "none";
  });

  localStorage.setItem("currentRole", role);
}

roleSwitch.addEventListener("change", () => {
  const role = roleSwitch.checked ? "store" : "vendor";
  roleLabel.textContent = role === "store" ? "Store/Warehouse" : "Vendor";
  updateRoleUI(role);
});

// Load saved role on page load
const savedRole = localStorage.getItem("currentRole") || "vendor";
roleSwitch.checked = savedRole === "store";
roleLabel.textContent = savedRole === "store" ? "Store/Warehouse" : "Vendor";
updateRoleUI(savedRole);
