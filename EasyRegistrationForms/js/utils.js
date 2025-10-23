// js/utils.js
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');

function showNotification(message, type) {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'block';
  setTimeout(() => (notification.style.display = 'none'), 4000);
}

function showLoading(show) {
  if (loadingSpinner) loadingSpinner.classList.toggle('active', show);
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`${section}Section`).classList.add('active');
}

export { showNotification, showLoading, showSection };
