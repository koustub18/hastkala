const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    email = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role || 'buyer';
    let assignedStatus = 'active';
    if (assignedRole === 'artisan') {
      assignedStatus = 'pending';
    } else if (assignedRole === 'admin') {
      assignedStatus = email === process.env.MASTER_ADMIN_EMAIL ? 'active' : 'pending';
    }
    
    const newUser = new User({ name, email, password: hashedPassword, role: assignedRole, status: assignedStatus });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, status: newUser.status, name: newUser.name, email: newUser.email },
      process.env.JWT_SECRET || 'hastkala_secret',
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    let { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    email = email.toLowerCase().trim();
    
    // Find user in DB by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been suspended for violating platform policies.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending approval by the main administrator.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check role
    if (user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Sign JWT
    const payload = {
      id: user._id,
      role: user.role,
      status: user.status,
      name: user.name,
      email: user.email
    };


    const token = jwt.sign(payload, process.env.JWT_SECRET || 'hastkala_secret', { expiresIn: '7d' });

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
