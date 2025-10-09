// formHandler.js: handles form submission, adding/updating records, and rendering the table,Data collection
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('companyForm');
  const allCompaniesContainer = document.getElementById('allCompaniesContainer');

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
    return { companyInfo };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const companyData = collectCompanyData();
    if (!companyData.companyInfo.companyName) {
      alert('Please enter a company name.');
      return;
    }

    let records = readData();

    if (form.dataset.editIndex) {
      const idx = parseInt(form.dataset.editIndex);
      records[idx] = companyData;
      writeData(records);
      renderAllCompanies(allCompaniesContainer, populateForm);
      alert(`🔄 Updated: ${companyData.companyInfo.companyName}`);
      form.reset();
      delete form.dataset.editIndex;
    } else {
      const exists = records.find(
        r => r.companyInfo.companyName.toLowerCase() === companyData.companyInfo.companyName.toLowerCase()
      );
      if (exists) {
        alert('Company already exists. Use update instead.');
        return;
      }
      records.push(companyData);
      writeData(records);
      renderAllCompanies(allCompaniesContainer, populateForm);
      alert(`✅ Added: ${companyData.companyInfo.companyName}`);
      form.reset();
    }
  });

  // Load all on startup
  renderAllCompanies(allCompaniesContainer, populateForm);
});
