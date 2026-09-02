import React from 'react';
import { IndianRupee, Plus, Package } from 'lucide-react';
import { resolveImageUrl } from '../../utils/webImageUtils';

const ProductList = ({ products, startEditProduct, deleteProduct, openAddProductModal }) => {
  const handleAddClick = openAddProductModal || (() => startEditProduct(null));

  if (!products || products.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-earth-200/60 p-16 text-center shadow-lg">
        <div className="w-16 h-16 bg-terracotta-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={24} className="text-terracotta-400" />
        </div>
        <h3 className="text-earth-900 font-serif text-2xl mb-2">Build Your Catalog</h3>
        <p className="text-earth-500 mb-8 max-w-sm mx-auto">Add your first handcrafted item to start sharing your work with buyers across India.</p>
        <button 
          onClick={handleAddClick}
          className="bg-terracotta-600 text-white font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-terracotta-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <Plus size={18} /> Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold text-earth-500 uppercase tracking-wider">Total Products: {products.length}</span>
        <button
          onClick={handleAddClick}
          className="bg-terracotta-600 text-white font-bold px-4 py-2 rounded-lg uppercase tracking-wider text-xs hover:bg-terracotta-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-earth-200/60 overflow-hidden divide-y divide-earth-100">
        {products.map((product, i) => (
          <div key={i} className="p-6 hover:bg-earth-50/50 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
             <div className="flex items-center gap-5">
               <div className="w-20 h-20 bg-earth-100 rounded-lg object-cover overflow-hidden shrink-0 shadow-sm border border-earth-200 group-hover:shadow-md transition-shadow">
                  {product.image && <img src={resolveImageUrl(product.image)} alt={product.title} className="w-full h-full object-cover" />}
               </div>
               <div>
                 <h4 className="font-bold text-earth-900">{product.title}</h4>
                 {product.category && <p className="text-sm text-earth-500">{product.category}</p>}
               </div>
             </div>
             <div className="flex flex-row md:flex-col gap-6 md:gap-1 text-xs text-earth-600">
               {product.material && <p className="uppercase tracking-wider">Material: <span className="font-bold text-earth-900">{product.material}</span></p>}
               {product.price && <p className="flex items-center gap-0.5 mt-1"><IndianRupee size={12} className="text-earth-500" /> <span className="text-base font-bold text-earth-900">{product.price}</span></p>}
               <div className="mt-1">
                 {product.stockQuantity === 0 ? (
                   <span className="inline-block bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[11px]">Stock: 0 — Out of Stock</span>
                 ) : product.stockQuantity > 0 ? (
                   <span className="inline-block bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">Stock: {product.stockQuantity}</span>
                 ) : (
                   <span className="inline-block bg-earth-100 text-earth-600 font-medium px-2 py-0.5 rounded text-[11px]">Stock not set</span>
                 )}
               </div>
             </div>
             <div className="flex flex-row gap-3 md:flex-col md:gap-2">
               <button 
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   startEditProduct(product);
                 }}
                 className="flex-1 md:flex-none text-center text-earth-700 bg-white border border-earth-200 hover:bg-earth-50 hover:border-earth-300 font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg transition-colors"
               >
                 Edit Listing
               </button>
               <button 
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   const prodId = product.id || product._id;
                   if (window.confirm("Are you sure you want to delete this product?")) {
                     deleteProduct(prodId);
                   }
                 }}
                 className="flex-1 md:flex-none text-center text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-[10px] px-4 py-2 rounded-lg transition-colors"
               >
                 Delete
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
