// companiesTablesGrouped.js

let companiesData = [];
let editingCompanyIndex = null;

window.renderCompanyTables = function (companyData) {
  // --- Collect business info dynamically ---
  const businessInfo = window.collectBusinessInfo ? window.collectBusinessInfo() : {};

  const output = document.getElementById("companiesOutput");

  // --- Merge company data and business info ---
  const fullCompanyData = { business: businessInfo, ...companyData };

  // --- If editing ---
  if (editingCompanyIndex !== null) {
    companiesData[editingCompanyIndex] = fullCompanyData;
    const existingDiv = output.querySelector(`.company-block[data-index="${editingCompanyIndex}"]`);
    if (existingDiv) {
      existingDiv.replaceWith(createCompanyBlock(editingCompanyIndex, fullCompanyData));
    }
    alert(`✅ Company ${editingCompanyIndex + 1} updated successfully!`);
    editingCompanyIndex = null;
    return;
  }

  // --- New entry ---
  const newIndex = companiesData.length;
  companiesData.push(fullCompanyData);
  const companyDiv = createCompanyBlock(newIndex, fullCompanyData);
  output.appendChild(companyDiv);
  alert(`✅ Company ${newIndex + 1} added below!`);
};

// --- Create Preview Block ---
function createCompanyBlock(index, companyData) {
  const div = document.createElement("div");
  div.classList.add("company-block");
  div.dataset.index = index;

  div.style.background = "#fff";
  div.style.padding = "15px";
  div.style.margin = "20px auto";
  div.style.borderRadius = "10px";
  div.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

  const title = document.createElement("h3");
  title.textContent = `${companyData.business?.business_name || "Company"} — Officers Preview`;
  title.style.color = "#007bff";
  div.appendChild(title);

  // --- Business Info Table ---
  const business = companyData.business || {};
  const businessKeys = Object.keys(business);
  if (businessKeys.length) {
    const bTable = document.createElement("table");
    bTable.style.width = "100%";
    bTable.style.marginBottom = "20px";
    bTable.style.borderCollapse = "collapse";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    businessKeys.forEach((key) => {
      const th = document.createElement("th");
      th.textContent = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      th.style.borderBottom = "2px solid #007bff";
      th.style.background = "#e9f2ff";
      th.style.padding = "8px";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    bTable.appendChild(thead);

    const tbody = document.createElement("tbody");
    const valueRow = document.createElement("tr");
    businessKeys.forEach((key) => {
      const td = document.createElement("td");
      td.textContent = business[key] || "-";
      td.style.padding = "8px";
      td.style.borderBottom = "1px solid #ccc";
      valueRow.appendChild(td);
    });
    tbody.appendChild(valueRow);
    bTable.appendChild(tbody);

    div.appendChild(bTable);
  }

  // --- Render other tables (Directors, Secretaries, Shareholders) ---
  Object.entries(companyData).forEach(([role, people]) => {
    if (!Array.isArray(people) || !people.length) return;
    if (role === "business") return; // skip business section

    const sectionTitle = document.createElement("h4");
    sectionTitle.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    div.appendChild(sectionTitle);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "25px";

    const headers = [
      "#",
      "Full Name",
      "Email",
      "Phone",
      "Date of Birth",
      "Address",
      "City",
      "Country",
    ];

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      th.style.borderBottom = "2px solid #007bff";
      th.style.background = "#e9f2ff";
      th.style.padding = "8px";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    people.forEach((p) => {
      const tr = document.createElement("tr");
      const createCell = (txt) => {
        const td = document.createElement("td");
        td.textContent = txt || "-";
        td.style.padding = "8px";
        td.style.borderBottom = "1px solid #ccc";
        return td;
      };
      tr.appendChild(createCell(p.id));
      tr.appendChild(createCell(p.personal.name));
      tr.appendChild(createCell(p.personal.email));
      tr.appendChild(createCell(p.personal.phone));
      tr.appendChild(createCell(p.personal.dob));
      tr.appendChild(createCell(p.residential.address));
      tr.appendChild(createCell(p.residential.city));
      tr.appendChild(createCell(p.residential.country));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    div.appendChild(table);
  });

  return div;
}
