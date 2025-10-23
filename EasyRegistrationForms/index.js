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
let selectedRegistrationType = null;
let registrationCost = 0;
let directors = [];
let subsidiaries = [];
let formData = {};

// DOM Elements
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const registrationSection = document.getElementById('registrationSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
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
    document.getElementById('showSignupLink').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    document.getElementById('showLoginLink').addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', login);

    // Signup
    document.getElementById('signupBtn').addEventListener('click', signup);

    // Navigation
    document.getElementById('homeLink').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('dashboard');
    });

    document.getElementById('dashboardLink').addEventListener('click', (e) => {
        e.preventDefault();
        showSection('dashboard');
    });

    document.getElementById('logoutLink').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    // Dashboard Actions
    document.getElementById('topUpBtn').addEventListener('click', () => {
        topUpModal.show();
    });

    document.getElementById('newRegistrationBtn').addEventListener('click', () => {
        resetForm();
        showSection('registration');
    });

    document.getElementById('viewSubmissionsBtn').addEventListener('click', () => {
        showNotification('This feature is coming soon!', 'info');
    });

    // Registration Form Navigation
    document.getElementById('backToDashboardBtn').addEventListener('click', () => {
        showSection('dashboard');
    });

    // Registration Type Selection
    document.querySelectorAll('.registration-type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.registration-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedRegistrationType = card.dataset.type;
            registrationCost = parseFloat(card.dataset.cost);
            document.getElementById('nextToStep2Btn').disabled = false;
        });
    });

    document.getElementById('nextToStep2Btn').addEventListener('click', () => {
        if (selectedRegistrationType) {
            showStep(2);
        }
    });

    document.getElementById('backToStep1Btn').addEventListener('click', () => {
        showStep(1);
    });

    document.getElementById('nextToStep3Btn').addEventListener('click', () => {
        if (validateBusinessDetails()) {
            saveBusinessDetails();
            showStep(3);
        }
    });

    document.getElementById('backToStep2Btn').addEventListener('click', () => {
        showStep(2);
    });

    document.getElementById('nextToStep4Btn').addEventListener('click', () => {
        if (validateDirectors()) {
            saveDirectors();
            showStep(4);
        }
    });

    document.getElementById('backToStep3Btn').addEventListener('click', () => {
        showStep(3);
    });

    document.getElementById('nextToStep5Btn').addEventListener('click', () => {
        saveSubsidiaries();
        generateReview();
        showStep(5);
    });

    document.getElementById('backToStep4Btn').addEventListener('click', () => {
        showStep(4);
    });

    document.getElementById('submitFormBtn').addEventListener('click', submitForm);

    // Add Director
    document.getElementById('addDirectorBtn').addEventListener('click', addDirector);

    // Add Subsidiary
    document.getElementById('addSubsidiaryBtn').addEventListener('click', addSubsidiary);

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

    document.getElementById('processPaymentBtn').addEventListener('click', processPayment);
});

