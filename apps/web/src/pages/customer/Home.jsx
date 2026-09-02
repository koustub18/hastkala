import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShoppingBag, Heart, MapPin, Store, 
  Sparkles, CheckCircle2, HeartHandshake, ShieldCheck, Package 
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { resolveImageUrl } from '../../utils/webImageUtils';
import { extractOriginState } from '../../data/indianStates';

const Home = () => {
  const { products, isLoading } = useProducts(4);

  const artisanProfiles = [
    {
      id: 'artisan-1',
      name: 'Ramesh',
      craft: 'Sambalpuri Weaver',
      state: 'Odisha',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
      story: 'Weaving traditional Sambalpuri ikats passed down through four generations of artisans.'
    },
    {
      id: 'artisan-2',
      name: 'Kavita',
      craft: 'Pottery Artist',
      state: 'Rajasthan',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80',
      story: 'Hand-molding blue pottery ceramics with natural terracotta and mineral pigments.'
    },
    {
      id: 'artisan-3',
      name: 'Anjali',
      craft: 'Terracotta Artist',
      state: 'West Bengal',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&q=80',
      story: 'Sculpting intricate terracotta wall reliefs and traditional folk pottery figurines.'
    }
  ];

  const craftCategories = [
    { name: 'Pottery & Ceramics', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80' },
    { name: 'Textiles & Weaving', img: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80' },
    { name: 'Wood Carving', img: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&q=80' },
    { name: 'Metal Work', img: 'https://images.unsplash.com/photo-1577083165261-295f70a7b458?auto=format&fit=crop&q=80' },
    { name: 'Traditional Painting', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80' }
  ];

  return (
    <div className="min-h-screen bg-earth-50 text-earth-900 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-earth-900 text-white pt-24 pb-16">
        {/* Artisan at work background */}
        <div className="absolute inset-0 bg-gradient-to-b from-earth-900/70 via-earth-900/30 to-earth-900/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80" 
          alt="Indian artisan crafting pottery by hand" 
          className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        />

        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center my-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-terracotta-500/20 border border-terracotta-400/30 text-terracotta-300 font-sans font-semibold tracking-widest uppercase text-[11px] mb-6"
          >
            <Sparkles size={12} className="text-terracotta-400" />
            <span>THE HANDS BEHIND THE CRAFT</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight max-w-4xl mx-auto"
          >
            Made by Hands. <br className="hidden sm:inline" />
            <span className="text-terracotta-300">Carried by Generations.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-earth-200 mb-10 max-w-2xl mx-auto font-sans leading-relaxed"
          >
            Discover handmade products directly from the artisans who create them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link 
              to="/explore" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              EXPLORE CRAFTS <ArrowRight size={16} />
            </Link>
            <a 
              href="#artisans" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-earth-400/50 hover:bg-white/10 text-earth-100 px-7 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-colors"
            >
              MEET THE ARTISANS
            </a>
          </motion.div>

          {/* Subtle Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-8 border-t border-earth-800/80 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-earth-300 font-sans"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-terracotta-400" />
              <span>Authentic Handmade Crafts</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake size={15} className="text-terracotta-400" />
              <span>Direct Artisan Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-terracotta-400" />
              <span>Artisans Across India</span>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 2. INTRODUCTION / HUMAN CONNECTION */}
      <section id="artisans" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-900 mb-3">
            Every Craft Has a Story
          </h2>
          <p className="text-earth-600 text-base sm:text-lg leading-relaxed">
            Behind every handmade piece is a person, a tradition, and a story passed down through generations.
          </p>
        </div>

        {/* 3 Artisan Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {artisanProfiles.map((artisan, index) => (
            <motion.div
              key={artisan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-6 border border-earth-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-earth-200 mb-5 mx-auto shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={artisan.image} 
                    alt={artisan.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                <div className="text-center mb-4">
                  <h3 className="font-serif font-bold text-xl text-earth-900 mb-1">{artisan.name}</h3>
                  <p className="text-terracotta-600 font-semibold text-xs uppercase tracking-wider mb-1">
                    {artisan.craft}
                  </p>
                  <p className="text-earth-500 text-xs flex items-center justify-center gap-1">
                    <MapPin size={13} className="text-earth-400" /> {artisan.state}
                  </p>
                </div>

                <p className="text-earth-600 text-xs sm:text-sm text-center leading-relaxed italic mb-6">
                  "{artisan.story}"
                </p>
              </div>

              <Link 
                to="/explore" 
                className="w-full py-2.5 rounded-xl border border-earth-300 text-earth-800 font-sans font-bold text-xs uppercase tracking-wider text-center hover:bg-earth-100 transition-colors block"
              >
                VIEW CRAFTS
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-sans font-bold text-xs uppercase tracking-wider border-b-2 border-terracotta-600 pb-1 transition-colors"
          >
            MEET THE ARTISANS <ArrowRight size={14} />
          </Link>
        </div>
      </section>


      {/* 3. FEATURED PRODUCTS */}
      <section className="py-20 bg-white border-y border-earth-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-900 mb-2">
                Made by Someone, Not Something
              </h2>
              <p className="text-earth-600 text-base">
                Discover handmade pieces created by real artisans.
              </p>
            </div>
            <Link 
              to="/explore" 
              className="text-terracotta-600 hover:text-terracotta-700 font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-colors"
            >
              EXPLORE ALL CRAFTS <ArrowRight size={15} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-earth-100 rounded-2xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => {
                const originState = extractOriginState(product);
                const artisanDisplayName = product.artisanName || product.artisan || 'Master Artisan';

                return (
                  <motion.div 
                    key={product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-earth-50 rounded-2xl overflow-hidden border border-earth-200 hover:border-earth-300 hover:shadow-lg transition-all group flex flex-col"
                  >
                    <Link to={`/products/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-earth-100">
                      {product.image ? (
                        <img 
                          src={resolveImageUrl(product.image)} 
                          alt={product.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-earth-400">
                          <ShoppingBag size={40} />
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-earth-800 uppercase tracking-wider border border-earth-200">
                        {product.category || 'Handcrafted'}
                      </div>
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                      <div>
                        <h3 className="font-serif font-bold text-base text-earth-900 line-clamp-1 mb-1">
                          <Link to={`/products/${product.id}`} className="hover:text-terracotta-600 transition-colors">
                            {product.title}
                          </Link>
                        </h3>
                        
                        {/* Artisan Connection on Card */}
                        <p className="text-xs text-earth-600 flex items-center gap-1 font-medium">
                          <span>Made by {artisanDisplayName}</span>
                          {originState && (
                            <>
                              <span>•</span>
                              <span className="text-earth-500">{originState}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Stock Quantity & Price */}
                      <div className="pt-2 border-t border-earth-100 flex items-center justify-between">
                        <div>
                          <span className="text-forest-700 font-bold text-base block">
                            {product.price ? `₹${product.price}` : 'Price on request'}
                          </span>
                          {product.stockQuantity !== undefined && product.stockQuantity !== null && (
                            <span className="text-[10px] text-earth-500 font-mono block">
                              📦 Available: {product.stockQuantity}
                            </span>
                          )}
                        </div>

                        <button 
                          className="text-earth-400 hover:text-terracotta-600 p-2 rounded-lg hover:bg-terracotta-50 transition-colors"
                          title="Save craft"
                        >
                          <Heart size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>


      {/* 4. CRAFT DISCOVERY */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-900 mb-2">
            Find a Craft You Love
          </h2>
          <p className="text-earth-600 text-base">
            Explore authentic handiwork across India’s rich artistic mediums.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {craftCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link 
                to="/explore" 
                className="group relative h-48 rounded-2xl overflow-hidden block shadow-sm hover:shadow-md transition-all border border-earth-200"
              >
                <div className="absolute inset-0 bg-earth-950/40 group-hover:bg-earth-950/30 transition-colors z-10" />
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-serif font-bold text-base leading-tight drop-shadow-md">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 5. EMOTIONAL ARTISAN STORY SECTION */}
      <section className="py-20 bg-earth-900 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Image: Artisan at work */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-earth-700 shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80" 
                alt="Artisan molding terracotta clay" 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Right Copy */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-100 leading-tight">
                "When you buy a craft, you take home a piece of someone's story."
              </h2>
              
              <p className="text-earth-300 text-base leading-relaxed font-sans">
                Every piece on Hastkala is made by a real artisan. Your purchase helps their craft continue from one generation to the next.
              </p>

              <div className="pt-2">
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white px-7 py-3.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  MEET THE MAKERS <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>


      {/* 6. HOW HASTKALA WORKS */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-900 mb-2">
            How Hastkala Works
          </h2>
          <p className="text-earth-600 text-base">
            A simple, transparent connection between you and traditional creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: '01',
              title: 'FIND A CRAFT',
              desc: 'Explore handmade products from verified artisans across India.'
            },
            {
              num: '02',
              title: 'MEET ITS MAKER',
              desc: 'Learn about the person, craft, and origin state behind every product.'
            },
            {
              num: '03',
              title: 'SUPPORT THE CRAFT',
              desc: 'Connect directly and purchase authentic handmade creations.'
            }
          ].map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white p-8 rounded-2xl border border-earth-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="font-serif font-bold text-3xl text-terracotta-600 block mb-4">
                  {step.num}
                </span>
                <h3 className="font-sans font-bold text-sm text-earth-900 uppercase tracking-wider mb-2">
                  {step.title}
                </h3>
                <p className="text-earth-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* 7. TRUST / AUTHENTICITY */}
      <section className="py-16 bg-white border-y border-earth-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900 mb-2">
              Why Hastkala?
            </h2>
            <p className="text-earth-600 text-sm">
              Built to sustain heritage and empower India's master craftspeople.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-xl bg-earth-50 border border-earth-200">
              <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-700 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-900 mb-1">Authentic Handmade</h3>
              <p className="text-earth-600 text-xs leading-relaxed">Products made by real artisans across India.</p>
            </div>

            <div className="p-6 rounded-xl bg-earth-50 border border-earth-200">
              <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-700 mx-auto flex items-center justify-center mb-3">
                <HeartHandshake size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-900 mb-1">Direct Connection</h3>
              <p className="text-earth-600 text-xs leading-relaxed">Connect directly with the people behind the craft.</p>
            </div>

            <div className="p-6 rounded-xl bg-earth-50 border border-earth-200">
              <div className="w-10 h-10 rounded-full bg-terracotta-100 text-terracotta-700 mx-auto flex items-center justify-center mb-3">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-serif font-bold text-lg text-earth-900 mb-1">Fairer Opportunities</h3>
              <p className="text-earth-600 text-xs leading-relaxed">Help traditional artisans reach more buyers directly.</p>
            </div>
          </div>
        </div>
      </section>


      {/* 8. FINAL CTA */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-earth-900 text-white rounded-3xl p-10 sm:p-14 border border-earth-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              Your Next Favourite Piece Has a Maker Behind It.
            </h2>
            <p className="text-earth-300 text-base sm:text-lg">
              Discover the craft. Meet the maker. Take a story home.
            </p>
            <div className="pt-4">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white px-8 py-4 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                EXPLORE HANDMADE CRAFTS <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
