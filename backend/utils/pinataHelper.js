const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

let pinata = null;

// Initialize Pinata only if keys are present
const initPinata = () => {
  if (pinata) return pinata;
  
  const apiKey = process.env.PINATA_API_KEY;
  const apiSecret = process.env.PINATA_API_SECRET;
  
  if (apiKey && apiSecret && apiKey !== 'your_pinata_api_key') {
    pinata = new pinataSDK(apiKey, apiSecret);
    console.log('✅ Pinata IPFS initialized');
    return pinata;
  }
  
  console.log('⚠️  Pinata keys not found — using local file storage fallback');
  return null;
};

/**
 * Upload a file to Pinata IPFS, or fall back to local storage
 * @param {string} filePath - Absolute path to the file
 * @param {string} fileName - Original filename for metadata
 * @returns {string} - IPFS CID (e.g. "QmXyz...") or local path fallback
 */
const uploadToPinata = async (filePath, fileName) => {
  const client = initPinata();
  
  if (client) {
    try {
      const readableStream = fs.createReadStream(filePath);
      const options = {
        pinataMetadata: { name: fileName },
        pinataOptions: { cidVersion: 0 }
      };
      
      const result = await client.pinFileToIPFS(readableStream, options);
      console.log(`📌 Pinned to IPFS: ${result.IpfsHash}`);
      return result.IpfsHash;
    } catch (err) {
      console.error('Pinata upload failed, falling back to local:', err.message);
    }
  }
  
  // Fallback: return the relative path from uploads folder
  const relativePath = `/uploads/${path.basename(filePath)}`;
  console.log(`📁 Local fallback: ${relativePath}`);
  return relativePath;
};

module.exports = { uploadToPinata, initPinata };
