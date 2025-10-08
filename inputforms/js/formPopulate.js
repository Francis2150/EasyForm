// formPopulate.js
function populateFormWithCompanyData(companyData) {
  ['companyInfoSection','directorsSectionContainer','secretariesSectionContainer','shareholdersSectionContainer','beneficialOwnersSectionContainer']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.display = (id === 'companyInfoSection') ? 'block' : 'none';
    });

  // Company info
  document.getElementById('companyName').value = companyData.info.companyName || '';
  document.getElementById('registrationNumber').value = companyData.info.registrationNumber || '';
  document.getElementById('incorporationDate').value = companyData.info.incorporationDate || '';
  document.getElementById('businessAddress').value = companyData.info.businessAddress || '';
  document.getElementById('companyCity').value = companyData.info.companyCity || '';
  document.getElementById('companyCountry').value = companyData.info.companyCountry || '';
  document.getElementById('natureOfBusiness').value = companyData.info.natureOfBusiness || '';
  document.getElementById('taxId').value = companyData.info.taxId || '';

  // Clear old entries
  ['directors', 'secretaries', 'shareholders', 'beneficialOwners'].forEach(role => {
    const container = document.getElementById(`${role}Container`);
    if (container) container.innerHTML = '';
  });

  // Helpers
  const directorsContainer = document.getElementById('directorsContainer');
  const secretariesContainer = document.getElementById('secretariesContainer');
  const shareholdersContainer = document.getElementById('shareholdersContainer');
  const beneficialContainer = document.getElementById('beneficialOwnersContainer');

  if (companyData.roles?.directors) {
    companyData.roles.directors.forEach((p, i) => {
      const block = makeDirectorBlock(p, i);
      directorsContainer.appendChild(block);
    });
    relabel(directorsContainer, 'Director');
  }

  if (companyData.roles?.secretaries) {
    companyData.roles.secretaries.forEach((p, i) => {
      const block = makeSimplePersonBlock(p, i, 'secretaries');
      secretariesContainer.appendChild(block);
    });
    relabel(secretariesContainer, 'Secretary');
  }

  if (companyData.roles?.shareholders) {
    companyData.roles.shareholders.forEach((p, i) => {
      const block = makeSimplePersonBlock(p, i, 'shareholders');
      shareholdersContainer.appendChild(block);
    });
    relabel(shareholdersContainer, 'Shareholder');
  }

  if (companyData.roles?.beneficialOwners) {
    companyData.roles.beneficialOwners.forEach((p, i) => {
      const block = makeSimplePersonBlock(p, i, 'beneficialOwners');
      beneficialContainer.appendChild(block);
    });
    relabel(beneficialContainer, 'Beneficial Owner');
  }
}

// Utilities
function relabel(container, roleLabel) {
  if (!container) return;
  const blocks = container.querySelectorAll('.person');
  blocks.forEach((b, i) => {
    const h4 = b.querySelector('h4');
    if (h4) h4.textContent = `${roleLabel} ${i + 1}`;
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
