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
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTitle = document.getElementById('authTitle');
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

    // Auth Navigation
    document.getElementById('showSignupLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = 'Create Account';
    });

    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authTitle.textContent = 'Account Login';
    });

    // Login
    document.getElementById('loginBtn')?.addEventListener('click', login);

    // Signup
    document.getElementById('signupBtn')?.addEventListener('click', signup);

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

    // Refresh button
    document.getElementById('refreshDataBtn')?.addEventListener('click', () => {
        loadUserData();
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
        // Hide logout link in auth section
        document.getElementById('logoutLink').style.display = 'none';
    } else if (section === 'dashboard') {
        dashboardSection?.classList.add('active');
        // Show logout link in dashboard section
        document.getElementById('logoutLink').style.display = 'block';
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

function generateUniqueLink(firstName) {
    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return `${firstName}_LIMITED_DATA_COLLECTION_FORM_${uniqueId}`;
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const phone = document.getElementById('loginPhone').value;
    
    if (!email || !phone) {
        showNotification('Please enter both email and phone number', 'error');
        return;
    }

    showLoading(true);
    
    // Try to sign in with Firebase Auth first
    auth.signInWithEmailAndPassword(email, phone)
        .then((userCredential) => {
            // Signed in
            showLoading(false);
            showNotification('Login successful!', 'success');
        })
        .catch((error) => {
            // If sign in fails, check if user exists in Firestore
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                // Check if user exists in Firestore with matching email and phone
                db.collection('users').where('email', '==', email).where('phone', '==', phone).get()
                    .then((querySnapshot) => {
                        if (querySnapshot.empty) {
                            showLoading(false);
                            showNotification('Invalid email or phone number', 'error');
                            return;
                        }
                        
                        // User found in Firestore, create Firebase Auth account
                        auth.createUserWithEmailAndPassword(email, phone)
                            .then((userCredential) => {
                                showLoading(false);
                                showNotification('Login successful!', 'success');
                            })
                            .catch((createError) => {
                                showLoading(false);
                                showNotification(createError.message, 'error');
                            });
                    })
                    .catch((checkError) => {
                        showLoading(false);
                        showNotification('Error checking credentials. Please try again.', 'error');
                    });
            } else {
                showLoading(false);
                showNotification(error.message, 'error');
            }
        });
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
    
    // Create user in Firebase Auth first
    auth.createUserWithEmailAndPassword(email, phone)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Generate unique data collection link
            const uniqueLink = generateUniqueLink(firstName);
            
            // Get the base URL for the data collection form
            const baseUrl = window.location.origin + '/EasyForm/EasyRegistrationForms/data-collection.html';
            const fullLink = baseUrl + '?link=' + uniqueLink;
            
            // Create user record in Firestore
            const userData = {
                firstName: firstName,
                email: email,
                phone: phone,
                credit_balance: 0,
                usage_count: 0,
                transactions: [],
                dataCollectionLink: uniqueLink,
                dataCollectionFullUrl: fullLink,
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('users').doc(user.uid).set(userData)
                .then(() => {
                    showLoading(false);
                    showNotification(`Account created successfully! Your data collection link: ${fullLink}`, 'success');
                    
                    // Store the link in localStorage for immediate use
                    localStorage.setItem('dataCollectionLink', uniqueLink);
                    localStorage.setItem('dataCollectionFullUrl', fullLink);
                    
                    setTimeout(() => {
                        showSection('dashboard');
                    }, 2000);
                })
                .catch((error) => {
                    showLoading(false);
                    showNotification(error.message, 'error');
                });
        })
        .catch((error) => {
            showLoading(false);
            showNotification(error.message, 'error');
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
                
                // Check if we have data in localStorage from the signup process
                const localLink = localStorage.getItem('dataCollectionLink');
                const localFullUrl = localStorage.getItem('dataCollectionFullUrl');
                
                const userData = {
                    email: currentUser.email,
                    credit_balance: 0,
                    usage_count: 0,
                    transactions: [],
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Add data collection link if available in localStorage
                if (localLink && localFullUrl) {
                    userData.dataCollectionLink = localLink;
                    userData.dataCollectionFullUrl = localFullUrl;
                }
                
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
    
    // Display data collection link if available
    if (userData.dataCollectionLink) {
        displayDataCollectionLink(userData.dataCollectionLink, userData.dataCollectionFullUrl);
    } else {
        // If no link in Firestore, check localStorage
        const localLink = localStorage.getItem('dataCollectionLink');
        const localFullUrl = localStorage.getItem('dataCollectionFullUrl');
        
        if (localLink && localFullUrl) {
            displayDataCollectionLink(localLink, localFullUrl);
            
            // Also update Firestore with the localStorage values
            db.collection('users').doc(currentUser.uid).update({
                dataCollectionLink: localLink,
                dataCollectionFullUrl: localFullUrl
            }).catch(error => {
                console.error('Error updating data collection link in Firestore:', error);
            });
        }
    }
    
    console.log('Dashboard updated successfully');
}

function displayDataCollectionLink(link, fullUrl) {
    // Get the base URL for GitHub Pages
    const baseUrl = window.location.origin + '/EasyForm/EasyRegistrationForms/data-collection.html';
    const dataCollectionUrl = fullUrl || `${baseUrl}?link=${link}`;
    
    console.log('Displaying data collection link:', { link, fullUrl, dataCollectionUrl });
    
    // Show the data collection link container
    const linkContainer = document.getElementById('dataCollectionLinkContainer');
    if (linkContainer) {
        linkContainer.style.display = 'block';
        
        // Update the content of the link container
        linkContainer.innerHTML = `
            <h5 class="mb-3">
                <i class="fas fa-link me-2"></i>Data Collection Link
            </h5>
            <div class="input-group mb-3">
                <input type="text" class="form-control" id="dataCollectionLinkInput" value="${dataCollectionUrl}" readonly>
                <button class="btn btn-outline-secondary" type="button" id="copyLinkBtn">
                    <i class="fas fa-copy me-1"></i>Copy
                </button>
            </div>
            <p class="text-muted small">Share this link with clients to collect their data for Limited Company registration.</p>
        `;
        
        // Add event listener to the copy button
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            const linkInput = document.getElementById('dataCollectionLinkInput');
            linkInput.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('Link copied to clipboard!', 'success');
                } else {
                    showNotification('Unable to copy link', 'error');
                }
            } catch (err) {
                console.error('Failed to copy text: ', err);
                showNotification('Failed to copy link', 'error');
            }
        });
    } else {
        console.error('Data collection link container not found in the DOM');
    }
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