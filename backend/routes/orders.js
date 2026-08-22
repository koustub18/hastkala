const express = require('express');
const router = express.Router();
const { verifyAuthContext, verifyAdmin } = require('../middleware/roleCheck');

const {
  createOrder,
  getMyOrders,
  getOrders
} = require('../controllers/orderController');

// @route   POST /api/orders
router.post('/', verifyAuthContext, createOrder);

// @route   GET /api/orders/me
router.get('/me', verifyAuthContext, getMyOrders);

// @route   GET /api/orders
router.get('/', verifyAuthContext, verifyAdmin, getOrders);

module.exports = router;
