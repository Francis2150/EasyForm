// companyPersonalitiesTable.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('directorsForm'); // You can rename if needed
  const personalitiesContainer = document.getElementById('directorsContainer'); // Or adjust if you add other roles
  // We'll assume you have separate containers or input naming conventions for directors, secretaries, shareholders etc.

  // Create container for all companies tables
  const allCompaniesContainer = document.createElement('div');
  allCompaniesContainer.style.maxWidth = '900px';
  allCompaniesContainer.style.margin = '20px auto';
  allCompaniesContainer.style.padding = '10px';
  document.body.appendChild(allCompaniesContainer);

  let companyCount = 0;

  // Utility: labels for left column
  const fields = [
    'Full Name',
    'Email',
    'Phone',
    'Date of Birth',
    'Address',
    'City',
    'Country'
  ];

  // Extract personalities data grouped by role from formData
  // Adjust selectors/names based on your actual form structure
  function extractPersonalities(formData) {
    // For example, if you have inputs named director_name[], director_email[], etc.
    // and similarly secretary_name[], shareholder_name[], etc.

    // This example assumes you have all personalities in the form,
    // with a "role" field or input names like role[], name[], email[], phone[] etc.
    // Since your original form only had directors, you'll need to expand your form with roles.

    // Here, we'll simulate extracting from inputs named like:
    // director_name[], director_email[], ...
    // secretary_name[], secretary_email[], ...
    // shareholder_name[], shareholder_email[], ...

    // For demo, let's hardcode the roles array:
    const roles = ['director', 'secretary', 'shareholder'];
    const personalities = [];

    roles.forEach(role => {
      const names = formData.getAll(`${role}_name[]`);
      const emails = formData.getAll(`${role}_email[]`);
      const phones = formData.getAll(`${role}_phone[]`);
      const dobs = formData.getAll(`${role}_dob[]`);
      const addresses = formData.getAll(`${role}_address[]`);
      const cities = formData.getAll(`${role}_city[]`);
      const countries = formData.getAll(`${role}_country[]`);

      names.forEach((_, i) => {
        personalities.push({
          role,
          index: i + 1,
          data: {
            'Full Name': names[i] || '-',
            'Email': emails[i] || '-',
            'Phone': phones[i] || '-',
            'Date of Birth': dobs[i] || '-',
            'Address': addresses[i] || '-',
            'City': cities[i] || '-',
            'Country': countries[i] || '-',
          }
        });
      });
    });

    return personalities;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    companyCount++;
    const companyId = `company${companyCount}`;

    const personalities = extractPersonalities(formData);

    // Create container div for company
    const companyDiv = document.createElement('div');
    companyDiv.style.background = '#fff';
    companyDiv.style.padding = '15px';
    companyDiv.style.marginBottom = '30px';
    companyDiv.style.borderRadius = '10px';
    companyDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    // Title for company
    const title = document.createElement('h3');
    title.textContent = `Company ID: ${companyId}`;
    title.style.color = '#007bff';
    companyDiv.appendChild(title);

    // Create table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.textAlign = 'left';

    // Header row: first empty for labels column, then one for each personality role+index
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const thEmpty = document.createElement('th');
    thEmpty.textContent = ''; // empty for labels column
    thEmpty.style.borderBottom = '2px solid #007bff';
    thEmpty.style.padding = '8px';
    thEmpty.style.backgroundColor = '#e9f2ff';
    headerRow.appendChild(thEmpty);

    personalities.forEach(p => {
      const th = document.createElement('th');
      th.textContent = `${capitalize(p.role)} ${p.index}`;
      th.style.borderBottom = '2px solid #007bff';
      th.style.padding = '8px';
      th.style.backgroundColor = '#e9f2ff';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body with rows per field label
    const tbody = document.createElement('tbody');

    fields.forEach(field => {
      const tr = document.createElement('tr');

      // Label cell
      const labelCell = document.createElement('td');
      labelCell.textContent = field;
      labelCell.style.fontWeight = 'bold';
      labelCell.style.padding = '8px';
      labelCell.style.borderBottom = '1px solid #ccc';
      labelCell.style.backgroundColor = '#f9f9f9';
      tr.appendChild(labelCell);

      // Data cells per personality
      personalities.forEach(p => {
        const td = document.createElement('td');
        td.textContent = p.data[field] || '-';
        td.style.padding = '8px';
        td.style.borderBottom = '1px solid #ccc';
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    companyDiv.appendChild(table);
    allCompaniesContainer.appendChild(companyDiv);

    alert(`Company ${companyId} data added below.`);

    // Reset form after submission
    form.reset();

    // Clear extra personality blocks if needed (adjust this logic based on your form)
    while (personalitiesContainer.children.length > 1) {
      personalitiesContainer.lastChild.remove();
    }
  });

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
