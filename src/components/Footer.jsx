import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-earth-900 pt-20 pb-10 border-t-8 border-terracotta-500">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-terracotta-600 group-hover:border-terracotta-400 transition-colors bg-white flex items-center justify-center">
                <img src="/logo.jpeg" alt="Hastkala Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-3xl font-bold tracking-wider text-earth-50">
                HASTKALA
              </span>
            </Link>
            <p className="text-earth-300 font-light leading-relaxed mb-8 max-w-sm">
              Restoring dignity to creators. A powerful Virtual Manager securing the future of traditional Indian craftsmanship.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/hastkala_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-earth-800 flex items-center justify-center text-earth-300 hover:bg-terracotta-500 hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com/hastkala.marketplace" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-earth-800 flex items-center justify-center text-earth-300 hover:bg-terracotta-500 hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/hastkala" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-earth-800 flex items-center justify-center text-earth-300 hover:bg-terracotta-500 hover:text-white transition-all">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-earth-50 font-serif font-bold text-lg mb-6 uppercase tracking-wider">
              For Artisans
            </h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/join" className="text-earth-300 hover:text-terracotta-400 transition-colors">Join Hastkala</Link></li>
              <li><Link to="/legal" className="text-earth-300 hover:text-terracotta-400 transition-colors">Legal Rights Help</Link></li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-earth-50 font-serif font-bold text-lg mb-6 uppercase tracking-wider">
              Join the Movement
            </h4>
            <p className="text-earth-300 font-light mb-4">
              Get updates on new artisan tools and platform features.
            </p>
            <form className="flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-earth-800 border border-earth-700 text-white placeholder-earth-400 px-4 py-3 w-full rounded-l focus:outline-none focus:border-terracotta-500 transition-colors"
                required
              />
              <button 
                type="submit"
                className="bg-terracotta-600 hover:bg-terracotta-500 text-white px-6 py-3 font-medium uppercase tracking-wider text-sm rounded-r transition-colors"
              >
                Join
              </button>
            </form>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-earth-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-earth-400 text-sm">
            &copy; 2026 Hastkala. Built for TechSpire 1.0 Hackathon.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-earth-400 hover:text-earth-200 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-earth-400 hover:text-earth-200 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
