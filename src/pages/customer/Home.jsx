import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Users, ShieldCheck, Heart } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';

const Home = () => {
  const { products, isLoading } = useProducts(4);

  return (
    <div className="min-h-screen bg-earth-50">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-earth-900/80 via-earth-900/40 to-earth-900/90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80" 
          alt="Artisan crafting" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-block"
          >
            <span className="text-terracotta-400 font-bold tracking-[0.2em] uppercase text-sm border-b border-terracotta-400/50 pb-1">Heritage & Craft</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif leading-tight text-shadow-sm"
          >
            Discover Authentic <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-400 to-earth-200">Indian Craftsmanship</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-earth-100 mb-8 max-w-2xl mx-auto"
          >
            Connect directly with marginalized artisans. Every purchase empowers a creator and preserves a legacy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to="/explore" 
              className="inline-flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Explore Collection <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-terracotta-500 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-earth-900 font-serif mb-3">Featured Creations</h2>
            <p className="text-earth-600 text-lg">Handpicked masterpieces from our artisans</p>
          </div>
          <Link to="/explore" className="text-terracotta-600 hover:text-terracotta-700 font-bold uppercase tracking-wider text-sm flex items-center gap-2 group transition-colors">
            View Collection <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                key={product.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-earth-100/50 hover:-translate-y-1"
              >
                <Link to={`/products/${product.id}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-earth-100">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400">
                        <ShoppingBag size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-earth-800 uppercase tracking-wider">
                      {product.category || 'Handcrafted'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-earth-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-earth-600 mb-3">By {product.artisanName || product.artisan || 'Artisan'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-forest-700 font-bold">{product.price ? `₹${product.price}` : 'Price on request'}</span>
                      <button className="text-terracotta-600 hover:bg-terracotta-50 p-2 rounded-full transition-colors">
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Impact Section */}
      <section className="bg-earth-900 text-earth-50 py-24 px-4 md:px-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-terracotta-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest-900/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Empowering Artisans</h2>
            <p className="text-earth-300 max-w-2xl mx-auto text-lg">Your support helps sustain traditional crafts and builds a fairer economy for creators across India.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center p-8 rounded-3xl bg-earth-800/50 border border-earth-700/50 backdrop-blur-sm"
            >
              <div className="bg-terracotta-900/40 p-5 rounded-2xl mb-6 shadow-inner border border-terracotta-800/30">
                <Users size={40} className="text-terracotta-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif tracking-wide">Direct Impact</h3>
              <p className="text-earth-300 leading-relaxed">Every purchase directly supports marginalized artisans and their communities.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-earth-800/50 border border-earth-700/50 backdrop-blur-sm"
            >
              <div className="bg-forest-900/40 p-5 rounded-2xl mb-6 shadow-inner border border-forest-800/30">
                <ShieldCheck size={40} className="text-forest-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif tracking-wide">Verified Authenticity</h3>
              <p className="text-earth-300 leading-relaxed">Our platform ensures all products are genuinely handcrafted by the artisans.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center p-8 rounded-3xl bg-earth-800/50 border border-earth-700/50 backdrop-blur-sm"
            >
              <div className="bg-earth-700/40 p-5 rounded-2xl mb-6 shadow-inner border border-earth-600/30">
                <ShoppingBag size={40} className="text-earth-200" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif tracking-wide">Fair Pricing</h3>
              <p className="text-earth-300 leading-relaxed">AI-driven pricing insights ensure fair value for both creators and buyers.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
