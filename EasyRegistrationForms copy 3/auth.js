// Firebase Configuration (same as app.js)
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

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const notification = document.getElementById('notification');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    auth.onAuthStateChanged(user => {
        if (user) {
            window.location.href = 'index.html';
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
});

// Functions
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

function generateUniqueId(firstName) {
    // Generate a unique ID based on timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `${firstName}_LIMITED_DATA_COLLECTION_FORM_${timestamp}_${randomStr}`;
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
            window.location.href = 'index.html';
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
                                window.location.href = 'index.html';
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
            const uniqueId = generateUniqueId(firstName);
            const dataCollectionLink = `${window.location.origin}/data-collection.html?id=${uniqueId}`;
            
            // Create user record in Firestore
            const userData = {
                firstName: firstName,
                email: email,
                phone: phone,
                credit_balance: 0,
                usage_count: 0,
                transactions: [],
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                dataCollectionLink: dataCollectionLink,
                uniqueId: uniqueId
            };
            
            db.collection('users').doc(user.uid).set(userData)
                .then(() => {
                    showLoading(false);
                    showNotification('Account created successfully! Your data collection link has been generated.', 'success');
                    
                    // Show the unique link to the user
                    setTimeout(() => {
                        showDataCollectionLink(dataCollectionLink);
                    }, 1000);
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

function showDataCollectionLink(link) {
    // Create a modal to display the link
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'linkModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Your Data Collection Link</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Share this link with your clients to collect their data:</p>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="linkInput" value="${link}" readonly>
                        <button class="btn btn-outline-primary" type="button" id="copyLinkBtn">Copy</button>
                    </div>
                    <p class="text-muted">This link is unique to your account and will be used to collect data for your limited company registrations.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Got it</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize and show the modal
    const linkModal = new bootstrap.Modal(document.getElementById('linkModal'));
    linkModal.show();
    
    // Add copy functionality
    document.getElementById('copyLinkBtn').addEventListener('click', () => {
        const linkInput = document.getElementById('linkInput');
        linkInput.select();
        document.execCommand('copy');
        showNotification('Link copied to clipboard!', 'success');
    });
    
    // Redirect to dashboard after modal is closed
    document.getElementById('linkModal').addEventListener('hidden.bs.modal', () => {
        window.location.href = 'index.html';
    });
}