// js/dashboard.js
import { db, firebase } from './firebase.js';
import { showLoading, showNotification } from './utils.js';

let userListener = null;

function loadUserData(user) {
  showLoading(true);
  const userDocRef = db.collection('users').doc(user.uid);

  if (userListener) userListener(); // detach old listener

  userListener = userDocRef.onSnapshot(
    doc => {
      showLoading(false);
      if (doc.exists) updateDashboard(doc.data());
      else createNewUser(userDocRef, user);
    },
    error => {
      showLoading(false);
      showNotification('Error loading data: ' + error.message, 'error');
    }
  );
}

function createNewUser(ref, user) {
  const userData = {
    email: user.email,
    credit_balance: 0,
    usage_count: 0,
    transactions: [],
    created_at: firebase.firestore.FieldValue.serverTimestamp()
  };
  ref.set(userData);
}

function updateDashboard(data) {
  document.getElementById('creditBalance').textContent = `${data.credit_balance || 0} GHS`;
  document.getElementById('usageCount').textContent = data.usage_count || 0;
  document.getElementById('freeSubmissions').textContent = Math.max(0, 2 - (data.usage_count || 0));

  const transactionsList = document.getElementById('transactionsList');
  transactionsList.innerHTML = '';

  if (data.transactions?.length) {
    data.transactions.slice(0, 5).forEach(tx => {
      const div = document.createElement('div');
      div.className = 'transaction-item';
      div.innerHTML = `
        <div class="d-flex justify-content-between">
          <div>
            <div class="fw-bold">${tx.type}</div>
            <div class="text-muted small">${new Date(tx.timestamp).toLocaleDateString()}</div>
          </div>
          <div class="fw-bold ${tx.type === 'credit' ? 'text-success' : 'text-danger'}">
            ${tx.type === 'credit' ? '+' : '-'}${tx.amount} GHS
          </div>
        </div>`;
      transactionsList.appendChild(div);
    });
  } else {
    transactionsList.innerHTML = '<p class="text-muted">No transactions yet</p>';
  }
}

export { loadUserData };
