require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// To run this script securely, you must have a Firebase Service Account Key JSON file.
// DO NOT COMMIT the service account JSON file to Git.
// Run this script using:
// FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/your/service-account.json ADMIN_PASSWORD=HastkalaAdmin@2026 node scripts/provisionAdmin.js

async function provisionAdmin() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!serviceAccountPath) {
    console.error('❌ Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable is missing.');
    console.error('Please provide the path to your Firebase service account JSON file.');
    console.error('Example: FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json ADMIN_PASSWORD=your_password node scripts/provisionAdmin.js');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('❌ Error: ADMIN_PASSWORD environment variable is missing.');
    process.exit(1);
  }

  try {
    const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    const adminEmail = 'admin@hastkala.in';
    
    console.log(`🔍 Checking if user ${adminEmail} exists...`);
    let userRecord;
    
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`✅ User ${adminEmail} already exists with UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`Creating new user ${adminEmail}...`);
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'Hastkala Admin',
        });
        console.log(`✅ Created user ${adminEmail} with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    console.log(`📝 Updating Firestore document for UID: ${userRecord.uid}`);
    await db.collection('users').doc(userRecord.uid).set({
      role: 'admin',
      status: 'active',
      name: 'Hastkala Admin',
      email: adminEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✨ Admin provisioning complete! You can now log in at /login.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error provisioning admin account:', error);
    process.exit(1);
  }
}

provisionAdmin();
