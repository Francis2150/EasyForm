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
let ownerData = null;

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

    // Dashboard Actions
    document.getElementById('topUpBtn')?.addEventListener('click', () => {
        topUpModal.show();
    });

    document.getElementById('viewSubmissionsBtn')?.addEventListener('click', () => {
        viewSubmissions();
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
                
                // Load owner data using uniqueLink
                if (doc.data().uniqueLink) {
                    loadOwnerData(doc.data().uniqueLink);
                }
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

function loadOwnerData(uniqueLink) {
    db.collection('owners').doc(uniqueLink).get()
        .then((doc) => {
            if (doc.exists) {
                ownerData = doc.data();
                displayUniqueLink(uniqueLink);
            } else {
                console.error('Owner data not found for unique link:', uniqueLink);
            }
        })
        .catch((error) => {
            console.error('Error loading owner data:', error);
        });
}

function displayUniqueLink(uniqueLink) {
    // Create or update the unique link display
    let linkContainer = document.getElementById('uniqueLinkContainer');
    
    if (!linkContainer) {
        // Create the container if it doesn't exist
        linkContainer = document.createElement('div');
        linkContainer.id = 'uniqueLinkContainer';
        linkContainer.className = 'dashboard-card';
        
        // Find where to insert it (after the usage statistics card)
        const usageCard = document.querySelector('#dashboardSection .col-md-4 .dashboard-card:nth-child(2)');
        if (usageCard && usageCard.parentNode) {
            usageCard.parentNode.insertBefore(linkContainer, usageCard.nextSibling);
        }
    }
    
    // Update the content
    const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
    const formUrl = `${baseUrl}llc-input-form.html?link=${uniqueLink}`;
    
    linkContainer.innerHTML = `
        <h5 class="mb-3">Your Unique Form Link</h5>
        <div class="input-group mb-3">
            <input type="text" class="form-control" value="${formUrl}" id="uniqueLinkInput" readonly>
            <button class="btn btn-outline-primary" type="button" id="copyLinkBtn">
                <i class="fas fa-copy"></i> Copy
            </button>
        </div>
        <p class="text-muted small">Share this link with clients to collect their data directly to your account.</p>
    `;
    
    // Add copy functionality
    document.getElementById('copyLinkBtn').addEventListener('click', () => {
        const linkInput = document.getElementById('uniqueLinkInput');
        linkInput.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
    });
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
    
    // Update transactions list
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
    
    console.log('Dashboard updated successfully');
}

function viewSubmissions() {
    if (!ownerData || !ownerData.uid) {
        showNotification('Owner data not available', 'error');
        return;
    }
    
    showLoading(true);
    
    // Query clients for this owner
    db.collection('owners').doc(ownerData.uid).collection('clients').get()
        .then((querySnapshot) => {
            showLoading(false);
            
            if (querySnapshot.empty) {
                showNotification('No client submissions yet', 'info');
                return;
            }
            
            // Create a modal to display submissions
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'submissionsModal';
            modal.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Client Submissions</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Submitted Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${querySnapshot.docs.map(doc => {
                                            const data = doc.data();
                                            const companyName = data.formData?.find(field => field.label === 'Company Name')?.value || 'N/A';
                                            const submittedDate = data.submittedAt ? 
                                                (data.submittedAt.toDate ? new Date(data.submittedAt.toDate()).toLocaleDateString() : new Date(data.submittedAt).toLocaleDateString()) : 
                                                'N/A';
                                            
                                            return `
                                                <tr>
                                                    <td>${companyName}</td>
                                                    <td>${submittedDate}</td>
                                                    <td>
                                                        <button class="btn btn-sm btn-primary view-client-btn" data-id="${doc.id}">
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const submissionsModal = new bootstrap.Modal(modal);
            submissionsModal.show();
            
            // Add event listeners for view details buttons
            modal.querySelectorAll('.view-client-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const clientId = e.target.getAttribute('data-id');
                    viewClientDetails(clientId);
                });
            });
            
            // Clean up modal when hidden
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        })
        .catch((error) => {
            showLoading(false);
            console.error('Error fetching submissions:', error);
            showNotification('Error fetching submissions: ' + error.message, 'error');
        });
}

function viewClientDetails(clientId) {
    showLoading(true);
    
    db.collection('owners').doc(ownerData.uid).collection('clients').doc(clientId).get()
        .then((doc) => {
            showLoading(false);
            
            if (!doc.exists) {
                showNotification('Client data not found', 'error');
                return;
            }
            
            const clientData = doc.data();
            
            // Create a modal to display client details
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'clientDetailsModal';
            modal.innerHTML = `
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Client Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${renderClientDetails(clientData)}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            const clientDetailsModal = new bootstrap.Modal(modal);
            clientDetailsModal.show();
            
            // Clean up modal when hidden
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        })
        .catch((error) => {
            showLoading(false);
            console.error('Error fetching client details:', error);
            showNotification('Error fetching client details: ' + error.message, 'error');
        });
}

function renderClientDetails(clientData) {
    let html = '';
    
    // Company Information
    const companyFields = clientData.formData?.filter(field => 
        field.section === 'companyInfo'
    );
    
    if (companyFields && companyFields.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Company Information</h5>
                <table class="table table-bordered">
                    <tbody>
                        ${companyFields.map(field => `
                            <tr>
                                <th>${field.label}</th>
                                <td>${field.value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Office Details
    const officeFields = clientData.formData?.filter(field => 
        field.section === 'officeDetails'
    );
    
    if (officeFields && officeFields.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Office Details</h5>
                <table class="table table-bordered">
                    <tbody>
                        ${officeFields.map(field => `
                            <tr>
                                <th>${field.label}</th>
                                <td>${field.value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Directors
    if (clientData.directors && clientData.directors.length > 0) {
        html += '<div class="mb-4"><h5>Directors</h5>';
        
        clientData.directors.forEach((director, index) => {
            html += `
                <div class="mb-3">
                    <h6>Director ${index + 1}</h6>
                    <table class="table table-bordered">
                        <tbody>
                            ${director.map(field => `
                                <tr>
                                    <th>${field.label}</th>
                                    <td>${field.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // Secretary
    if (clientData.secretary && clientData.secretary.length > 0) {
        html += `
            <div class="mb-4">
                <h5>Secretary Details</h5>
                <table class="table table-bordered">
                    <tbody>
                        ${clientData.secretary.map(field => `
                            <tr>
                                <th>${field.label}</th>
                                <td>${field.value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Subscribers
    if (clientData.subscribers && clientData.subscribers.length > 0) {
        html += '<div class="mb-4"><h5>Subscribers</h5>';
        
        clientData.subscribers.forEach((subscriber, index) => {
            html += `
                <div class="mb-3">
                    <h6>Subscriber ${index + 1}</h6>
                    <table class="table table-bordered">
                        <tbody>
                            ${subscriber.map(field => `
                                <tr>
                                    <th>${field.label}</th>
                                    <td>${field.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    return html;
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