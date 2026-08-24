const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const { test, describe, before, after, beforeEach } = require('node:test');

let testEnv;

describe('Storage Security Rules', () => {
  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'hastkala-sih-test-storage',
      firestore: {
        rules: readFileSync('firestore.rules', 'utf8'),
        host: '127.0.0.1',
        port: 8080,
      },
      storage: {
        rules: readFileSync('storage.rules', 'utf8'),
        host: '127.0.0.1',
        port: 9199,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearStorage();
    await testEnv.clearFirestore();
  });

  describe('Products Storage', () => {
    test('should allow anyone to read product images', async () => {
      const unauth = testEnv.unauthenticatedContext();
      // First, create the file using an authenticated context
      const alice = testEnv.authenticatedContext('alice');
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('products/alice/image1.jpg').put(Buffer.alloc(1024), { contentType: 'image/jpeg' });
      });
      await assertSucceeds(unauth.storage().ref('products/alice/image1.jpg').getDownloadURL());
    });

    test('should allow owner to upload valid image', async () => {
      const alice = testEnv.authenticatedContext('alice');
      
      // Need a mock file
      const mockFile = Buffer.alloc(1024); // 1KB
      
      // We pass the string contents of a file along with metadata
      await assertSucceeds(
        alice.storage().ref('products/alice/image1.jpg').put(mockFile, {
          contentType: 'image/jpeg',
        })
      );
    });

    test('should block upload if not owner and not admin', async () => {
      const bob = testEnv.authenticatedContext('bob');
      const mockFile = Buffer.alloc(1024);
      
      await assertFails(
        bob.storage().ref('products/alice/image1.jpg').put(mockFile, {
          contentType: 'image/jpeg',
        })
      );
    });

    test('should allow admin to upload to any user folder', async () => {
      const admin = testEnv.authenticatedContext('admin123', { admin: true });
      const mockFile = Buffer.alloc(1024);
      
      // Set up admin in firestore
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore().collection('users').doc('admin123').set({ role: 'admin', status: 'active' });
      });
      
      await assertSucceeds(
        admin.storage().ref('products/alice/image1.jpg').put(mockFile, {
          contentType: 'image/jpeg',
        })
      );
    });

    test('should block upload if file is too large', async () => {
      const alice = testEnv.authenticatedContext('alice');
      
      // File larger than 5MB
      const largeFile = Buffer.alloc(6 * 1024 * 1024);
      
      await assertFails(
        alice.storage().ref('products/alice/huge.jpg').put(largeFile, {
          contentType: 'image/jpeg',
        })
      );
    });

    test('should block upload if content type is invalid', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const mockFile = Buffer.alloc(1024);
      
      await assertFails(
        alice.storage().ref('products/alice/file.pdf').put(mockFile, {
          contentType: 'application/pdf',
        })
      );
    });

    test('should allow owner to delete image', async () => {
      const alice = testEnv.authenticatedContext('alice');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('products/alice/image1.jpg').put(Buffer.alloc(1024), { contentType: 'image/jpeg' });
      });
      
      await assertSucceeds(
        alice.storage().ref('products/alice/image1.jpg').delete()
      );
    });

    test('should block non-owner from deleting image', async () => {
      const bob = testEnv.authenticatedContext('bob');
      
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.storage().ref('products/alice/image1.jpg').put(Buffer.alloc(1024), { contentType: 'image/jpeg' });
      });
      
      await assertFails(
        bob.storage().ref('products/alice/image1.jpg').delete()
      );
    });
  });

  describe('Other Paths', () => {
    test('should default deny on unknown paths', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const mockFile = Buffer.alloc(1024);
      
      await assertFails(alice.storage().ref('random/alice/image.jpg').put(mockFile, { contentType: 'image/jpeg' }));
      await assertFails(alice.storage().ref('random/alice/image.jpg').getDownloadURL());
    });
  });
});
