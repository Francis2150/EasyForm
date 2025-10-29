// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzSHkVxRiLC5gsq04LTTDnXaGdoF7eJ2c",
    authDomain: "easyregistrationforms.firebaseapp.com",
    projectId: "easyregistrationforms",
    storageBucket: "easyregistrationforms.firebasestorage.app",
    messagingSenderId: "589421628989",
    appId: "1:589421628989:web:d9f6e9dbe372ab7acd6454",
    measurementId: "G-GVCPBN8VB5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Paystack Configuration
const paystackKey = "pk_live_4126067326a4ff0fbdac73d10db5474b483a824d";

// Global Variables
let currentUser = null;
let userListener = null;
let transactionsVisible = false;

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');
const topUpModal = new bootstrap.Modal(document.getElementById('topUpModal'));

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserData();
            showSection('dashboard');
        } else {
            showSection('auth');
        }
    });

    // Logout - Multiple event listeners for both logout links/buttons
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });

    // Toggle Transactions
    document.getElementById('toggleTransactionsBtn')?.addEventListener('click', toggleTransactions);

    // Dashboard Actions
    document.getElementById('topUpBtn')?.addEventListener('click', () => {
        topUpModal.show();
    });

    document.getElementById('viewSubmissionsBtn')?.addEventListener('click', () => {
        showNotification('This feature is coming soon!', 'info');
    });

    // Top Up Modal
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('customAmount').value = btn.dataset.amount;
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
        });
    });

    document.getElementById('processPaymentBtn')?.addEventListener('click', processPayment);
});

// Functions
function showSection(section) {
    authSection?.classList.remove('active');
    dashboardSection?.classList.remove('active');

    if (section === 'auth') {
        authSection?.classList.add('active');
    } else if (section === 'dashboard') {
        dashboardSection?.classList.add('active');
    }
}

function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.add('active');
    } else {
        loadingSpinner.classList.remove('active');
    }
}

function logout() {
    showLoading(true);
    auth.signOut()
        .then(() => {
            showLoading(false);
            showNotification('Logged out successfully', 'success');
            showSection('auth');
        })
        .catch((error) => {
            showLoading(false);
            showNotification('Error logging out: ' + error.message, 'error');
        });
}

// Toggle Transactions Visibility
function toggleTransactions() {
    const container = document.getElementById('transactionsContainer');
    const icon = document.getElementById('toggleIcon');
    const text = document.getElementById('toggleText');
    
    transactionsVisible = !transactionsVisible;
    
    if (transactionsVisible) {
        container.style.display = 'block';
        icon.className = 'fas fa-chevron-up me-1';
        text.textContent = 'Hide';
    } else {
        container.style.display = 'none';
        icon.className = 'fas fa-chevron-down me-1';
        text.textContent = 'Show';
    }
}

// Real-time Firestore listener
function loadUserData() {
    console.log('Setting up real-time listener for user:', currentUser.uid);
    showLoading(true);

    const userDocRef = db.collection('users').doc(currentUser.uid);

    // Detach any previous listener
    if (userListener) {
        userListener();
    }

    // Set up new real-time listener
    userListener = userDocRef.onSnapshot(
        (doc) => {
            showLoading(false);
            if (doc.exists) {
                console.log('User data updated in real-time:', doc.data());
                updateDashboard(doc.data());
            } else {
                console.log('User document not found, creating new one.');
                const userData = {
                    email: currentUser.email,
                    credit_balance: 0,
                    usage_count: 0,
                    transactions: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                };
                userDocRef.set(userData)
                    .then(() => {
                        console.log('New user document created.');
                        updateDashboard(userData);
                    })
                    .catch((error) => {
                        console.error('Error creating user document:', error);
                        showNotification(error.message, 'error');
                    });
            }
        },
        (error) => {
            showLoading(false);
            console.error('Real-time listener error:', error);
            showNotification('Error loading user data: ' + error.message, 'error');
        }
    );
}

