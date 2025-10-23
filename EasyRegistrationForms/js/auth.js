// js/auth.js
import { auth, db, firebase } from './firebase.js';
import { showNotification, showLoading, showSection } from './utils.js';
import { loadUserData } from './dashboard.js';

let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUserData(user);
    showSection('dashboard');
  } else {
    showSection('auth');
  }
});

function login() {
  const email = document.getElementById('loginEmail').value;
  const phone = document.getElementById('loginPhone').value;

  if (!email || !phone) {
    showNotification('Please enter both email and phone number', 'error');
    return;
  }

  showLoading(true);

  auth.signInWithEmailAndPassword(email, phone)
    .then(userCredential => {
      currentUser = userCredential.user;
      showSection('dashboard');
      showNotification('Login successful!', 'success');
    })
    .catch(error => showNotification(error.message, 'error'))
    .finally(() => showLoading(false));
}

function signup() {
  const firstName = document.getElementById('firstName').value;
  const email = document.getElementById('signupEmail').value;
  const phone = document.getElementById('signupPhone').value;
  const confirmPhone = document.getElementById('confirmPhone').value;

  if (!firstName || !email || !phone || !confirmPhone) {
    showNotification('Please fill all fields', 'error');
    return;
  }
  if (phone !== confirmPhone) {
    showNotification('Phone numbers do not match', 'error');
    return;
  }

  showLoading(true);

  auth.createUserWithEmailAndPassword(email, phone)
    .then(userCredential => {
      const user = userCredential.user;
      const userData = {
        firstName,
        email,
        phone,
        credit_balance: 0,
        usage_count: 0,
        transactions: [],
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      };
      return db.collection('users').doc(user.uid).set(userData);
    })
    .then(() => showNotification('Account created successfully!', 'success'))
    .catch(error => showNotification(error.message, 'error'))
    .finally(() => showLoading(false));
}

export { login, signup, currentUser };
