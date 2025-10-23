// js/payment.js
import { db, firebase } from './firebase.js';
import { showNotification, showLoading } from './utils.js';
import { currentUser } from './auth.js';

function initiateTopUp(amount) {
  if (!amount || amount <= 0) {
    showNotification('Enter a valid top-up amount', 'error');
    return;
  }

  const handler = PaystackPop.setup({
    key: 'pk_test_xxx', // Replace with your actual Paystack public key
    email: currentUser.email,
    amount: amount * 100,
    currency: 'GHS',
    callback: function (response) {
      verifyTopUp(response.reference, amount);
    },
    onClose: function () {
      showNotification('Transaction cancelled', 'error');
    }
  });

  handler.openIframe();
}

function verifyTopUp(reference, amount) {
  showLoading(true);
  const userRef = db.collection('users').doc(currentUser.uid);

  userRef.get()
    .then(doc => {
      const data = doc.data();
      const newBalance = (data.credit_balance || 0) + amount;
      const newTransaction = {
        type: 'credit',
        amount,
        reference,
        timestamp: Date.now()
      };

      return userRef.update({
        credit_balance: newBalance,
        transactions: firebase.firestore.FieldValue.arrayUnion(newTransaction)
      });
    })
    .then(() => showNotification('Top-up successful!', 'success'))
    .catch(err => showNotification('Error verifying payment: ' + err.message, 'error'))
    .finally(() => showLoading(false));
}

export { initiateTopUp };
