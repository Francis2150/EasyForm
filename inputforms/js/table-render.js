/* table-render.js
   Renders the company preview blocks, tables, and supports editing & deletion.
   Defines window.renderCompanyTables and window.populateFormWithCompanyData
*/

(function () {
  let companiesData = [];
  let editingCompanyIndex = null;

  /* Exposed function that main/data-handlers will call with the structured company data */
  window.renderCompanyTables = function (companyData) {
    const output = document.getElementById('companiesOutput');
    if (!output) return console.warn('table-render: #companiesOutput missing');

    // If editing, replace the existing entry
    if (editingCompanyIndex !== null) {
      companiesData[editingCompanyIndex] = companyData;
      const existingDiv = output.querySelector(`.company-block[data-index="${editingCompanyIndex}"]`);
      if (existingDiv) {
        existingDiv.replaceWith(createCompanyBlock(editingCompanyIndex, companyData));
      }
      alert(`✅ Company ${editingCompanyIndex + 1} updated successfully!`);
      editingCompanyIndex = null;
      return;
    }

    // Otherwise append new
    const newIndex = companiesData.length;
    companiesData.push(companyData);
    const companyDiv = createCompanyBlock(newIndex, companyData);
    output.appendChild(companyDiv);
    alert(`✅ Company ${newIndex + 1} added below!`);
  };

  /* Creates the DOM block showing the company header and role tables */
  function createCompanyBlock(index, companyData) {
    const companyDiv = document.createElement('div');
    companyDiv.classList.add('company-block');
    companyDiv.dataset.index = index;

    // simple card styling inline (keeps this self-contained)
    companyDiv.style.background = '#fff';
    companyDiv.style.padding = '15px';
    companyDiv.style.margin = '20px auto';
    companyDiv.style.borderRadius = '10px';
    companyDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    // header info
    const header = document.createElement('div');
    header.innerHTML = `
      <h3 style="color:#007bff;">${escapeHtml(companyData.info.companyName) || 'Unnamed Company'}</h3>
      <p><strong>Reg. No:</strong> ${escapeHtml(companyData.info.registrationNumber) || '-'}<br>
         <strong>Incorporation Date:</strong> ${escapeHtml(companyData.info.incorporationDate) || '-'}<br>
         <strong>Address:</strong> ${escapeHtml(companyData.info.businessAddress) || '-'}, 
         ${escapeHtml(companyData.info.companyCity) || '-'}, ${escapeHtml(companyData.info.companyCountry) || '-'}<br>
         <strong>Nature of Business:</strong> ${escapeHtml(companyData.info.natureOfBusiness) || '-'}<br>
         <strong>Tax ID:</strong> ${escapeHtml(companyData.info.taxId) || '-'}</p>
      <hr>
    `;
    companyDiv.appendChild(header);

    // action buttons
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

    // build role tables (only for roles that have items)
    const roleOrder = ['directors', 'secretaries', 'shareholders', 'beneficialOwners'];
    roleOrder.forEach(role => {
      const people = (companyData.roles && companyData.roles[role]) ? companyData.roles[role] : [];
      if (!people || !people.length) return;

      const sectionTitle = document.createElement('h4');
      sectionTitle.textContent = role === 'beneficialOwners' ? 'Beneficial Owners' : (role.charAt(0).toUpperCase() + role.slice(1));
      companyDiv.appendChild(sectionTitle);

      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '25px';

      const headers = ['#','Full Name','Email','Phone','Date of Birth','Address','City','Country'];
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headers.forEach(h => {
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
      people.forEach((p, idx) => {
        const tr = document.createElement('tr');
        const createCell = txt => {
          const td = document.createElement('td');
          td.textContent = txt || '-';
          td.style.padding = '8px';
          td.style.borderBottom = '1px solid #ccc';
          return td;
        };
        tr.appendChild(createCell(p.id || idx + 1));
        tr.appendChild(createCell(p.personal && p.personal.name));
        tr.appendChild(createCell(p.personal && p.personal.email));
        tr.appendChild(createCell(p.personal && p.personal.phone));
        tr.appendChild(createCell(p.personal && p.personal.dob));
        tr.appendChild(createCell(p.residential && p.residential.address));
        tr.appendChild(createCell(p.residential && p.residential.city));
        tr.appendChild(createCell(p.residential && p.residential.country));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      companyDiv.appendChild(table);
    });

    // delete behavior
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete ${companyData.info.companyName}?`)) {
        companyDiv.remove();
        companiesData[index] = null;
        alert(`❌ Company ${index + 1} deleted.`);
      }
    });

    // edit behavior: pre-fill the form and scroll to top
    editBtn.addEventListener('click', () => {
      window.populateFormWithCompanyData && window.populateFormWithCompanyData(companyData);
      editingCompanyIndex = index;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return companyDiv;
  }

  /* Repopulate form when editing (this recreates the role containers and input values).
     It relies on window.createPersonBlock (form-setup) to create blocks where necessary. */
  window.populateFormWithCompanyData = function (companyData) {
    // Make sure company info section visible (nav may hide others)
    ['companyInfoSection','directorsSectionContainer','secretariesSectionContainer','shareholdersSectionContainer','beneficialOwnersSectionContainer']
      .forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = (id === 'companyInfoSection') ? 'block' : 'none';
      });

    // Fill company inputs
    document.getElementById('companyName').value = companyData.info.companyName || '';
    document.getElementById('registrationNumber').value = companyData.info.registrationNumber || '';
    document.getElementById('incorporationDate').value = companyData.info.incorporationDate || '';
    document.getElementById('businessAddress').value = companyData.info.businessAddress || '';
    document.getElementById('companyCity').value = companyData.info.companyCity || '';
    document.getElementById('companyCountry').value = companyData.info.companyCountry || '';
    document.getElementById('natureOfBusiness').value = companyData.info.natureOfBusiness || '';
    document.getElementById('taxId').value = companyData.info.taxId || '';

    // Clear role containers
    ['directors', 'secretaries', 'shareholders', 'beneficialOwners'].forEach(role => {
      const container = document.getElementById(`${role}Container`);
      if (container) container.innerHTML = '';
    });

    // Helper: create director block from person object
    function makeDirectorBlock(p, idx) {
      // build block similar to form-setup, but prefilled values & restored checkboxes
      const block = document.createElement('div');
      block.classList.add('person');
      block.innerHTML = `
        <h4>Director ${idx + 1}</h4>
        <div class="role-selection">
          <label><strong>Role Selection:</strong></label><br>
          <label><input type="checkbox" class="role-checkbox director-only" value="Director"> Director only</label><br>
          <label><input type="checkbox" class="role-checkbox also-secretary" value="Secretary"> Also acts as Secretary</label><br>
          <label><input type="checkbox" class="role-checkbox also-shareholder" value="Shareholder"> Also a Shareholder</label><br>
          <label><input type="checkbox" class="role-checkbox also-beneficial" value="BeneficialOwner"> Also a Beneficial Owner</label>
        </div>
        <div class="section">
          <div class="form-group"><label>Full Name:</label><input type="text" name="directors_name[]" value="${escapeHtml((p.personal && p.personal.name) || '')}" /></div>
          <div class="form-group"><label>Email:</label><input type="email" name="directors_email[]" value="${escapeHtml((p.personal && p.personal.email) || '')}" /></div>
          <div class="form-group"><label>Phone:</label><input type="text" name="directors_phone[]" value="${escapeHtml((p.personal && p.personal.phone) || '')}" /></div>
          <div class="form-group"><label>Date of Birth:</label><input type="date" name="directors_dob[]" value="${escapeHtml((p.personal && p.personal.dob) || '')}" /></div>
        </div>
        <div class="section">
          <div class="form-group"><label>Address:</label><input type="text" name="directors_address[]" value="${escapeHtml((p.residential && p.residential.address) || '')}" /></div>
          <div class="form-group"><label>City:</label><input type="text" name="directors_city[]" value="${escapeHtml((p.residential && p.residential.city) || '')}" /></div>
          <div class="form-group"><label>Country:</label><input type="text" name="directors_country[]" value="${escapeHtml((p.residential && p.residential.country) || '')}" /></div>
        </div>
        <button type="button" class="removeBtn">Remove</button>
      `;

      // restore checkbox states from p.roles if present
      const directorOnlyCb = block.querySelector('.director-only');
      const alsoSecretaryCb = block.querySelector('.also-secretary');
      const alsoShareholderCb = block.querySelector('.also-shareholder');
      const alsoBeneficialCb = block.querySelector('.also-beneficial');

      if (Array.isArray(p.roles)) {
        const hasDirector = p.roles.includes('Director');
        const hasSecretary = p.roles.includes('Secretary');
        const hasShareholder = p.roles.includes('Shareholder');
        const hasBeneficial = p.roles.includes('BeneficialOwner');

        directorOnlyCb.checked = hasDirector && !(hasSecretary || hasShareholder || hasBeneficial);
        alsoSecretaryCb.checked = hasSecretary;
        alsoShareholderCb.checked = hasShareholder;
        alsoBeneficialCb.checked = hasBeneficial;

        if (!hasDirector && !hasSecretary && !hasShareholder && !hasBeneficial) {
          directorOnlyCb.checked = true;
        }
      } else {
        directorOnlyCb.checked = true;
      }

      // mutual exclusivity handlers (same logic as form-setup)
      directorOnlyCb.addEventListener('change', () => {
        if (directorOnlyCb.checked) {
          alsoSecretaryCb.checked = false;
          alsoShareholderCb.checked = false;
          alsoBeneficialCb.checked = false;
        } else {
          if (!alsoSecretaryCb.checked && !alsoShareholderCb.checked && !alsoBeneficialCb.checked) {
            directorOnlyCb.checked = true;
          }
        }
      });

      [alsoSecretaryCb, alsoShareholderCb, alsoBeneficialCb].forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            directorOnlyCb.checked = false;
          } else {
            if (!alsoSecretaryCb.checked && !alsoShareholderCb.checked && !alsoBeneficialCb.checked) {
              directorOnlyCb.checked = true;
            }
          }
        });
      });

      // remove btn behavior
      const removeBtn = block.querySelector('.removeBtn');
      removeBtn.addEventListener('click', () => {
        block.remove();
        const container = document.getElementById('directorsContainer');
        window.relabel && window.relabel(container, 'Director');
      });

      return block;
    }

    // Helper to create simple person block for other roles
    function makeSimplePersonBlock(p, idx, role) {
      const block = document.createElement('div');
      block.classList.add('person');
      const roleSingular = role === 'beneficialOwners' ? 'Beneficial Owner' : role.slice(0, -1).charAt(0).toUpperCase() + role.slice(1, -1);
      block.innerHTML = `
        <h4>${roleSingular} ${idx + 1}</h4>
        <div class="section">
          <div class="form-group"><label>Full Name:</label><input type="text" name="${role}_name[]" value="${escapeHtml((p.personal && p.personal.name) || '')}" /></div>
          <div class="form-group"><label>Email:</label><input type="email" name="${role}_email[]" value="${escapeHtml((p.personal && p.personal.email) || '')}" /></div>
          <div class="form-group"><label>Phone:</label><input type="text" name="${role}_phone[]" value="${escapeHtml((p.personal && p.personal.phone) || '')}" /></div>
          <div class="form-group"><label>Date of Birth:</label><input type="date" name="${role}_dob[]" value="${escapeHtml((p.personal && p.personal.dob) || '')}" /></div>
        </div>
        <div class="section">
          <div class="form-group"><label>Address:</label><input type="text" name="${role}_address[]" value="${escapeHtml((p.residential && p.residential.address) || '')}" /></div>
          <div class="form-group"><label>City:</label><input type="text" name="${role}_city[]" value="${escapeHtml((p.residential && p.residential.city) || '')}" /></div>
          <div class="form-group"><label>Country:</label><input type="text" name="${role}_country[]" value="${escapeHtml((p.residential && p.residential.country) || '')}" /></div>
        </div>
        <button type="button" class="removeBtn">Remove</button>
      `;

      const removeBtn = block.querySelector('.removeBtn');
      removeBtn.addEventListener('click', () => {
        block.remove();
        const container = document.getElementById(`${role}Container`);
        window.relabel && window.relabel(container, role === 'beneficialOwners' ? 'Beneficial Owner' : role.slice(0, -1).charAt(0).toUpperCase() + role.slice(1, -1));
      });

      return block;
    }

    // populate directors
    const directorsContainer = document.getElementById('directorsContainer');
    if (companyData.roles && Array.isArray(companyData.roles.directors)) {
      companyData.roles.directors.forEach((p, i) => {
        const block = makeDirectorBlock(p, i);
        directorsContainer.appendChild(block);
      });
      window.relabel && window.relabel(directorsContainer, 'Director');
    }

    // populate secretaries
    const secretariesContainer = document.getElementById('secretariesContainer');
    if (companyData.roles && Array.isArray(companyData.roles.secretaries)) {
      companyData.roles.secretaries.forEach((p, i) => {
        const block = makeSimplePersonBlock(p, i, 'secretaries');
        secretariesContainer.appendChild(block);
      });
      window.relabel && window.relabel(secretariesContainer, 'Secretary');
    }

    // populate shareholders
    const shareholdersContainer = document.getElementById('shareholdersContainer');
    if (companyData.roles && Array.isArray(companyData.roles.shareholders)) {
      companyData.roles.shareholders.forEach((p, i) => {
        const block = makeSimplePersonBlock(p, i, 'shareholders');
        shareholdersContainer.appendChild(block);
      });
      window.relabel && window.relabel(shareholdersContainer, 'Shareholder');
    }

    // populate beneficial owners
    const beneficialContainer = document.getElementById('beneficialOwnersContainer');
    if (companyData.roles && Array.isArray(companyData.roles.beneficialOwners)) {
      companyData.roles.beneficialOwners.forEach((p, i) => {
        const block = makeSimplePersonBlock(p, i, 'beneficialOwners');
        beneficialContainer.appendChild(block);
      });
      window.relabel && window.relabel(beneficialContainer, 'Beneficial Owner');
    }
  };
})();
