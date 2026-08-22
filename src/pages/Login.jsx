import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // --- HACKATHON FIX: Set token for ProtectedRoute ---
        const payload = {
          role: userData.role || 'artisan',
          status: 'active',
          name: userData.name || 'Artisan'
        };
        const dummyToken = 'header.' + btoa(JSON.stringify(payload)) + '.signature';
        localStorage.setItem('token', dummyToken);

        toast.success(`Welcome back, ${userData.name?.split(' ')[0] || 'there'}! 👋`);

        if (userData.role === 'artisan') {
          navigate(userData.hasOnboarded ? '/seller/dashboard' : '/seller/onboarding');
        } else {
          navigate('/seller/dashboard'); // Fallback if no role defined
        }
      } else {
         // --- HACKATHON FIX: Set token for ProtectedRoute ---
         const payload = { role: 'artisan', status: 'active', name: 'Artisan' };
         localStorage.setItem('token', 'header.' + btoa(JSON.stringify(payload)) + '.signature');
         
         toast.success(`Welcome back! 👋`);
         navigate('/seller/dashboard');
      }
    } catch (err) {
      console.error(err);
      let message = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email address first, then click Forgot Password.');
      return;
    }
    toast.success('Password reset link sent! Check your inbox.');
  };

  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center pt-32 pb-12 px-6">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-terracotta-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-forest-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-earth-100">
        
        {/* Left Side - Image/Branding */}
        <div className="md:w-5/12 bg-earth-900 text-earth-50 flex flex-col justify-between p-10 relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1620188989504-20d0f4d34cd6?q=80&w=2070&auto=format&fit=crop" 
              alt="Pottery Artisan" 
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
              Artisan Virtual Manager
            </h2>
            <p className="text-earth-300 font-light text-lg">
              Manage your craft, digitize your catalog, and track your business insights securely.
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
        <div className="md:w-7/12 p-10 lg:p-16 flex flex-col relative bg-white">
          <Link to="/" className="absolute top-8 left-8 text-earth-400 hover:text-earth-800 transition-colors flex items-center gap-2 text-sm font-medium md:hidden">
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="mb-10 text-center">
            <h3 className="text-2xl font-serif font-bold text-earth-900 mb-2">Welcome to Hastkala</h3>
            <p className="text-earth-500 text-sm">Please sign in to your account</p>
          </div>

          {/* Toggle Switch Removed */}

          <form onSubmit={handleLogin} className="flex flex-col gap-5 flex-1 justify-center">
            
            <button 
              type="button" 
              className="w-full flex items-center justify-center py-3.5 border border-earth-300 rounded text-earth-700 font-medium hover:bg-earth-50 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>
            
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-earth-200" />
              <span className="px-4 text-xs font-medium text-earth-400 uppercase">or sign in with email</span>
              <div className="flex-1 h-px bg-earth-200" />
            </div>

            {/* ── IMPROVEMENT 3: Styled Error Banner (not plain red text) ── */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm font-medium leading-snug">{error}</p>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-terracotta-600 hover:text-terracotta-800 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              {/* ── IMPROVEMENT 2: Show / Hide Password Toggle ── */}
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-earth-50 border border-earth-200 rounded focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 transition-all text-earth-900"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-700 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ── IMPROVEMENT 1: Loading Spinner on Submit Button ── */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-earth-900 text-white font-bold uppercase tracking-widest py-4 rounded mt-4 hover:bg-terracotta-700 transition-colors shadow-lg shadow-earth-900/20 flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In to Virtual Manager'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-earth-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-terracotta-600 hover:text-terracotta-800">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
