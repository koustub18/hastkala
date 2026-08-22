const Product = require('../models/Product');
const User = require('../models/User');
const { getPriceAdvice } = require('../services/aiPricingService');

// @desc    Get all products or filter by search/category/artisan
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { artisan, search, category, limit = 12, page = 1 } = req.query;
    let query = {};
    
    if (artisan) {
      query.artisan = artisan;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      // Modern Scalable Concept: Full-Text Search
      // Uses the 'text' index defined in the schema instead of a full collection scan ($regex).
      // This is necessary to handle 1000s of users querying simultaneously.
      query.$text = { $search: search };
    }
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 50);
    const skipNum = (pageNum - 1) * limitNum;

    const [products, totalItems] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skipNum).limit(limitNum).lean(),
      Product.countDocuments(query)
    ]);
    
    res.json({
      data: products,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        pageSize: limitNum
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in artisan's products
// @route   GET /api/products/me
// @access  Private/Artisan
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ 
      $or: [
        { artisanId: req.user.id },
        { artisan: req.user.name }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get AI price advice
// @route   GET /api/products/price-advice
// @access  Public
const getProductPriceAdvice = async (req, res) => {
  try {
    const { category, material = '', workHours = 0, complexity = 'medium', imageUrl = '' } = req.query;
    if (!category) return res.status(400).json({ message: 'category is required' });

    const advice = await getPriceAdvice({ category, material, workHours, complexity, imageUrl });
    res.json(advice);
  } catch (err) {
    console.error('AI Price advice error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single product with Recommendation Engine
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Recommendation Engine: Find Similar Masterpieces
    const relatedProducts = await Product.find({
      _id: { $ne: product._id }, // Exclude current product
      $or: [
        { category: product.category },
        { artisan: product.artisan },
        { material: product.material }
      ]
    }).limit(4);

    // Attach relatedProducts inside the payload
    res.json({
      ...product.toObject(),
      relatedProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Artisan
const createProduct = async (req, res) => {
  try {
    const artisan = await User.findById(req.user.id);
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(403).json({ message: 'Only artisans can list products' });
    }

    const { title, price, category, material, image, image2, description, stock } = req.body;

    const product = new Product({
      title,
      price: Number(price),
      category,
      material,
      image,
      image2: image2 || '',
      artisan: artisan.name,
      artisanId: artisan._id,
      artisanImage: artisan.image,
      village: artisan.location && typeof artisan.location === 'string' && artisan.location.includes(',') ? artisan.location.split(',')[0]?.trim() : (artisan.location || ''),
      state: artisan.location && typeof artisan.location === 'string' && artisan.location.includes(',') ? artisan.location.split(',')[1]?.trim() : '',

      authentic: true,
      isBestseller: false,
      priceBreakdown: { artisan: Number(price), platformFee: 0, middleman: 0 }
    });

    const saved = await product.save();

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Artisan
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Only the artisan who created the product can update it
    if (product.artisanId?.toString() !== req.user.id && product.artisan !== req.user.name) {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { title, price, category, material, stock, image, image2, description } = req.body;
    
    product.title       = title       || product.title;
    product.price       = price       || product.price;
    product.category    = category    || product.category;
    product.material    = material    || product.material;
    product.stock       = stock       || product.stock;
    product.image       = image       || product.image;
    product.image2      = image2      !== undefined ? image2 : product.image2;
    product.description = description !== undefined ? description : product.description;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Artisan
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Only the artisan who created the product can delete it
    if (product.artisanId?.toString() !== req.user.id && product.artisan !== req.user.name) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProducts,
  getMyProducts,
  getProductPriceAdvice,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