function updateDashboard(userData) {
    console.log('Updating dashboard with data:', userData);
    
    // Update user name
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = userData.firstName || userData.email.split('@')[0] || 'User';
    }
    
    // Update credit balance
    const balanceElement = document.getElementById('creditBalance');
    if (balanceElement) {
        balanceElement.textContent = `${userData.credit_balance || 0} GHS`;
    }
    
    // Update usage count
    const usageElement = document.getElementById('usageCount');
    if (usageElement) {
        usageElement.textContent = userData.usage_count || 0;
    }
    
    // Update free submissions
    const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
    const freeSubmissionsElement = document.getElementById('freeSubmissions');
    if (freeSubmissionsElement) {
        freeSubmissionsElement.textContent = freeSubmissions;
    }
    
    // Update transactions list (only if visible)
    const transactionsList = document.getElementById('transactionsList');
    if (transactionsList) {
        if (userData.transactions && userData.transactions.length > 0) {
            transactionsList.innerHTML = '';
            userData.transactions.slice(0, 5).forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                
                const date = transaction.timestamp ? 
                    (transaction.timestamp.toDate ? new Date(transaction.timestamp.toDate()).toLocaleDateString() : new Date(transaction.timestamp).toLocaleDateString()) : 
                    'N/A';
                const type = transaction.type === 'credit' ? 'Credit' : 'Debit';
                const sign = transaction.type === 'credit' ? '+' : '-';
                
                transactionItem.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <div>
                            <div class="fw-bold">${type}</div>
                            <div class="text-muted small">${date}</div>
                        </div>
                        <div class="fw-bold ${transaction.type === 'credit' ? 'text-success' : 'text-danger'}">
                            ${sign}${transaction.amount} GHS
                        </div>
                    </div>
                `;
                
                transactionsList.appendChild(transactionItem);
            });
        } else {
            transactionsList.innerHTML = '<p class="text-muted">No transactions yet</p>';
        }
    }
    
    // Update data collection link if available
    if (userData.dataCollectionLink) {
        updateDataCollectionLink(userData.dataCollectionLink);
    }
    
    console.log('Dashboard updated successfully');
}

function updateDataCollectionLink(link) {
    // Check if the data collection link section already exists
    let linkSection = document.getElementById('dataCollectionLinkSection');
    
    if (!linkSection) {
        // Create the data collection link section
        linkSection = document.createElement('div');
        linkSection.id = 'dataCollectionLinkSection';
        linkSection.className = 'dashboard-card';
        
        // Find where to insert the section (before the Registration Types card)
        const registrationTypesCard = document.querySelector('.dashboard-card h5');
        if (registrationTypesCard) {
            registrationTypesCard.closest('.dashboard-card').parentNode.insertBefore(linkSection, registrationTypesCard.closest('.dashboard-card'));
        }
    }
    
    // Update the content of the section
    linkSection.innerHTML = `
        <h5 class="mb-3">Data Collection Link</h5>
        <p class="text-muted">Share this link with your clients to collect their data:</p>
        <div class="input-group mb-3">
            <input type="text" class="form-control" id="dataLinkInput" value="${link}" readonly>
            <button class="btn btn-outline-primary" type="button" id="copyDataLinkBtn">Copy</button>
        </div>
        <div class="d-flex justify-content-between">
            <a href="data-management.html" class="btn btn-sm btn-outline-info">
                <i class="fas fa-table me-1"></i>View Collected Data
            </a>
            <a href="${link}" target="_blank" class="btn btn-sm btn-outline-secondary">
                <i class="fas fa-external-link-alt me-1"></i>Open Link
            </a>
        </div>
    `;
    
    // Add copy functionality
    document.getElementById('copyDataLinkBtn').addEventListener('click', () => {
        const linkInput = document.getElementById('dataLinkInput');
        linkInput.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
    });
}

// Process Payment
function processPayment() {
    const amountInput = document.getElementById('customAmount').value.trim();
    const amount = Number(amountInput);
    const selectedPaymentMethod = document.querySelector('.payment-method.selected');
    const paymentNumber = document.getElementById('paymentNumber').value.trim();
    const email = document.getElementById('paymentEmail').value.trim() || 'user@example.com';

    if (!amount || isNaN(amount) || amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    if (!selectedPaymentMethod) {
        showNotification('Please select a payment method', 'error');
        return;
    }

    if (!paymentNumber) {
        showNotification('Please enter your mobile money number', 'error');
        return;
    }

    const paymentMethod = selectedPaymentMethod.dataset.method;

    console.log('Processing payment:', { amount, paymentMethod, paymentNumber });

    const handler = PaystackPop.setup({
        key: paystackKey,
        email: email,
        amount: amount * 100, // GHS → pesewas
        currency: 'GHS',
        ref: 'PSK' + Math.floor((Math.random() * 1000000000) + 1),
        callback: function (response) {
            console.log('✅ Payment callback received:', response);
            showLoading(true);

            const transaction = {
                type: 'credit',
                amount: amount,
                method: 'Mobile Money',
                provider: paymentMethod,
                timestamp: new Date(),
                ref: response.reference
            };

            const userDocRef = db.collection('users').doc(currentUser.uid);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    console.log('User exists — updating credit balance...');
                    return userDocRef.update({
                        credit_balance: firebase.firestore.FieldValue.increment(amount),
                        transactions: firebase.firestore.FieldValue.arrayUnion(transaction)
                    });
                } else {
                    console.log('Creating new user document...');
                    return userDocRef.set({
                        email: currentUser.email,
                        credit_balance: amount,
                        usage_count: 0,
                        transactions: [transaction],
                        created_at: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            })
            .then(() => {
                console.log('✅ Firestore updated successfully.');
                showLoading(false);
                topUpModal.hide();
                showNotification('Payment successful! Credits added to your account.', 'success');

                // Reset form fields
                document.getElementById('customAmount').value = '';
                document.getElementById('paymentNumber').value = '';
                document.getElementById('paymentEmail').value = '';
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            })
            .catch((error) => {
                console.error('🔥 Error updating Firestore:', error);
                showLoading(false);
                showNotification('Error updating account: ' + error.message, 'error');
            });
        },
        onClose: function () {
            console.log('Payment closed by user.');
            showNotification('Payment cancelled', 'info');
        }
    });

    handler.openIframe();
}