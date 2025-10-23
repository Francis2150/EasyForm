// Firebase client helpers: auth (phone SMS), Firestore for user wallet
measurementId: "G-GVCPBN8VB5"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Prepare reCAPTCHA (invisible)
export function setupRecaptcha(containerId = 'recaptcha-container') {
window.recaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
}


// start phone sign-in: sends SMS
export async function sendSignInCode(phoneNumber) {
if (!window.recaptchaVerifier) setupRecaptcha();
const appVerifier = window.recaptchaVerifier;
// Firebase requires phone number in E.164 format. Expect user to enter Ghana format like +23324xxxxxxx
return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}


// After code is confirmed by user (confirmationResult.confirm(code)) Firebase signs in the user.
// We'll then ensure their document exists in Firestore and give them free credits if new.
export async function ensureUserRecord(uid, phone) {
const userRef = doc(db, 'users', uid);
const snap = await getDoc(userRef);
if (!snap.exists()) {
// Give 2 free credits by default, as earlier plan
await setDoc(userRef, { phone, credits: 2, history: [] });
}
}


// Utility: get user wallet
export async function getUserWallet(uid) {
const userRef = doc(db, 'users', uid);
const snap = await getDoc(userRef);
return snap.exists() ? snap.data() : null;
}


// Deduct credits atomically and record history
export async function chargeForForm(uid, formName, cost) {
const userRef = doc(db, 'users', uid);
const snap = await getDoc(userRef);
if (!snap.exists()) throw new Error('User not found');
const credits = snap.data().credits || 0;
if (credits < cost) throw new Error('Insufficient credits');


await updateDoc(userRef, {
credits: credits - cost,
history: arrayUnion({ form: formName, cost, date: new Date().toISOString() })
});
}


// Add credits (call from webhook or client after verification)
export async function addCreditsToUser(uid, amount, source = 'paystack') {
const userRef = doc(db, 'users', uid);
const snap = await getDoc(userRef);
if (!snap.exists()) {
// create if not exists
await setDoc(userRef, { phone: uid, credits: amount, history: [{ type: 'credit', amount, source, date: new Date().toISOString() }] });
return;
}


const credits = snap.data().credits || 0;
await updateDoc(userRef, {
credits: credits + amount,
history: arrayUnion({ type: 'credit', amount, source, date: new Date().toISOString() })
});
}