import { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Heart, Search, IndianRupee } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error('Invalid token', err);
      }
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setMobileMenuOpen(false);
    window.location.href = '/login';
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Removed search and suggestions logic as it's not needed for the Virtual Manager
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    ...(userRole === 'artisan' ? [{ name: 'Dashboard', path: '/seller/dashboard' }] : [])
  ];

  return (
    <>
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        (isScrolled || !isHomePage)
          ? 'py-3 bg-white/95 backdrop-blur-xl shadow-sm border-b border-earth-200/50' 
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between gap-8 xl:gap-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 overflow-hidden rounded-full shadow-md transition-all duration-300 bg-white"
          >
            <img src="/logo.jpeg" alt="Hastkala Logo" className="w-full h-full object-cover" />
          </motion.div>
          <span className={`font-serif text-2xl font-bold tracking-widest uppercase transition-colors duration-500 ${(isScrolled || !isHomePage) ? 'text-earth-900' : 'text-white'}`}>
            Hastkala
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-[13px] font-bold tracking-widest uppercase transition-colors relative group py-2 ${
                location.pathname === link.path 
                  ? ((isScrolled || !isHomePage) ? 'text-earth-900' : 'text-white') 
                  : ((isScrolled || !isHomePage) ? 'text-earth-500 hover:text-earth-900' : 'text-white/70 hover:text-white')
              }`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 w-full h-px transform origin-left transition-transform duration-500 ease-out ${
                (isScrolled || !isHomePage) ? 'bg-terracotta-500' : 'bg-white'
              } ${
                location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          {userRole === 'artisan' && (
            <Link 
              to="/seller/dashboard" 
              className={`transition-colors block ${(isScrolled || !isHomePage) ? 'text-earth-600 hover:text-terracotta-600' : 'text-earth-100 hover:text-white'}`}
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <User size={20} strokeWidth={2} />
              </motion.div>
            </Link>
          )}

          {userRole && (
            <button 
              onClick={handleLogout}
              className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded border transition-all ${
                (isScrolled || !isHomePage)
                  ? 'border-terracotta-200 text-terracotta-600 hover:bg-terracotta-50' 
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              Sign Out
            </button>
          )}
        </div>


        {/* Mobile Menu Button */}
        <button 
          className={`md:hidden p-2 transition-colors ${isScrolled ? 'text-earth-800' : 'text-white'}`}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>
    </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-earth-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-earth-50 shadow-2xl p-8 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif text-2xl font-bold tracking-widest text-earth-900 uppercase">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-earth-500 hover:text-terracotta-600 p-2 bg-white rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-serif text-xl tracking-wide transition-colors ${
                      location.pathname === link.path ? 'text-terracotta-600 font-bold' : 'text-earth-700 hover:text-earth-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-4 border-t border-earth-200/50 pt-8">
                {userRole ? (
                  <>
                    {userRole === 'artisan' && (
                      <Link 
                        to="/seller/dashboard"
                        onClick={() => setMobileMenuOpen(false)} 
                        className="flex items-center gap-3 text-earth-700 font-bold uppercase tracking-wider text-sm w-full py-4 bg-white justify-center rounded-lg shadow-sm border border-earth-100"
                      >
                        <User size={18} /> My Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-3 text-terracotta-600 font-bold uppercase tracking-wider text-sm w-full py-4 bg-earth-50 justify-center rounded-lg border border-terracotta-100"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-earth-700 font-bold uppercase tracking-wider text-sm w-full py-4 bg-white justify-center rounded-lg shadow-sm border border-earth-100">
                    <User size={18} /> Account Login
                  </Link>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
