require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');

// Read the frontend static data and convert it to be requirable
const dataPath = '../src/data/products.js';
let content = fs.readFileSync(dataPath, 'utf8');
content = content.replace('export const products =', 'module.exports =');
fs.writeFileSync('./temp_data.js', content, 'utf8');

const products = require('./temp_data.js');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hastkala')
  .then(async () => {
    console.log('MongoDB connected for seeding...');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared.');
    
    // Clean up IDs so mongoose creates new ObjectIds
    const seedProducts = products.map(p => {
      const newP = { ...p };
      delete newP.id; // Remove string ID, let Mongoose handle it
      return newP;
    });

    // Insert new products
    await Product.insertMany(seedProducts);
    console.log(`Successfully seeded ${seedProducts.length} products!`);
    
    // Cleanup temp file
    fs.unlinkSync('./temp_data.js');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
