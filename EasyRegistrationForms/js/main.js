// js/main.js
import { login, signup } from './auth.js';
import { showSection } from './utils.js';
import { showStep, addDirector, addSubsidiary, submitRegistration } from './registration.js';
import { initiateTopUp } from './payment.js';

document.addEventListener('DOMContentLoaded', () => {
  // Auth navigation
  document.getElementById('loginBtn')?.addEventListener('click', login);
  document.getElementById('signupBtn')?.addEventListener('click', signup);
  document.getElementById('showSignupLink')?.addEventListener('click', () => showSection('signup'));
  document.getElementById('showLoginLink')?.addEventListener('click', () => showSection('login'));

  // Registration steps
  document.getElementById('nextStepBtn')?.addEventListener('click', () => showStep(2));
  document.getElementById('prevStepBtn')?.addEventListener('click', () => showStep(1));

  // Directors
  document.getElementById('addDirectorBtn')?.addEventListener('click', addDirector);

  // Subsidiaries
  document.getElementById('addSubsidiaryBtn')?.addEventListener('click', addSubsidiary);

  // Submit registration
  document.getElementById('submitRegistrationBtn')?.addEventListener('click', submitRegistration);

  // Payment
  document.getElementById('topUpBtn')?.addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('topUpAmount').value);
    initiateTopUp(amount);
  });
});
