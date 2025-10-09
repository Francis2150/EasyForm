// storageAndRender.js, handles localStorage and rendering the company table,Delete button logic
function readData() {
  const raw = localStorage.getItem('companyData');
  return raw ? JSON.parse(raw) : [];
}

function writeData(data) {
  localStorage.setItem('companyData', JSON.stringify(data));
}

function renderAllCompanies(allCompaniesContainer, populateForm) {
  const records = readData();
  allCompaniesContainer.innerHTML = '';

  if (records.length === 0) {
    allCompaniesContainer.innerHTML = '<p>No companies saved yet.</p>';
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.innerHTML = `
    <thead style="background:#f2f2f2;">
      <tr>
        <th>Company Details</th>
        <th>Directors</th>
        <th>Secretaries</th>
        <th>Shareholders</th>
        <th>Beneficial Owners</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  const formatPeople = (arr, showRoles = false) => {
    if (!arr || arr.length === 0) return '<em>None</em>';
    return arr.map((p, i) => {
      let info = `
        <div style="margin-bottom:8px;">
          <strong>${p.fullName || '-'}</strong><br>
          Email: ${p.email || '-'}<br>
          Phone: ${p.phone || '-'}<br>
          DOB: ${p.dob || '-'}<br>
          Address: ${p.address || '-'}, ${p.city || '-'}, ${p.country || '-'}
      `;
      if (p.fromRole) info += `<br><em>${p.fromRole}</em>`;
      if (p.sharePercent && !showRoles) info += `<br>Share %: ${p.sharePercent}`;
      info += '</div>';
      if (i < arr.length - 1) info += '<hr>';
      return info;
    }).join('');
  };

  records.forEach((r, index) => {
    const row = document.createElement('tr');
    const c = r.companyInfo;
    const companyDetailsHTML = `
      <strong>${c.companyName}</strong><br>
      Reg. No: ${c.registrationNumber || '-'}<br>
      Date: ${c.incorporationDate || '-'}<br>
      Address: ${c.businessAddress || '-'}, ${c.city || '-'}, ${c.country || '-'}<br>
      Nature: ${c.natureOfBusiness || '-'}<br>
      Tax ID: ${c.taxId || '-'}
    `;
    row.innerHTML = `
      <td>${companyDetailsHTML}</td>
      <td>${formatPeople(r.directors, true)}</td>
      <td>${formatPeople(r.secretaries)}</td>
      <td>${formatPeople(r.shareholders)}</td>
      <td>${formatPeople(r.beneficialOwners)}</td>
      <td style="text-align:center;">
        <button class="editBtn" data-index="${index}">Edit</button><br><br>
        <button class="deleteBtn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  table.querySelectorAll('.editBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const records = readData();
      const data = records[idx];
      populateForm(data, idx); // 👈 moved populateForm to editFunctions.js
    });
  });

  table.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      const records = readData();
      const name = records[idx].companyInfo.companyName;
      if (confirm(`Delete "${name}"?`)) {
        records.splice(idx, 1);
        writeData(records);
        renderAllCompanies(allCompaniesContainer, populateForm);
      }
    });
  });

  allCompaniesContainer.appendChild(table);
}
// End of storageAndRender.js