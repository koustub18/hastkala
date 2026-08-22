const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache');
const { verifyAuthContext, verifyArtisan, verifyActiveStatus } = require('../middleware/roleCheck');

const {
  getProducts,
  getMyProducts,
  getProductPriceAdvice,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// @route   GET /api/products
router.get('/', cache(60), getProducts);

// @route   GET /api/products/me
router.get('/me', verifyAuthContext, verifyArtisan, getMyProducts);

// @route   GET /api/products/price-advice
router.get('/price-advice', getProductPriceAdvice);

// @route   GET /api/products/:id
router.get('/:id', getProductById);

// @route   POST /api/products
router.post('/', verifyAuthContext, verifyArtisan, verifyActiveStatus, createProduct);

// @route   PUT /api/products/:id
router.put('/:id', verifyAuthContext, verifyArtisan, verifyActiveStatus, updateProduct);

// @route   DELETE /api/products/:id
router.delete('/:id', verifyAuthContext, verifyArtisan, verifyActiveStatus, deleteProduct);

module.exports = router;


