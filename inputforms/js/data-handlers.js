/* data-handlers.js
   Responsible for:
   - listening to the company form submit
   - extracting and structuring data
   - applying deduplication
   - calling window.renderCompanyTables (table-render.js)
   - resetting the form UI
*/

(function () {
  /* Helper: collect person arrays for a role from FormData */
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

  // Wait for DOM and other modules (ui-utils & form-setup) to be ready
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('companyForm');
    if (!form) return console.warn('data-handlers: #companyForm not found');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      // Validate: each director must have at least one role selected
      const directorBlocks = document.querySelectorAll('#directorsContainer .person');
      for (let block of directorBlocks) {
        const checkboxes = block.querySelectorAll('.role-selection input[type="checkbox"]');
        if (checkboxes.length && ![...checkboxes].some(cb => cb.checked)) {
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

      // Collect role-specific entries
      let directors = collectRoleData(formData, 'directors');
      let secretaries = collectRoleData(formData, 'secretaries');
      let shareholders = collectRoleData(formData, 'shareholders');
      let beneficialOwners = collectRoleData(formData, 'beneficialOwners');

      // If directors indicated they also act as other roles, clone them into those arrays
      const directorBlocksList = document.querySelectorAll('#directorsContainer .person');
      directorBlocksList.forEach((block, i) => {
        const checked = [...block.querySelectorAll('.role-selection input:checked')].map(cb => cb.value);
        // Ensure director record has roles array for later editing/preview
        if (directors[i]) directors[i].roles = checked.slice(); // shallow copy

        if (checked.includes('Secretary')) {
          secretaries.push(JSON.parse(JSON.stringify(directors[i])));
        }
        if (checked.includes('Shareholder')) {
          shareholders.push(JSON.parse(JSON.stringify(directors[i])));
        }
        if (checked.includes('BeneficialOwner')) {
          beneficialOwners.push(JSON.parse(JSON.stringify(directors[i])));
        }
      });

      // Remove duplicates using helper exposed on window (ui-utils)
      const dedupe = window.dedupePeopleByKey || (arr => arr);
      directors = dedupe(directors);
      secretaries = dedupe(secretaries);
      shareholders = dedupe(shareholders);
      beneficialOwners = dedupe(beneficialOwners);

      const companyRoles = { directors, secretaries, shareholders, beneficialOwners };
      const fullCompanyData = { info: companyInfo, roles: companyRoles };

      // Send to external renderer (table-render.js)
      if (typeof window.renderCompanyTables === 'function') {
        window.renderCompanyTables(fullCompanyData);
      } else {
        console.warn('renderCompanyTables not available');
      }

      // Reset the HTML form (native inputs)
      e.target.reset();

      // Reset role containers (but keep the section markup that form-setup created)
      ['directors', 'secretaries', 'shareholders', 'beneficialOwners'].forEach(roleId => {
        const section = document.getElementById(`${roleId}Section`);
        if (!section) return;
        const container = section.querySelector(`#${roleId}Container`);
        if (!container) return;
        container.innerHTML = '';
        // append initial single person block using function provided by form-setup
        if (typeof window.createPersonBlock === 'function') {
          container.appendChild(window.createPersonBlock(roleId, (roleId === 'beneficialOwners' ? 'Beneficial Owner' : roleId.slice(0, -1).charAt(0).toUpperCase() + roleId.slice(1, -1)), 1));
        }
      });
    });
  });
})();
