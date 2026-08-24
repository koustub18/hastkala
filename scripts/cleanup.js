import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try {
  initializeApp();
} catch (error) {
  console.error("Failed to initialize admin SDK:", error.message);
  process.exit(1);
}

const db = getFirestore();

async function cleanData() {
  let artisansRemoved = 0;
  let productsRemoved = 0;
  let enquiriesRemoved = 0;

  try {
    console.log("Starting cleanup...");
    // 1. Get all artisans
    const usersSnapshot = await db.collection('users').where('role', '==', 'artisan').get();
    console.log(`Found ${usersSnapshot.size} artisans.`);
    
    for (const doc of usersSnapshot.docs) {
      const artisanId = doc.id;
      
      // 2. Delete products for this artisan
      const productsSnapshot = await db.collection('products').where('artisanId', '==', artisanId).get();
      for (const prodDoc of productsSnapshot.docs) {
        await prodDoc.ref.delete();
        productsRemoved++;
      }
      
      // 3. Delete enquiries for this artisan
      const enquiriesSnapshot = await db.collection('enquiries').where('artisanId', '==', artisanId).get();
      for (const enqDoc of enquiriesSnapshot.docs) {
        await enqDoc.ref.delete();
        enquiriesRemoved++;
      }
      
      // 4. Delete the artisan user document
      await doc.ref.delete();
      artisansRemoved++;
    }

    console.log(`Cleanup complete. Removed ${artisansRemoved} artisans, ${productsRemoved} products, ${enquiriesRemoved} enquiries.`);
    
    console.log(`\nARTISAN DOCUMENTS REMOVED:\n${artisansRemoved}`);
    console.log(`ARTISAN PRODUCTS REMOVED:\n${productsRemoved}`);
    console.log(`ARTISAN ENQUIRIES REMOVED:\n${enquiriesRemoved}`);

  } catch (err) {
    console.error("Error during cleanup:", err);
    process.exit(1);
  }
}

cleanData();
