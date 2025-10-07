document.addEventListener('DOMContentLoaded', () => {
    // Create role sections dynamically (keeps markup DRY)
    function createRoleSection(roleId, roleLabel) {
      const section = document.getElementById(`${roleId}Section`);
      section.innerHTML = `
        <h3>${roleLabel}</h3>
        <div id="${roleId}Container"></div>
        <button type="button" class="addBtn" id="add${roleLabel}">Add ${roleLabel}</button>
        <hr/>
      `;
      const container = section.querySelector(`#${roleId}Container`);
      const addBtn = section.querySelector(`#add${roleLabel}`);
      let count = 1;
      container.appendChild(createPersonBlock(roleId, roleLabel, count));

      addBtn.addEventListener('click', () => {
        count++;
        container.appendChild(createPersonBlock(roleId, roleLabel, count));
      });

      // Delegate remove and collapse events
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeBtn')) {
          e.target.closest('.person').remove();
          relabel(container, roleLabel);
        }
        if (e.target.classList.contains('collapse-btn')) {
          e.target.nextElementSibling.classList.toggle('collapsed');
        }
      });
    }

    // Create a person block for a given role
    function createPersonBlock(roleId, roleLabel, index) {
      const div = document.createElement('div');
      div.classList.add('person');
      div.dataset.index = index;

      // Role-selection UI: only for directors (top of block)
      let roleSelectionHTML = '';
      if (roleId === 'directors') {
        roleSelectionHTML = `
          <div class="role-selection">
            <label><strong>Role Selection:</strong></label><br>
            <label><input type="checkbox" class="role-checkbox director-only" name="director_role_${index}[]" value="Director" checked> Director only</label><br>
            <label><input type="checkbox" class="role-checkbox also-secretary" name="director_role_${index}[]" value="Secretary"> Also acts as Secretary</label><br>
            <label><input type="checkbox" class="role-checkbox also-shareholder" name="director_role_${index}[]" value="Shareholder"> Also a Shareholder</label><br>
            <label><input type="checkbox" class="role-checkbox also-beneficial" name="director_role_${index}[]" value="BeneficialOwner"> Also a Beneficial Owner</label>
          </div>
        `;
      }

      div.innerHTML = `
        <h4>${roleLabel} ${index}</h4>
        ${roleSelectionHTML}
        <div class="section">
          <button type="button" class="collapse-btn">Toggle Personal Info</button>
          <div class="content">
            <div class="form-group"><label>Full Name:</label><input type="text" name="${roleId}_name[]" /></div>
            <div class="form-group"><label>Email:</label><input type="email" name="${roleId}_email[]" /></div>
            <div class="form-group"><label>Phone:</label><input type="text" name="${roleId}_phone[]" /></div>
            <div class="form-group"><label>Date of Birth:</label><input type="date" name="${roleId}_dob[]" /></div>
          </div>
        </div>
        <div class="section">
          <button type="button" class="collapse-btn">Toggle Residential Info</button>
          <div class="content">
            <div class="form-group"><label>Address:</label><input type="text" name="${roleId}_address[]" /></div>
            <div class="form-group"><label>City:</label><input type="text" name="${roleId}_city[]" /></div>
            <div class="form-group"><label>Country:</label><input type="text" name="${roleId}_country[]" /></div>
          </div>
        </div>
        <button type="button" class="removeBtn">Remove</button>
      `;

      // If director block, wire mutual exclusivity among checkboxes (Director only vs others)
      if (roleId === 'directors') {
        const directorOnly = div.querySelector('.director-only');
        const alsoSecretary = div.querySelector('.also-secretary');
        const alsoShareholder = div.querySelector('.also-shareholder');
        const alsoBeneficial = div.querySelector('.also-beneficial');
        const others = [alsoSecretary, alsoShareholder, alsoBeneficial];

        directorOnly.addEventListener('change', () => {
          if (directorOnly.checked) {
            others.forEach(cb => cb.checked = false);
          }
        });

        others.forEach(cb => {
          cb.addEventListener('change', () => {
            if (cb.checked) {
              directorOnly.checked = false;
            } else {
              // If none of the others are checked, ensure at least directorOnly remains checked
              if (!alsoSecretary.checked && !alsoShareholder.checked && !alsoBeneficial.checked) {
                directorOnly.checked = true;
              }
            }
          });
        });
      }

      return div;
    }

    // Relabel headings in a container after removals
    function relabel(container, roleLabel) {
      const blocks = container.querySelectorAll('.person');
      blocks.forEach((b, i) => b.querySelector('h4').textContent = `${roleLabel} ${i + 1}`);
    }

    // Initialize the four role sections
    createRoleSection('directors', 'Director');
    createRoleSection('secretaries', 'Secretary');
    createRoleSection('shareholders', 'Shareholder');
    createRoleSection('beneficialOwners', 'Beneficial Owner');

    // Handle form submit
    document.getElementById('companyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Validate: each director must have at least one role selected
      const directorBlocks = document.querySelectorAll('#directorsContainer .person');
      for (let block of directorBlocks) {
        const checkboxes = block.querySelectorAll('.role-selection input[type="checkbox"]');
        if (![...checkboxes].some(cb => cb.checked)) {
          alert('⚠️ Please select at least one role for each director.');
          return;
        }
      }

      // Company-level info
      const companyInfo = {
        companyName: formData.get('companyName') || '',
        registrationNumber: formData.get('registrationNumber') || '',
        incorporationDate: formData.get('incorporationDate') || '',
        businessAddress: formData.get('businessAddress') || '',
        companyCity: formData.get('companyCity') || '',
        companyCountry: formData.get('companyCountry') || '',
        natureOfBusiness: formData.get('natureOfBusiness') || '',
        taxId: formData.get('taxId') || ''
      };

      // Collect role-specific entries (these collect the form fields for each role)
      const directors = collectRoleData(formData, 'directors');
      const secretaries = collectRoleData(formData, 'secretaries');
      const shareholders = collectRoleData(formData, 'shareholders');
      const beneficialOwners = collectRoleData(formData, 'beneficialOwners');

      // If directors indicated they also act as other roles, clone them into those arrays
      const directorBlocksList = document.querySelectorAll('#directorsContainer .person');
      directorBlocksList.forEach((block, i) => {
        const checked = [...block.querySelectorAll('.role-selection input:checked')].map(cb => cb.value);
        // Ensure director record has roles array for later editing/preview
        directors[i].roles = checked.slice(); // shallow copy

        if (checked.includes('Secretary')) {
          // push a copy (with same personal/residential) to secretaries
          secretaries.push(JSON.parse(JSON.stringify(directors[i])));
        }
        if (checked.includes('Shareholder')) {
          shareholders.push(JSON.parse(JSON.stringify(directors[i])));
        }
        if (checked.includes('BeneficialOwner')) {
          beneficialOwners.push(JSON.parse(JSON.stringify(directors[i])));
        }
      });

      const companyRoles = {
        directors,
        secretaries,
        shareholders,
        beneficialOwners
      };

      const fullCompanyData = { info: companyInfo, roles: companyRoles };

      // Send to external renderer (companiesTablesGrouped.js)
      window.renderCompanyTables(fullCompanyData);

      // Reset form for next entry
      e.target.reset();

      // Re-initialize role sections (to get initial director block back)
      // Clear containers
      ['directors', 'secretaries', 'shareholders', 'beneficialOwners'].forEach(r => {
        const c = document.getElementById(`${r}Container`);
        if (c) c.innerHTML = '';
      });
      // Recreate starting blocks
      createRoleSection('directors', 'Director');
      createRoleSection('secretaries', 'Secretary');
      createRoleSection('shareholders', 'Shareholder');
      createRoleSection('beneficialOwners', 'Beneficial Owner');
    });

    // Collects person arrays for a role from FormData
    function collectRoleData(formData, roleId) {
      const names = formData.getAll(`${roleId}_name[]`);
      const emails = formData.getAll(`${roleId}_email[]`);
      const phones = formData.getAll(`${roleId}_phone[]`);
      const dobs = formData.getAll(`${roleId}_dob[]`);
      const addresses = formData.getAll(`${roleId}_address[]`);
      const cities = formData.getAll(`${roleId}_city[]`);
      const countries = formData.getAll(`${roleId}_country[]`);
      return names.map((_, i) => ({
        id: i + 1,
        personal: { name: names[i] || '', email: emails[i] || '', phone: phones[i] || '', dob: dobs[i] || '' },
        residential: { address: addresses[i] || '', city: cities[i] || '', country: countries[i] || '' }
      }));
    }
  });