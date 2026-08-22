import React from 'react';
import { IndianRupee, Plus } from 'lucide-react';

const ProductList = ({ products, startEditProduct, deleteProduct }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-earth-200 p-12 text-center shadow-sm">
        <p className="text-earth-400 font-serif text-lg mb-4">No products listed yet.</p>
        <button 
          onClick={() => startEditProduct({})}
          className="bg-terracotta-600 text-white font-bold px-6 py-3 rounded uppercase tracking-wider text-sm hover:bg-terracotta-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus size={16} /> Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
      {products.map((product, i) => (
        <div key={i} className="p-6 border-b border-earth-100 last:border-0 hover:bg-earth-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-earth-200 rounded object-cover overflow-hidden shrink-0">
                {product.image && <img src={product.image} alt={product.title} className="w-full h-full object-cover" />}
             </div>
             <div>
               <h4 className="font-bold text-earth-900">{product.title}</h4>
               {product.category && <p className="text-sm text-earth-500">{product.category}</p>}
             </div>
           </div>
           <div className="flex flex-row md:flex-col gap-6 md:gap-1 text-sm text-earth-600">
             {product.material && <p>Material: <span className="font-bold text-earth-900">{product.material}</span></p>}
             {product.price && <p className="flex items-center gap-0.5"><IndianRupee size={14} className="text-earth-500" /> <span className="font-bold text-earth-900">{product.price}</span></p>}
           </div>
           <div className="flex flex-col gap-2">
             <button 
               onClick={() => startEditProduct(product)}
               className="text-terracotta-600 font-bold uppercase tracking-wider text-sm hover:underline text-left md:text-right"
             >
               Edit Listing
             </button>
             <button 
               onClick={() => deleteProduct(product._id)}
               className="text-red-500 font-bold uppercase tracking-wider text-sm hover:underline text-left md:text-right"
             >
               Delete
             </button>
           </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
