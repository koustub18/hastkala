const Product = require('../models/Product');

// @desc    Simulates a web crawl and Perceptual Hashing match for a given product
// @route   POST /api/ipshield/scan
// @access  Private/Artisan
const scanProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Simulate finding the original product to get its "pHash"
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // In a real scenario, here we would queue a Puppeteer/ScraperAPI job 
    // to check Amazon/Etsy, calculate pHash distances, and save matches to DB.
    
    // SIMULATION MOCK for Hackathon presentation:
    // Adding artificial delay to simulate the crawling and hashing process
    setTimeout(() => {
      // Simulate finding a high-probability counterfeit
      const simulatedMatch = {
        scanId: 'SCN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        originalProductId: product._id,
        originalImage: product.image,
        platform: 'Amazon IN',
        counterfeitUrl: 'https://amazon.in/dp/B0XFAKE123',
        counterfeitImage: product.image || 'https://images.unsplash.com/photo-1605335198031-6eacefba50a8',
        similarityScore: 94.2, // > 90% is a match
        pHashDistance: 4, // low hamming distance
        sellerName: 'Global Imports Corp',
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        message: 'Scan completed',
        matchesFound: 1,
        match: simulatedMatch
      });
    }, 2500); // 2.5 second simulation delay for UI effect

  } catch (err) {
    console.error('IP Shield Scan error:', err);
    res.status(500).json({ message: 'Server error during scan' });
  }
};

// @desc    Generates and dispatches a DMCA Takedown notice for an identified match
// @route   POST /api/ipshield/takedown
// @access  Private/Artisan
const issueTakedown = async (req, res) => {
  try {
    const { scanId, platform } = req.body;
    
    if (!scanId || !platform) {
      return res.status(400).json({ message: 'scanId and platform are required' });
    }

    // In a real environment:
    // 1. We would generate a PDF containing the artisan's IPFS CID and TruthMark code as proof.
    // 2. We would dispatch an email to platform's legal address (e.g. copyright@amazon.com).

    // SIMULATION MOCK:
    setTimeout(() => {
      res.status(200).json({
        message: `DMCA Takedown Notice successfully dispatched to ${platform} Legal Department.`,
        referenceId: `DMCA-${scanId}`,
        status: 'Sent'
      });
    }, 1500); // 1.5 second delay for UI effect

  } catch (err) {
    console.error('IP Shield Takedown error:', err);
    res.status(500).json({ message: 'Server error generating takedown notice' });
  }
};

module.exports = {
  scanProduct,
  issueTakedown
};
