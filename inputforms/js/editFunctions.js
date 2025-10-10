// formActions.js
// Handles editing and repopulating saved company data

function populateForm(data) {
  // --- COMPANY INFO ---
  const c = data.companyInfo;
  document.getElementById('companyName').value = c.companyName;
  document.getElementById('registrationNumber').value = c.registrationNumber;
  document.getElementById('incorporationDate').value = c.incorporationDate;
  document.getElementById('businessAddress').value = c.businessAddress;
  document.getElementById('companyCity').value = c.city;
  document.getElementById('companyCountry').value = c.country;
  document.getElementById('natureOfBusiness').value = c.natureOfBusiness;
  document.getElementById('taxId').value = c.taxId;

  // --- CLEAR EXISTING ROLE SECTIONS ---
  const roles = ['directors', 'secretaries', 'shareholders', 'beneficialOwners'];
  roles.forEach(role => {
    const section = document.getElementById(`${role}Section`);
    if (section) section.innerHTML = ''; // clear old fields
  });

  // --- REPOPULATE ROLE DATA ---
  function createPersonBlock(role, person) {
    const section = document.getElementById(`${role}Section`);
    if (!section) return;

    const personDiv = document.createElement('div');
    personDiv.classList.add('person');
    personDiv.style.border = '1px solid #ccc';
    personDiv.style.margin = '8px 0';
    personDiv.style.padding = '8px';
    personDiv.innerHTML = `
      <div class="content">
        <label>Full Name: <input type="text" value="${person.fullName || ''}"></label><br>
        <label>Email: <input type="email" value="${person.email || ''}"></label><br>
        <label>Phone: <input type="text" value="${person.phone || ''}"></label><br>
        <label>DOB: <input type="date" value="${person.dob || ''}"></label>
      </div>
      <div class="content">
        <label>Address: <input type="text" value="${person.address || ''}"></label><br>
        <label>City: <input type="text" value="${person.city || ''}"></label><br>
        <label>Country: <input type="text" value="${person.country || ''}"></label>
      </div>
    `;

    // --- SPECIAL HANDLING FOR DIRECTORS ---
    if (role === 'directors') {
      const rolesHTML = `
        <div class="roles">
          <label><input type="checkbox" class="director-only" ${person.roles?.directorOnly ? 'checked' : ''}> Director Only</label><br>
          <label><input type="checkbox" class="also-secretary" ${person.roles?.alsoSecretary ? 'checked' : ''}> Also Secretary</label><br>
          <label><input type="checkbox" class="also-shareholder" ${person.roles?.alsoShareholder ? 'checked' : ''}> Also Shareholder</label><br>
          <label><input type="checkbox" class="also-beneficial" ${person.roles?.alsoBeneficial ? 'checked' : ''}> Also Beneficial Owner</label><br>
          <label>Share % (if shareholder): <input type="text" class="shareholder-input" value="${person.roles?.shareholderPercent || ''}"></label>
        </div>
      `;
      personDiv.insertAdjacentHTML('beforeend', rolesHTML);
    }

    section.appendChild(personDiv);
  }

  roles.forEach(role => {
    const people = data[role] || [];
    people.forEach(p => createPersonBlock(role, p));
  });
}

// ✅ Export for use in other scripts
window.populateForm = populateForm;
