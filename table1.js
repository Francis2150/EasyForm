// companiesTablesGrouped.js
let companiesData = [];
let editingCompanyIndex = null; // Track if we're editing an existing company

window.renderCompanyTables = function (companyData) {
  const output = document.getElementById('companiesOutput');

  // --- If editing existing company ---
  if (editingCompanyIndex !== null) {
    companiesData[editingCompanyIndex] = companyData; // replace data
    const existingDiv = output.querySelector(`.company-block[data-index="${editingCompanyIndex}"]`);
    if (existingDiv) {
      existingDiv.replaceWith(createCompanyBlock(editingCompanyIndex, companyData));
    }
    alert(`✅ Company ${editingCompanyIndex + 1} updated successfully!`);
    editingCompanyIndex = null; // reset editing state
    return;
  }

  // --- Otherwise create new company entry ---
  const newIndex = companiesData.length;
  companiesData.push(companyData);

  const companyDiv = createCompanyBlock(newIndex, companyData);
  output.appendChild(companyDiv);
  alert(`✅ Company ${newIndex + 1} added below!`);
};

// ----------------------------------
// Helper: create visual preview for one company
// ----------------------------------
function createCompanyBlock(index, companyData) {
  const companyDiv = document.createElement('div');
  companyDiv.classList.add('company-block');
  companyDiv.dataset.index = index;

  companyDiv.style.background = '#fff';
  companyDiv.style.padding = '15px';
  companyDiv.style.margin = '20px auto';
  companyDiv.style.borderRadius = '10px';
  companyDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

  const title = document.createElement('h3');
  title.textContent = `Company ${index + 1} — Officers Preview`;
  title.style.color = '#007bff';
  companyDiv.appendChild(title);

  // --- Action buttons ---
  const actionRow = document.createElement('div');
  actionRow.style.textAlign = 'right';
  actionRow.style.marginBottom = '10px';

  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️ Edit';
  editBtn.style.background = '#ffc107';
  editBtn.style.color = '#000';
  editBtn.style.border = 'none';
  editBtn.style.padding = '6px 12px';
  editBtn.style.borderRadius = '4px';
  editBtn.style.cursor = 'pointer';
  editBtn.style.marginRight = '10px';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️ Delete';
  deleteBtn.style.background = '#dc3545';
  deleteBtn.style.color = '#fff';
  deleteBtn.style.border = 'none';
  deleteBtn.style.padding = '6px 12px';
  deleteBtn.style.borderRadius = '4px';
  deleteBtn.style.cursor = 'pointer';

  actionRow.appendChild(editBtn);
  actionRow.appendChild(deleteBtn);
  companyDiv.appendChild(actionRow);

  // --- Render role tables ---
  Object.entries(companyData).forEach(([role, people]) => {
    if (!people.length) return;
    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    companyDiv.appendChild(sectionTitle);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '25px';

    const headers = [
      '#',
      'Full Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Address',
      'City',
      'Country',
    ];

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach((h) => {
      const th = document.createElement('th');
      th.textContent = h;
      th.style.borderBottom = '2px solid #007bff';
      th.style.background = '#e9f2ff';
      th.style.padding = '8px';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    people.forEach((p) => {
      const tr = document.createElement('tr');
      const createCell = (txt) => {
        const td = document.createElement('td');
        td.textContent = txt || '-';
        td.style.padding = '8px';
        td.style.borderBottom = '1px solid #ccc';
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
    companyDiv.appendChild(table);
  });

  // --- Delete handler ---
  deleteBtn.addEventListener('click', () => {
    if (confirm(`Delete Company ${index + 1}?`)) {
      companyDiv.remove();
      companiesData[index] = null;
      alert(`❌ Company ${index + 1} deleted.`);
    }
  });

  // --- Edit handler ---
  editBtn.addEventListener('click', () => {
    const data = companiesData[index];
    if (!data) return alert('This company was deleted.');

    populateFormWithCompanyData(data);
    editingCompanyIndex = index; // mark which one we’re editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return companyDiv;
}

// ----------------------------------
// Helper: repopulate form for editing
// ----------------------------------
function populateFormWithCompanyData(companyData) {
  const form = document.getElementById('companyForm');

  // Clear all containers first
  ['directors', 'secretaries', 'shareholders'].forEach((roleId) => {
    const container = document.getElementById(`${roleId}Container`);
    if (container) container.innerHTML = '';
  });

  // Repopulate
  Object.entries(companyData).forEach(([role, people]) => {
    const container = document.getElementById(`${role}Container`);
    if (!container) return;

    people.forEach((p, i) => {
      const block = document.createElement('div');
      block.classList.add('person');
      block.innerHTML = `
        <h4>${role.slice(0, -1)} ${i + 1}</h4>
        <div class="section">
          <div class="form-group"><label>Full Name:</label><input type="text" name="${role}_name[]" value="${p.personal.name || ''}" /></div>
          <div class="form-group"><label>Email:</label><input type="email" name="${role}_email[]" value="${p.personal.email || ''}" /></div>
          <div class="form-group"><label>Phone:</label><input type="text" name="${role}_phone[]" value="${p.personal.phone || ''}" /></div>
          <div class="form-group"><label>Date of Birth:</label><input type="date" name="${role}_dob[]" value="${p.personal.dob || ''}" /></div>
        </div>
        <div class="section">
          <div class="form-group"><label>Address:</label><input type="text" name="${role}_address[]" value="${p.residential.address || ''}" /></div>
          <div class="form-group"><label>City:</label><input type="text" name="${role}_city[]" value="${p.residential.city || ''}" /></div>
          <div class="form-group"><label>Country:</label><input type="text" name="${role}_country[]" value="${p.residential.country || ''}" /></div>
        </div>
      `;
      container.appendChild(block);
    });
  });
}
