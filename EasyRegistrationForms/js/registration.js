// js/registration.js
import { db, firebase } from './firebase.js';
import { showNotification, showLoading } from './utils.js';
import { currentUser } from './auth.js';

let currentStep = 1;
let directors = [];
let subsidiaries = [];

// Step navigation
function showStep(step) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${step}`).classList.add('active');
  currentStep = step;
}

// Directors
function addDirector() {
  const name = document.getElementById('directorName').value;
  const email = document.getElementById('directorEmail').value;
  const phone = document.getElementById('directorPhone').value;

  if (!name || !email || !phone) {
    showNotification('Please fill all director fields', 'error');
    return;
  }

  directors.push({ name, email, phone });
  renderDirectors();
}

function renderDirectors() {
  const list = document.getElementById('directorsList');
  list.innerHTML = '';
  directors.forEach((dir, index) => {
    const item = document.createElement('div');
    item.className = 'director-item';
    item.innerHTML = `
      <div>${dir.name} (${dir.email}, ${dir.phone})</div>
      <button class="btn btn-sm btn-danger" onclick="removeDirector(${index})">Remove</button>
    `;
    list.appendChild(item);
  });
}

function removeDirector(index) {
  directors.splice(index, 1);
  renderDirectors();
}

// Subsidiaries
function addSubsidiary() {
  const name = document.getElementById('subsidiaryName').value;
  const address = document.getElementById('subsidiaryAddress').value;

  if (!name || !address) {
    showNotification('Please fill all subsidiary fields', 'error');
    return;
  }

  subsidiaries.push({ name, address });
  renderSubsidiaries();
}

function renderSubsidiaries() {
  const list = document.getElementById('subsidiariesList');
  list.innerHTML = '';
  subsidiaries.forEach((sub, index) => {
    const item = document.createElement('div');
    item.className = 'subsidiary-item';
    item.innerHTML = `
      <div>${sub.name} - ${sub.address}</div>
      <button class="btn btn-sm btn-danger" onclick="removeSubsidiary(${index})">Remove</button>
    `;
    list.appendChild(item);
  });
}

function removeSubsidiary(index) {
  subsidiaries.splice(index, 1);
  renderSubsidiaries();
}

// Submission
function submitRegistration() {
  const companyName = document.getElementById('companyName').value;
  const businessType = document.getElementById('businessType').value;
  const estimatedRevenue = document.getElementById('estimatedRevenue').value;

  if (!companyName || !businessType || !estimatedRevenue) {
    showNotification('Please complete all company fields', 'error');
    return;
  }

  const formData = {
    companyName,
    businessType,
    estimatedRevenue,
    directors,
    subsidiaries,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  showLoading(true);

  db.collection('registrations')
    .add({ ...formData, userId: currentUser.uid })
    .then(() => {
      showNotification('Registration submitted successfully!', 'success');
      directors = [];
      subsidiaries = [];
      renderDirectors();
      renderSubsidiaries();
      showStep(1);
    })
    .catch(err => showNotification('Error: ' + err.message, 'error'))
    .finally(() => showLoading(false));
}

window.removeDirector = removeDirector;
window.removeSubsidiary = removeSubsidiary;

export { showStep, addDirector, addSubsidiary, submitRegistration };
