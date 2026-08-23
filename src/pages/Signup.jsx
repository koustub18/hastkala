import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, ShoppingBag, Store, AlertCircle, Loader2 } from 'lucide-react';

import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer'); // Default to customer
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', color: 'bg-transparent', width: 'w-0' };
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', text: 'text-red-500' };
    if (score === 2) return { label: 'Medium', color: 'bg-orange-500', width: 'w-2/4', text: 'text-orange-500' };
    if (score === 3) return { label: 'Good', color: 'bg-yellow-500', width: 'w-3/4', text: 'text-yellow-500' };
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-500' };
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name
      });

      const role = selectedRole;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        status: role === 'customer' ? 'active' : 'pending',
        createdAt: new Date().toISOString(),
        hasOnboarded: false
      });

      // Wait briefly for AuthContext to potentially pick up the change, though we can navigate directly
      if (role === 'artisan') {
        navigate('/seller/onboarding', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      let message = 'Registration failed. ' + err.message;
      if (err.code === 'auth/email-already-in-use') {
         message = 'This email is already in use.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center pt-24 pb-12 px-6">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-forest-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-terracotta-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-earth-100 my-8">

        {/* Left Side - Image/Branding */}
        <div className="md:w-5/12 bg-earth-900 text-earth-50 flex flex-col justify-between p-10 relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 z-0 opacity-40">
            <img
              src="https://images.unsplash.com/photo-1529690648467-d499766e4206?q=80&w=2070&auto=format&fit=crop"
              alt="Artisan weaving"
              className="w-full h-full object-cover grayscale"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-earth-900/80 to-earth-900/60 z-10" />

          <div className="relative z-20">
            <Link to="/" className="flex items-center gap-2 group mb-12">
              <div className="w-10 h-10 rounded-full bg-earth-50 flex items-center justify-center text-earth-900 font-serif font-bold text-2xl shadow-lg">
                H
              </div>
              <span className="font-serif text-3xl font-bold tracking-wider text-earth-50">
                HASTKALA
              </span>
            </Link>

            <h2 className="text-4xl font-serif font-bold leading-snug mb-4">
              Join Hastkala
            </h2>
            <p className="text-earth-300 font-light text-lg">
              Celebrate the legacy of Indian craftsmanship. Connect, discover, and empower.
            </p>
          </div>

          <div className="relative z-20 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-px bg-terracotta-500" />
              <p className="text-sm font-bold uppercase tracking-widest text-terracotta-400">Restoring Dignity</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-7/12 p-8 lg:p-12 flex flex-col relative bg-white h-full overflow-y-auto max-h-[85vh] no-scrollbar">
          <Link to="/login" className="text-earth-400 hover:text-earth-800 transition-colors flex items-center gap-2 text-sm font-medium w-fit mb-6">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div className="mb-8 text-center mt-2 md:mt-0">
            <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">Create your Account</h3>
            <p className="text-earth-500 text-sm">Join the Hastkala community today</p>
          </div>

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'customer'
                  ? 'border-earth-900 bg-earth-50 shadow-md'
                  : 'border-earth-100 bg-white hover:border-earth-300 hover:bg-earth-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                selectedRole === 'customer' ? 'bg-earth-900 text-white' : 'bg-earth-100 text-earth-600'
              }`}>
                <ShoppingBag size={24} />
              </div>
              <h4 className={`font-bold uppercase tracking-wider text-sm mb-1 ${
                selectedRole === 'customer' ? 'text-earth-900' : 'text-earth-700'
              }`}>I am a Buyer</h4>
              <p className="text-xs text-earth-500 leading-relaxed">
                Discover crafts, connect with artisans, and enquire about products.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('artisan')}
              className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                selectedRole === 'artisan'
                  ? 'border-terracotta-600 bg-terracotta-50 shadow-md'
                  : 'border-earth-100 bg-white hover:border-terracotta-200 hover:bg-terracotta-50/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                selectedRole === 'artisan' ? 'bg-terracotta-600 text-white' : 'bg-earth-100 text-earth-600'
              }`}>
                <Store size={24} />
              </div>
              <h4 className={`font-bold uppercase tracking-wider text-sm mb-1 ${
                selectedRole === 'artisan' ? 'text-terracotta-700' : 'text-earth-700'
              }`}>I am an Artisan</h4>
              <p className="text-xs text-earth-500 leading-relaxed">
                Sell your craft, create products, and manage buyer enquiries.
              </p>
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">

            {/* Full Name */}
            <div className="relative">
              <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-12 py-3 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-earth-500 uppercase tracking-widest font-bold">Password strength</span>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${getPasswordStrength(password).text}`}>
                      {getPasswordStrength(password).label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-earth-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPasswordStrength(password).color} ${getPasswordStrength(password).width} transition-all duration-300`} 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-11 pr-4 py-3 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-earth-900 text-white font-bold uppercase tracking-widest py-4 rounded mt-4 hover:bg-terracotta-700 transition-colors shadow-lg shadow-earth-900/20 flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-earth-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-terracotta-600 hover:text-terracotta-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
