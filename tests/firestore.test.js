const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const { test, describe, before, after, beforeEach } = require('node:test');

let testEnv;

describe('Firestore Security Rules', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'hastkala-sih-test-firestore',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  describe('Users Collection', () => {
    test('should allow owner to read their own profile', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' });
      });
      await assertSucceeds(alice.firestore().collection('users').doc('alice').get());
    });

    test('should block read if not owner, not admin, and not active artisan', async () => {
      const bob = testEnv.authenticatedContext('bob');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' });
      });
      await assertFails(bob.firestore().collection('users').doc('alice').get());
    });

    test('should allow public to read active artisan profile', async () => {
      const unauth = testEnv.unauthenticatedContext();
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'active' });
      });
      await assertSucceeds(unauth.firestore().collection('users').doc('alice').get());
    });

    test('should allow users to create their own profile during signup', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await assertSucceeds(
        alice.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' })
      );
    });

    test('should prevent users from self-registering as admin', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await assertFails(
        alice.firestore().collection('users').doc('alice').set({ role: 'admin', status: 'active' })
      );
    });

    test('should prevent users from updating their own status and role', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' });
      });
      await assertFails(
        alice.firestore().collection('users').doc('alice').update({ status: 'active' })
      );
      await assertFails(
        alice.firestore().collection('users').doc('alice').update({ role: 'admin' })
      );
    });

    test('should allow admins to update any user (e.g., approve/reject)', async () => {
      const admin = testEnv.authenticatedContext('admin123', { admin: true });
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('admin123').set({ role: 'admin', status: 'active' });
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' });
      });
      
      await assertSucceeds(
        admin.firestore().collection('users').doc('alice').update({ status: 'active' })
      );
    });
  });

  describe('Products Collection', () => {
    test('should allow anyone to read products', async () => {
      const unauth = testEnv.unauthenticatedContext();
      await assertSucceeds(unauth.firestore().collection('products').doc('prod1').get());
    });

    test('should block product creation if artisan is not active', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'pending' });
      });
      
      await assertFails(
        alice.firestore().collection('products').doc('prod1').set({ artisanId: 'alice', title: 'Test Product' })
      );
    });

    test('should allow active artisan to create their own product', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('alice').set({ role: 'artisan', status: 'active' });
      });
      
      await assertSucceeds(
        alice.firestore().collection('products').doc('prod1').set({ artisanId: 'alice', title: 'Test Product' })
      );
    });

    test('should prevent user from spoofing artisanId on creation', async () => {
      const bob = testEnv.authenticatedContext('bob');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('bob').set({ role: 'artisan', status: 'active' });
      });
      
      await assertFails(
        bob.firestore().collection('products').doc('prod1').set({ artisanId: 'alice', title: 'Test Product' })
      );
    });
  });

  describe('Enquiries Collection', () => {
    test('should allow any authenticated user to create an enquiry', async () => {
      const bob = testEnv.authenticatedContext('bob');
      await assertSucceeds(
        bob.firestore().collection('enquiries').doc('enq1').set({ artisanId: 'alice', message: 'Hello' })
      );
    });

    test('should block unauthenticated user from creating enquiry', async () => {
      const unauth = testEnv.unauthenticatedContext();
      await assertFails(
        unauth.firestore().collection('enquiries').doc('enq1').set({ artisanId: 'alice', message: 'Hello' })
      );
    });

    test('should allow artisan to read their own enquiries', async () => {
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('enquiries').doc('enq1').set({ artisanId: 'alice', message: 'Hello' });
      });
      
      await assertSucceeds(
        alice.firestore().collection('enquiries').doc('enq1').get()
      );
    });

    test('should block artisan from reading others enquiries', async () => {
      const charlie = testEnv.authenticatedContext('charlie');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('enquiries').doc('enq1').set({ artisanId: 'alice', message: 'Hello' });
      });
      
      await assertFails(
        charlie.firestore().collection('enquiries').doc('enq1').get()
      );
    });
  });
});
