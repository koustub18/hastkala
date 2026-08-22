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
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-forest-900/40 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80" 
          alt="Artisan crafting" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 font-serif"
          >
            Discover Authentic Indian Craftsmanship
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
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-earth-900 font-serif mb-2">Featured Creations</h2>
            <p className="text-earth-600">Handpicked masterpieces from our artisans</p>
          </div>
          <Link to="/explore" className="text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1 group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={product.id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
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
      <section className="bg-forest-900 text-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="bg-forest-800 p-4 rounded-2xl mb-6">
                <Users size={40} className="text-terracotta-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Direct Impact</h3>
              <p className="text-forest-100/80">Every purchase directly supports marginalized artisans and their communities.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="bg-forest-800 p-4 rounded-2xl mb-6">
                <ShieldCheck size={40} className="text-terracotta-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Authenticity</h3>
              <p className="text-forest-100/80">Our platform ensures all products are genuinely handcrafted by the artisans.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="bg-forest-800 p-4 rounded-2xl mb-6">
                <ShoppingBag size={40} className="text-terracotta-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Fair Pricing</h3>
              <p className="text-forest-100/80">AI-driven pricing insights ensure fair value for both creators and buyers.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
