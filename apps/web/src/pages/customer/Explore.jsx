import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShoppingBag, Heart, X, ChevronDown } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../utils/webImageUtils';

const Explore = () => {
  const { products, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('Newest');
  const [showFilters, setShowFilters] = useState(false);

  // Dynamically extract categories and materials from available products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const materials = useMemo(() => {
    const mats = new Set(products.map(p => p.material).filter(Boolean));
    return ['All', ...Array.from(mats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchLower = searchTerm.toLowerCase().trim();
      const titleMatch = product.title?.toLowerCase().includes(searchLower);
      const artisanMatch = product.artisanName?.toLowerCase().includes(searchLower) || product.artisan?.toLowerCase().includes(searchLower);
      const categoryMatchSearch = product.category?.toLowerCase().includes(searchLower);
      const materialMatchSearch = product.material?.toLowerCase().includes(searchLower);
      const tagsMatchSearch = Array.isArray(product.tags) ? product.tags.some(tag => tag.toLowerCase().includes(searchLower)) : false;

      const matchesSearch = !searchLower || titleMatch || artisanMatch || categoryMatchSearch || materialMatchSearch || tagsMatchSearch;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesMaterial = selectedMaterial === 'All' || product.material === selectedMaterial;
      
      const minP = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxP = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const prodPrice = parseFloat(product.price) || 0;
      const matchesPrice = prodPrice >= minP && prodPrice <= maxP;

      return matchesSearch && matchesCategory && matchesMaterial && matchesPrice;
    }).sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      
      if (sortBy === 'Price: Low to High') return priceA - priceB;
      if (sortBy === 'Price: High to Low') return priceB - priceA;
      
      // Default: Newest (assuming createdAt exists, else keeps relative order)
      const dateA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
      const dateB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [products, searchTerm, selectedCategory, selectedMaterial, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedMaterial('All');
    setPriceRange({ min: '', max: '' });
    setSortBy('Newest');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedMaterial !== 'All' || priceRange.min || priceRange.max || sortBy !== 'Newest';

  if (error) {
    return (
      <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">Error loading products. Please try again.</div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-terracotta-600 text-white rounded-full font-bold">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-earth-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-earth-900 font-serif mb-4">Explore the Marketplace</h1>
          <p className="text-lg text-earth-600">Discover unique, handcrafted creations directly from the artisans who make them.</p>
        </div>

        {/* Search and Main Filters Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products, materials, or artisans..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-earth-50 rounded-xl border-none focus:ring-2 focus:ring-terracotta-500 outline-none transition-shadow text-earth-900"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Categories */}
            <div className="flex-1 overflow-hidden hidden md:block">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full font-bold uppercase tracking-wider text-xs transition-colors flex-shrink-0 ${
                      selectedCategory === category 
                        ? 'bg-terracotta-600 text-white shadow-md' 
                        : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors ${
                showFilters || hasActiveFilters ? 'bg-forest-700 text-white' : 'bg-earth-50 text-earth-700 hover:bg-earth-100'
              }`}
            >
              <Filter size={16} /> Filters {hasActiveFilters && '(Active)'}
            </button>
          </div>

          {/* Expanded Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 mt-4 border-t border-earth-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Category Dropdown (if many) */}
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full appearance-none bg-earth-50 border border-earth-200 text-earth-900 text-sm rounded-lg focus:ring-terracotta-500 focus:border-terracotta-500 block p-2.5 outline-none"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Material</label>
                    <div className="relative">
                      <select 
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        className="w-full appearance-none bg-earth-50 border border-earth-200 text-earth-900 text-sm rounded-lg focus:ring-terracotta-500 focus:border-terracotta-500 block p-2.5 outline-none"
                      >
                        {materials.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Price Range (₹)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Min" 
                        value={priceRange.min}
                        onChange={e => setPriceRange({...priceRange, min: e.target.value})}
                        className="w-full bg-earth-50 border border-earth-200 text-earth-900 text-sm rounded-lg focus:ring-terracotta-500 focus:border-terracotta-500 block p-2.5 outline-none"
                      />
                      <span className="text-earth-400">-</span>
                      <input 
                        type="number" 
                        placeholder="Max" 
                        value={priceRange.max}
                        onChange={e => setPriceRange({...priceRange, max: e.target.value})}
                        className="w-full bg-earth-50 border border-earth-200 text-earth-900 text-sm rounded-lg focus:ring-terracotta-500 focus:border-terracotta-500 block p-2.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-xs font-bold text-earth-500 uppercase tracking-wider mb-2">Sort By</label>
                    <div className="relative">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full appearance-none bg-earth-50 border border-earth-200 text-earth-900 text-sm rounded-lg focus:ring-terracotta-500 focus:border-terracotta-500 block p-2.5 outline-none"
                      >
                        <option value="Newest">Newest First</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={clearFilters}
                      className="text-terracotta-600 hover:text-terracotta-800 text-sm font-semibold flex items-center gap-1"
                    >
                      <X size={14} /> Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-80 border border-earth-100"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                key={product.id || index} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-earth-100/50 hover:-translate-y-1 flex flex-col h-full"
              >
                <Link to={`/products/${product.id}`} className="flex-1 flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-earth-100 flex-shrink-0">
                    {(product.image || (product.images && product.images.length > 0)) ? (
                      <img 
                        src={resolveImageUrl(product.image || product.images[0])} 
                        alt={product.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f4f1ea'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16px' fill='%239e9484'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-earth-400">
                        <ShoppingBag size={48} />
                      </div>
                    )}
                    {(product.category || product.craft) && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-earth-800 uppercase tracking-wider shadow-sm">
                        {product.category || product.craft}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg text-earth-900 mb-1 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-earth-600 mb-3 line-clamp-1">By {product.artisanName || product.artisan || 'Artisan'}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-forest-700 font-bold text-lg">{product.price ? `₹${product.price}` : 'Price on request'}</span>
                      <div className="text-terracotta-600 hover:bg-terracotta-50 p-2 rounded-full transition-colors">
                        <Heart size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-12 text-center border border-earth-100 shadow-sm max-w-2xl mx-auto mt-8"
          >
            <div className="bg-earth-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-earth-400" />
            </div>
            <h3 className="text-2xl font-bold text-earth-900 mb-3 font-serif">No products found</h3>
            <p className="text-earth-600 mb-8 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try adjusting your search or removing some filters to discover more items.
            </p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider text-sm transition-colors shadow-md"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Explore;
