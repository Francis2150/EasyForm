// companiesTablesGrouped.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('directorsForm');
  const directorsContainer = document.getElementById('directorsContainer');

  // Container to hold all company tables
  const allCompaniesContainer = document.createElement('div');
  allCompaniesContainer.style.maxWidth = '900px';
  allCompaniesContainer.style.margin = '20px auto';
  document.body.appendChild(allCompaniesContainer);

  let companyCounter = 0;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const names = formData.getAll('name[]');
    const emails = formData.getAll('email[]');
    const phones = formData.getAll('phone[]');
    const dobs = formData.getAll('dob[]');
    const addresses = formData.getAll('address[]');
    const cities = formData.getAll('city[]');
    const countries = formData.getAll('country[]');

    companyCounter++;
    const companyId = `company${companyCounter}`;

    // Create a container div for the company table
    const companyDiv = document.createElement('div');
    companyDiv.style.background = '#fff';
    companyDiv.style.padding = '15px';
    companyDiv.style.marginBottom = '30px';
    companyDiv.style.borderRadius = '10px';
    companyDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    // Company title
    const title = document.createElement('h3');
    title.textContent = `Company ID: ${companyId}`;
    title.style.color = '#007bff';
    companyDiv.appendChild(title);

    // Create table for directors
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.textAlign = 'left';

    // Table headers
    const headers = [
      'Director #',
      'Full Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Address',
      'City',
      'Country'
    ];

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headers.forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      th.style.borderBottom = '2px solid #007bff';
      th.style.padding = '8px';
      th.style.backgroundColor = '#e9f2ff';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Add each director as a row
    for(let i = 0; i < names.length; i++) {
      const tr = document.createElement('tr');

      const createCell = (text) => {
        const td = document.createElement('td');
        td.textContent = text || '-';
        td.style.padding = '8px';
        td.style.borderBottom = '1px solid #ccc';
        return td;
      };

      tr.appendChild(createCell(i + 1));          // Director #
      tr.appendChild(createCell(names[i]));       // Full Name
      tr.appendChild(createCell(emails[i]));      // Email
      tr.appendChild(createCell(phones[i]));      // Phone
      tr.appendChild(createCell(dobs[i]));        // DOB
      tr.appendChild(createCell(addresses[i]));   // Address
      tr.appendChild(createCell(cities[i]));      // City
      tr.appendChild(createCell(countries[i]));   // Country

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    companyDiv.appendChild(table);
    allCompaniesContainer.appendChild(companyDiv);

    alert(`Company ${companyId} and its directors added below.`);

    // Reset form after submission
    form.reset();

    // Optionally reset directors blocks to only 1 after submit
    while (directorsContainer.children.length > 1) {
      directorsContainer.lastChild.remove();
    }
  });
});
