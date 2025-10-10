document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('companyForm');
  const allCompaniesContainer = document.getElementById('allCompaniesContainer');

  // Add a separate update button next to the submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  const updateBtn = document.createElement('button');
  updateBtn.type = 'button';
  updateBtn.textContent = 'Update Company';
  updateBtn.style.display = 'none'; // Hidden by default
  submitBtn.insertAdjacentElement('afterend', updateBtn);

  // --- STORAGE HELPERS ---
  function readData() {
    const raw = localStorage.getItem('companyData');
    return raw ? JSON.parse(raw) : [];
  }
  function writeData(data) {
    localStorage.setItem('companyData', JSON.stringify(data));
  }

  // --- COLLECT FORM DATA ---
  function collectCompanyData() {
    const companyInfo = {
      companyName: document.getElementById('companyName').value.trim(),
      registrationNumber: document.getElementById('registrationNumber').value.trim(),
      incorporationDate: document.getElementById('incorporationDate').value.trim(),
      businessAddress: document.getElementById('businessAddress').value.trim(),
      city: document.getElementById('companyCity').value.trim(),
      country: document.getElementById('companyCountry').value.trim(),
      natureOfBusiness: document.getElementById('natureOfBusiness').value.trim(),
      taxId: document.getElementById('taxId').value.trim()
    };

    const roles = ['directors', 'secretaries', 'shareholders', 'beneficialOwners'];
    const peopleData = {
      directors: [],
      secretaries: [],
      shareholders: [],
      beneficialOwners: []
    };

    roles.forEach(role => {
      const section = document.getElementById(`${role}Section`);
      if (!section) return;
      const persons = section.querySelectorAll('.person');

      persons.forEach(p => {
        const personObj = {};
        const contentBlocks = p.querySelectorAll('.content');

        if (contentBlocks[0]) {
          const [fullName, email, phone, dob] = contentBlocks[0].querySelectorAll('input');
          personObj.fullName = fullName?.value.trim() || '';
          personObj.email = email?.value.trim() || '';
          personObj.phone = phone?.value.trim() || '';
          personObj.dob = dob?.value.trim() || '';
        }

        if (contentBlocks[1]) {
          const [address, city, country] = contentBlocks[1].querySelectorAll('input');
          personObj.address = address?.value.trim() || '';
          personObj.city = city?.value.trim() || '';
          personObj.country = country?.value.trim() || '';
        }

        if (role === 'directors') {
          personObj.roles = {
            directorOnly: p.querySelector('.director-only')?.checked || false,
            alsoSecretary: p.querySelector('.also-secretary')?.checked || false,
            alsoShareholder: p.querySelector('.also-shareholder')?.checked || false,
            alsoBeneficial: p.querySelector('.also-beneficial')?.checked || false,
            shareholderPercent: p.querySelector('.shareholder-input')?.value || ''
          };
        }

        const hasAnyData = Object.values(personObj).some(v => v);
        if (hasAnyData) peopleData[role].push(personObj);
      });
    });

    const expandedData = { ...peopleData };

    peopleData.directors.forEach(d => {
      if (!d.roles) return;
      if (d.roles.alsoSecretary)
        expandedData.secretaries.push({ ...d, fromRole: 'Director (Also Secretary)' });
      if (d.roles.alsoShareholder)
        expandedData.shareholders.push({
          ...d,
          sharePercent: d.roles.shareholderPercent || '',
          fromRole: 'Director (Also Shareholder)'
        });
      if (d.roles.alsoBeneficial)
        expandedData.beneficialOwners.push({ ...d, fromRole: 'Director (Also Beneficial Owner)' });
    });

    return { companyInfo, ...expandedData };
  }

  // --- RENDER ALL COMPANIES ---
  function renderAllCompanies() {
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

    records.forEach((r, index) => {
      const c = r.companyInfo;

      const companyDetailsHTML = `
        <strong>${c.companyName}</strong><br>
        Reg. No: ${c.registrationNumber || '-'}<br>
        Date: ${c.incorporationDate || '-'}<br>
        Address: ${c.businessAddress || '-'}, ${c.city || '-'}, ${c.country || '-'}<br>
        Nature: ${c.natureOfBusiness || '-'}<br>
        Tax ID: ${c.taxId || '-'}
      `;

      const formatPeople = (arr, showRoles = false) => {
        if (!arr || arr.length === 0) return '<em>None</em>';
        return arr
          .map(p => `<div><strong>${p.fullName || '-'}</strong><br>Email: ${p.email || '-'}<br>
          Phone: ${p.phone || '-'}<br>DOB: ${p.dob || '-'}<br>
          Address: ${p.address || '-'}, ${p.city || '-'}, ${p.country || '-'}
          ${p.fromRole ? `<br><em>${p.fromRole}</em>` : ''}
          ${showRoles && p.roles ? `<br><small>${Object.entries(p.roles)
            .filter(([k, v]) => v)
            .map(([k, v]) => (k === 'shareholderPercent' ? `${v}%` : k.replace('also', 'Also')))
            .join('; ')}</small>` : ''}
          </div><hr>`).join('');
      };

      const row = document.createElement('tr');
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

    allCompaniesContainer.appendChild(table);

    // --- ACTIONS ---
    tbody.querySelectorAll('.editBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const records = readData();
        const data = records[idx];
        populateForm(data);
        form.dataset.editIndex = idx;
        submitBtn.style.display = 'none';
        updateBtn.style.display = 'inline-block';
        alert(`✏️ Editing: ${data.companyInfo.companyName}`);
      });
    });

    tbody.querySelectorAll('.deleteBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const records = readData();
        const name = records[idx].companyInfo.companyName;
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
          records.splice(idx, 1);
          writeData(records);
          renderAllCompanies();
          alert(`🗑️ Deleted: ${name}`);
        }
      });
    });
  }

  // --- POPULATE FORM ---
  function populateForm(data) {
    const c = data.companyInfo;
    document.getElementById('companyName').value = c.companyName;
    document.getElementById('registrationNumber').value = c.registrationNumber;
    document.getElementById('incorporationDate').value = c.incorporationDate;
    document.getElementById('businessAddress').value = c.businessAddress;
    document.getElementById('companyCity').value = c.city;
    document.getElementById('companyCountry').value = c.country;
    document.getElementById('natureOfBusiness').value = c.natureOfBusiness;
    document.getElementById('taxId').value = c.taxId;
  }

  // --- SUBMIT HANDLER (Add new company) ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const companyData = collectCompanyData();
    if (!companyData.companyInfo.companyName) {
      alert('Please enter a company name.');
      return;
    }

    let records = readData();
    const exists = records.find(
      r => r.companyInfo.companyName.toLowerCase() === companyData.companyInfo.companyName.toLowerCase()
    );
    if (exists) {
      alert('Company already exists. Use Update instead.');
      return;
    }

    records.push(companyData);
    writeData(records);
    renderAllCompanies();
    alert(`✅ Added: ${companyData.companyInfo.companyName}`);
    form.reset();
  });

  // --- UPDATE HANDLER ---
  updateBtn.addEventListener('click', () => {
    const idx = parseInt(form.dataset.editIndex);
    if (isNaN(idx)) {
      alert('No record selected for update.');
      return;
    }
    const records = readData();
    const companyData = collectCompanyData();
    records[idx] = companyData;
    writeData(records);
    renderAllCompanies();
    alert(`🔄 Updated: ${companyData.companyInfo.companyName}`);
    form.reset();
    delete form.dataset.editIndex;
    submitBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
  });

  // --- INITIAL LOAD ---
  renderAllCompanies();
});
