import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@hastkala/core';
import { Search, Image as ImageIcon } from 'lucide-react';
import { resolveImageUrl } from '../../utils/webImageUtils';
import { getSafeDate } from '@hastkala/core';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-earth-900">Platform Products</h1>
          <p className="text-earth-500 text-sm mt-1">Monitor products listed by artisans across the marketplace.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by title, category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-earth-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-earth-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50 text-earth-500 text-xs uppercase tracking-wider border-b border-earth-200">
                <th className="p-4 font-bold w-16">Image</th>
                <th className="p-4 font-bold">Product Title</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-earth-500">Loading products...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-earth-500">No products found.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-earth-50 transition-colors">
                    <td className="p-4">
                      {(product.image || (product.images && product.images.length > 0)) ? (
                        <img src={resolveImageUrl(product.image || product.images[0])} alt={product.title} className="w-10 h-10 object-cover rounded shadow-sm border border-earth-200" />
                      ) : (
                        <div className="w-10 h-10 bg-earth-100 rounded flex items-center justify-center text-earth-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-sm text-earth-900">{product.title}</p>
                      <p className="text-xs text-earth-500 truncate max-w-xs">{product.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-earth-100 text-earth-700 text-[10px] uppercase font-bold rounded">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-terracotta-700">₹{product.price}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm text-earth-500">
                        {product.createdAt && getSafeDate(product.createdAt) ? getSafeDate(product.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
