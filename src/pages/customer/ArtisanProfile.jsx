import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, MapPin, Award, ShoppingBag, Heart } from 'lucide-react';
import { useArtisanProfile } from '../../hooks/useArtisanProfile';
import { useProducts } from '../../hooks/useProducts';

const ArtisanProfile = () => {
  const { artisanId } = useParams();
  const { artisan, isLoading: isArtisanLoading } = useArtisanProfile(artisanId);
  const { products, isLoading: isProductsLoading } = useProducts(null, artisanId);

  if (isArtisanLoading) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 md:px-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-earth-900 mb-4">Artisan not found</h2>
        <Link to="/explore" className="text-forest-600 hover:underline">Return to Explore</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/explore" className="inline-flex items-center gap-2 text-earth-600 hover:text-forest-700 mb-8 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to explore
        </Link>

        {/* Artisan Header */}
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-earth-900/5 mb-12 border border-earth-100/50">
          <div className="h-48 bg-forest-900 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="px-8 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12 text-center md:text-left">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-earth-50 flex flex-shrink-0 items-center justify-center text-earth-400 overflow-hidden relative z-10 shadow-xl">
              <User size={48} />
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-earth-900 font-serif mb-2">{artisan.name || 'Anonymous Artisan'}</h1>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-earth-600">
                {artisan.location && (
                  <div className="flex items-center gap-1 bg-earth-100 px-3 py-1 rounded-full">
                    <MapPin size={16} /> {artisan.location}
                  </div>
                )}
                {artisan.specialty && (
                  <div className="flex items-center gap-1 bg-forest-50 text-forest-700 px-3 py-1 rounded-full font-medium">
                    <Award size={16} /> Master {artisan.specialty}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {(artisan.bio || artisan.story) && (
            <div className="px-8 pb-8 md:pl-48">
              <h3 className="text-lg font-semibold text-earth-900 mb-2">About the Artisan</h3>
              <p className="text-earth-700 leading-relaxed max-w-3xl">
                {artisan.story || artisan.bio}
              </p>
            </div>
          )}
        </div>

        {/* Artisan's Products */}
        <h2 className="text-2xl font-bold text-earth-900 font-serif mb-6">Creations by {artisan.name?.split(' ')[0] || 'this Artisan'}</h2>
        
        {isProductsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                    <div className="flex items-center justify-between mt-3">
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
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
            <ShoppingBag size={64} className="mx-auto text-earth-300 mb-4" />
            <h3 className="text-xl font-semibold text-earth-900 mb-2">No creations yet</h3>
            <p className="text-earth-600">This artisan hasn't listed any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanProfile;