// Functions
function showSection(section) {
    authSection.classList.remove('active');
    dashboardSection.classList.remove('active');
    registrationSection.classList.remove('active');

    if (section === 'auth') {
        authSection.classList.add('active');
        document.getElementById('dashboardLink').style.display = 'none';
        document.getElementById('logoutLink').style.display = 'none';
    } else if (section === 'dashboard') {
        dashboardSection.classList.add('active');
        document.getElementById('dashboardLink').style.display = 'block';
        document.getElementById('logoutLink').style.display = 'block';
    } else if (section === 'registration') {
        registrationSection.classList.add('active');
        document.getElementById('dashboardLink').style.display = 'block';
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
            currentUser = userCredential.user;
            showLoading(false);
            showSection('dashboard');
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
                                currentUser = userCredential.user;
                                showLoading(false);
                                showSection('dashboard');
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
            currentUser = user;
            
            // Create user record in Firestore
            const userData = {
                firstName: firstName,
                email: email,
                phone: phone,
                credit_balance: 0,
                usage_count: 0,
                transactions: [],
                created_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            db.collection('users').doc(user.uid).set(userData)
                .then(() => {
                    showLoading(false);
                    showSection('dashboard');
                    showNotification('Account created successfully!', 'success');
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

// ✅ Real-time Firestore listener
function loadUserData() {
    console.log('Setting up real-time listener for user:', currentUser.uid);
    showLoading(true);

    const userDocRef = db.collection('users').doc(currentUser.uid);

    // Detach any previous listener (optional safety)
    if (window.userListener) {
        window.userListener();
    }

    // Set up new real-time listener
    window.userListener = userDocRef.onSnapshot(
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
                    (transaction.timestamp.toDate ? new Date(transaction.timestamp.toDate()).toLocaleDateString() : 'N/A') : 
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

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`formStep${stepNumber}`).classList.add('active');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function validateBusinessDetails() {
    const businessName = document.getElementById('businessName').value;
    const businessEmail = document.getElementById('businessEmail').value;
    const businessPhone = document.getElementById('businessPhone').value;
    const businessAddress = document.getElementById('businessAddress').value;
    const businessCity = document.getElementById('businessCity').value;
    const businessRegion = document.getElementById('businessRegion').value;
    const businessCategory = document.getElementById('businessCategory').value;
    
    if (!businessName || !businessEmail || !businessPhone || !businessAddress || !businessCity || !businessRegion || !businessCategory) {
        showNotification('Please fill all required fields', 'error');
        return false;
    }
    
    return true;
}

function saveBusinessDetails() {
    formData.businessName = document.getElementById('businessName').value;
    formData.businessEmail = document.getElementById('businessEmail').value;
    formData.businessPhone = document.getElementById('businessPhone').value;
    formData.businessAddress = document.getElementById('businessAddress').value;
    formData.businessCity = document.getElementById('businessCity').value;
    formData.businessRegion = document.getElementById('businessRegion').value;
    formData.businessCategory = document.getElementById('businessCategory').value;
    formData.businessDescription = document.getElementById('businessDescription').value;
}

function addDirector() {
    const directorId = Date.now();
    const directorItem = document.createElement('div');
    directorItem.className = 'director-item';
    directorItem.id = `director-${directorId}`;
    
    directorItem.innerHTML = `
        <button class="remove-btn" onclick="removeDirector(${directorId})">
            <i class="fas fa-times"></i>
        </button>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control director-name" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Phone Number</label>
                <div class="input-group">
                    <span class="input-group-text">+233</span>
                    <input type="tel" class="form-control director-phone" required>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control director-email" required>
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Address</label>
                <input type="text" class="form-control director-address" required>
            </div>
        </div>
    `;
    
    document.getElementById('directorsList').appendChild(directorItem);
    
    // Add to directors array
    directors.push({
        id: directorId,
        name: '',
        phone: '',
        email: '',
        address: ''
    });
}

function removeDirector(directorId) {
    document.getElementById(`director-${directorId}`).remove();
    directors = directors.filter(d => d.id !== directorId);
}

function validateDirectors() {
    const directorItems = document.querySelectorAll('.director-item');
    
    if (directorItems.length === 0) {
        showNotification('Please add at least one director', 'error');
        return false;
    }
    
    let isValid = true;
    directorItems.forEach(item => {
        const name = item.querySelector('.director-name').value;
        const phone = item.querySelector('.director-phone').value;
        const email = item.querySelector('.director-email').value;
        const address = item.querySelector('.director-address').value;
        
        if (!name || !phone || !email || !address) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Please fill all director fields', 'error');
    }
    
    return isValid;
}

function saveDirectors() {
    const directorItems = document.querySelectorAll('.director-item');
    directors = [];
    
    directorItems.forEach(item => {
        const id = parseInt(item.id.replace('director-', ''));
        directors.push({
            id: id,
            name: item.querySelector('.director-name').value,
            phone: item.querySelector('.director-phone').value,
            email: item.querySelector('.director-email').value,
            address: item.querySelector('.director-address').value
        });
    });
}

function addSubsidiary() {
    const subsidiaryId = Date.now();
    const subsidiaryItem = document.createElement('div');
    subsidiaryItem.className = 'subsidiary-item';
    subsidiaryItem.id = `subsidiary-${subsidiaryId}`;
    
    subsidiaryItem.innerHTML = `
        <button class="remove-btn" onclick="removeSubsidiary(${subsidiaryId})">
            <i class="fas fa-times"></i>
        </button>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control subsidiary-name">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label">Registration Number</label>
                <input type="text" class="form-control subsidiary-reg-number">
            </div>
            <div class="col-md-12 mb-3">
                <label class="form-label">Address</label>
                <input type="text" class="form-control subsidiary-address">
            </div>
        </div>
    `;
    
    document.getElementById('subsidiariesList').appendChild(subsidiaryItem);
    
    // Add to subsidiaries array
    subsidiaries.push({
        id: subsidiaryId,
        name: '',
        regNumber: '',
        address: ''
    });
}

function removeSubsidiary(subsidiaryId) {
    document.getElementById(`subsidiary-${subsidiaryId}`).remove();
    subsidiaries = subsidiaries.filter(s => s.id !== subsidiaryId);
}

function saveSubsidiaries() {
    const subsidiaryItems = document.querySelectorAll('.subsidiary-item');
    subsidiaries = [];
    
    subsidiaryItems.forEach(item => {
        const id = parseInt(item.id.replace('subsidiary-', ''));
        subsidiaries.push({
            id: id,
            name: item.querySelector('.subsidiary-name').value,
            regNumber: item.querySelector('.subsidiary-reg-number').value,
            address: item.querySelector('.subsidiary-address').value
        });
    });
}

function generateReview() {
    const reviewContent = document.getElementById('reviewContent');
    
    // Calculate cost
    let cost = 0;
    let costMessage = '';
    
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
                
                if (freeSubmissions > 0) {
                    cost = 0;
                    costMessage = `This submission is free. You have ${freeSubmissions - 1} free submissions remaining.`;
                } else {
                    cost = registrationCost;
                    costMessage = `This submission will cost ${cost} GHS.`;
                }
                
                document.getElementById('submissionCostInfo').textContent = costMessage;
                
                // Generate review HTML
                let reviewHTML = `
                    <div class="mb-4">
                        <h6>Registration Type</h6>
                        <p>${getRegistrationTypeName(selectedRegistrationType)}</p>
                    </div>
                    <div class="mb-4">
                        <h6>Business Details</h6>
                        <p><strong>Name:</strong> ${formData.businessName}</p>
                        <p><strong>Email:</strong> ${formData.businessEmail}</p>
                        <p><strong>Phone:</strong> +233${formData.businessPhone}</p>
                        <p><strong>Address:</strong> ${formData.businessAddress}, ${formData.businessCity}, ${formData.businessRegion}</p>
                        <p><strong>Category:</strong> ${formData.businessCategory}</p>
                        ${formData.businessDescription ? `<p><strong>Description:</strong> ${formData.businessDescription}</p>` : ''}
                    </div>
                `;
                
                if (directors.length > 0) {
                    reviewHTML += `
                        <div class="mb-4">
                            <h6>Directors</h6>
                    `;
                    
                    directors.forEach(director => {
                        reviewHTML += `
                            <div class="card mb-2">
                                <div class="card-body">
                                    <p class="mb-1"><strong>Name:</strong> ${director.name}</p>
                                    <p class="mb-1"><strong>Phone:</strong> +233${director.phone}</p>
                                    <p class="mb-1"><strong>Email:</strong> ${director.email}</p>
                                    <p class="mb-0"><strong>Address:</strong> ${director.address}</p>
                                </div>
                            </div>
                        `;
                    });
                    
                    reviewHTML += `</div>`;
                }
                
                if (subsidiaries.length > 0) {
                    reviewHTML += `
                        <div class="mb-4">
                            <h6>Subsidiaries</h6>
                    `;
                    
                    subsidiaries.forEach(subsidiary => {
                        reviewHTML += `
                            <div class="card mb-2">
                                <div class="card-body">
                                    <p class="mb-1"><strong>Name:</strong> ${subsidiary.name}</p>
                                    <p class="mb-1"><strong>Registration Number:</strong> ${subsidiary.regNumber}</p>
                                    <p class="mb-0"><strong>Address:</strong> ${subsidiary.address}</p>
                                </div>
                            </div>
                        `;
                    });
                    
                    reviewHTML += `</div>`;
                }
                
                reviewContent.innerHTML = reviewHTML;
            }
        })
        .catch((error) => {
            showNotification(error.message, 'error');
        });
}

function getRegistrationTypeName(type) {
    switch (type) {
        case 'sole-proprietor':
            return 'Sole Proprietor';
        case 'limited':
            return 'Limited Company';
        case 'ngo':
            return 'NGO';
        case 'other':
            return 'Other Services';
        default:
            return 'Unknown';
    }
}

function submitForm() {
    showLoading(true);
    
    // Check if user has enough credits
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const freeSubmissions = Math.max(0, 2 - (userData.usage_count || 0));
                
                if (freeSubmissions === 0 && (userData.credit_balance || 0) < registrationCost) {
                    showLoading(false);
                    showNotification('Insufficient credits. Please top up your account.', 'error');
                    return;
                }
                
                // Prepare submission data
                const submissionData = {
                    userId: currentUser.uid,
                    registrationType: selectedRegistrationType,
                    businessDetails: formData,
                    directors: directors,
                    subsidiaries: subsidiaries,
                    status: 'pending',
                    submittedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Save submission to Firestore
                db.collection('submissions').add(submissionData)
                    .then((docRef) => {
                        // Update user data
                        const updates = {
                            usage_count: firebase.firestore.FieldValue.increment(1)
                        };
                        
                        if (freeSubmissions === 0) {
                            updates.credit_balance = firebase.firestore.FieldValue.increment(-registrationCost);
                            
                            // Add transaction record
                            const transaction = {
                                type: 'debit',
                                amount: registrationCost,
                                description: `Business registration (${getRegistrationTypeName(selectedRegistrationType)})`,
                                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                                ref: docRef.id
                            };
                            
                            updates.transactions = firebase.firestore.FieldValue.arrayUnion(transaction);
                        }
                        
                        db.collection('users').doc(currentUser.uid).update(updates)
                            .then(() => {
                                showLoading(false);
                                showNotification('Registration submitted successfully!', 'success');
                                
                                // Reset form and go to dashboard
                                resetForm();
                                loadUserData();
                                showSection('dashboard');
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
        })
        .catch((error) => {
            showLoading(false);
            showNotification(error.message, 'error');
        });
}

function resetForm() {
    // Reset form data
    selectedRegistrationType = null;
    registrationCost = 0;
    directors = [];
    subsidiaries = [];
    formData = {};
    
    // Reset UI
    document.querySelectorAll('.registration-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.getElementById('nextToStep2Btn').disabled = true;
    
    // Clear form fields
    document.getElementById('businessDetailsForm').reset();
    
    // Clear directors
    document.getElementById('directorsList').innerHTML = '';
    
    // Clear subsidiaries
    document.getElementById('subsidiariesList').innerHTML = '';
    
    // Go to first step
    showStep(1);
}

// ✅ Improved payment processor
// ✅ Improved payment processor (fixed timestamp + cleaner update)
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

            // ✅ Use Date() instead of serverTimestamp() (Firestore limitation)
            const transaction = {
                type: 'credit',
                amount: amount,
                method: 'Mobile Money',
                provider: paymentMethod,
                timestamp: new Date(), // ✅ FIXED HERE
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

                // No need for setTimeout — real-time listener auto-refreshes dashboard
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
