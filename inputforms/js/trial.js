window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('data-form');
  const status = document.getElementById('status');
  const periodInput = document.getElementById('period');
  const dateInput = document.getElementById('disburseDate');
  const updateBtn = document.getElementById('update-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const pensionIDInput = document.getElementById('pensionID');

  const savedPeriod = localStorage.getItem('savedPeriod');
  if (savedPeriod) {
    periodInput.value = savedPeriod;
  }

  const header = [
    'Pension ID', 'Deceased Name', 'Amount Awarded', 'Workplace', 'Receipt Date', 'Period'
  ];

  function readData() {
    const raw = localStorage.getItem('gratuityData');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function writeData(data) {
    localStorage.setItem('gratuityData', JSON.stringify(data));
  }

  function refreshTable() {
    const records = readData();
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = '';

    records.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record['Pension ID']}</td>
        <td>${record['Deceased Name']}</td>
        <td>${parseFloat(record['Amount Awarded']).toLocaleString()}</td>
        <td>${record['Workplace']}</td>
        <td>${record['Receipt Date']}</td>
        <td>${record['Period']}</td>
      `;
      tbody.appendChild(row);
    });
  }

  function getFormData() {
    const id = pensionIDInput.value.trim();
    const name = document.getElementById('fullName').value.trim();
    const amountInput = document.getElementById('amountReceived').value.trim().replace(/,/g, '');
    const amount = parseFloat(amountInput);
    const workPlace = document.getElementById('placeOfWork').value.trim();
    const date = dateInput.value.trim();
    const period = periodInput.value.trim();

    return { id, name, amount, workPlace, date, period };
  }

  function validate(data) {
    if (!data.id || !data.name || isNaN(data.amount) || !data.workPlace || !data.date || !data.period) {
      status.textContent = '❗ Please fill all fields with valid data.';
      return false;
    }
    return true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = getFormData();
    if (!validate(data)) return;

    const records = readData();

    if (records.find(r => r['Pension ID'] === data.id)) {
      status.textContent = `❌ Pension ID "${data.id}" already exists. Use update instead.`;
      return;
    }

    const newRecord = {};
    header.forEach(h => newRecord[h] = '');

    newRecord['Pension ID'] = data.id;
    newRecord['Deceased Name'] = data.name;
    newRecord['Amount Awarded'] = data.amount.toFixed(2);
    newRecord['Workplace'] = data.workPlace;
    newRecord['Receipt Date'] = data.date;
    newRecord['Period'] = data.period;

    records.push(newRecord);
    writeData(records);
    refreshTable();

    status.textContent = `✅ Added: ${data.name} (ID: ${data.id})`;
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    periodInput.value = data.period;
    localStorage.setItem('savedPeriod', data.period);
  });

  updateBtn.addEventListener('click', () => {
    const data = getFormData();
    if (!validate(data)) return;

    const records = readData();
    const index = records.findIndex(r => r['Pension ID'] === data.id);

    if (index === -1) {
      status.textContent = `❌ Pension ID "${data.id}" not found for update.`;
      return;
    }

    records[index]['Deceased Name'] = data.name;
    records[index]['Amount Awarded'] = data.amount.toFixed(2);
    records[index]['Workplace'] = data.workPlace;
    records[index]['Receipt Date'] = data.date;
    records[index]['Period'] = data.period;

    writeData(records);
    refreshTable();
    status.textContent = `🔄 Updated record for ID: ${data.id}`;
  });

  deleteBtn.addEventListener('click', () => {
    const id = pensionIDInput.value.trim();
    if (!id) {
      status.textContent = '❗ Enter Pension ID to delete.';
      return;
    }

    const records = readData();
    const index = records.findIndex(r => r['Pension ID'] === id);

    if (index === -1) {
      status.textContent = `❌ Pension ID "${id}" not found.`;
      return;
    }

    records.splice(index, 1);
    writeData(records);
    refreshTable();
    status.textContent = `🗑️ Deleted record for ID: ${id}`;
    form.reset();
    dateInput.value = new Date().toISOString().split('T')[0];
    periodInput.value = savedPeriod || '';
  });

  pensionIDInput.addEventListener('blur', () => {
    const id = pensionIDInput.value.trim();
    if (!id) return;

    const records = readData();
    const record = records.find(r => r['Pension ID'] === id);

    if (record) {
      document.getElementById('fullName').value = record['Deceased Name'];
      document.getElementById('amountReceived').value = parseFloat(record['Amount Awarded']).toLocaleString();
      document.getElementById('placeOfWork').value = record['Workplace'];
      dateInput.value = record['Receipt Date'];
      periodInput.value = record['Period'];
      status.textContent = `ℹ️ Record found for ID: ${id}. Fields populated.`;
    } else {
      status.textContent = `❌ No record found for ID: ${id}`;
    }
  });

  // Set default date on load
  dateInput.value = new Date().toISOString().split('T')[0];

  // Refresh table on page load
  refreshTable();
});
