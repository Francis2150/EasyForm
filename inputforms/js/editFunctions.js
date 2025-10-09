// editFunctions.js, handles populating the form for editing a company record
function populateForm(data, editIndex) {
  const form = document.getElementById('companyForm');
  const c = data.companyInfo;

  document.getElementById('companyName').value = c.companyName;
  document.getElementById('registrationNumber').value = c.registrationNumber;
  document.getElementById('incorporationDate').value = c.incorporationDate;
  document.getElementById('businessAddress').value = c.businessAddress;
  document.getElementById('companyCity').value = c.city;
  document.getElementById('companyCountry').value = c.country;
  document.getElementById('natureOfBusiness').value = c.natureOfBusiness;
  document.getElementById('taxId').value = c.taxId;

  form.dataset.editIndex = editIndex;
  alert(`✏️ Editing: ${c.companyName}`);
}
