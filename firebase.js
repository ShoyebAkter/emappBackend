const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Function to generate password reset link
function generatePasswordResetLink(userEmail) {
  return admin.auth().generatePasswordResetLink(userEmail);
}

module.exports = generatePasswordResetLink;
