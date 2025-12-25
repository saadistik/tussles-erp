import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products.php');
      if (response.data.success) {
        setProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Products
          </h1>
          <p className="text-zinc-400 mt-1">Manage your inventory</p>
        </div>
        <button className="btn-glow flex items-center gap-2">
          <Plus size={20} />
          Add Product
        </button>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, SKU, or category..."
            className="input-field pl-11 w-full"
          />
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800/50 border-b border-zinc-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Buy Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Sell Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Margin</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-zinc-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-zinc-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => {
                  const stockQty = parseFloat(product.stock_qty);
                  const minStock = parseFloat(product.min_stock_alert);
                  const isLowStock = stockQty <= minStock;
                  const buyPrice = parseFloat(product.buy_price);
                  const sellPrice = parseFloat(product.sell_price);
                  const margin = buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row-hover border-b border-zinc-800/50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-zinc-200">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {product.description.substring(0, 50)}
                              {product.description.length > 50 && '...'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-indigo-400">{product.sku || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{product.category || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isLowStock ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {stockQty.toLocaleString()}
                          </span>
                          {isLowStock && (
                            <AlertTriangle size={16} className="text-rose-400" title="Low Stock" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{product.unit}</td>
                      <td className="px-6 py-4 text-zinc-300">₹{buyPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-200">
                        ₹{sellPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {margin > 0 ? (
                            <TrendingUp size={16} className="text-emerald-400" />
                          ) : (
                            <TrendingDown size={16} className="text-rose-400" />
                          )}
                          <span
                            className={`font-medium ${
                              margin > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                            <Edit size={16} className="text-indigo-400" />
                          </button>
                          <button className="p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">Total Products</p>
          <p className="text-3xl font-bold text-zinc-100">{products.length}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">Low Stock Items</p>
          <p className="text-3xl font-bold text-rose-400">
            {
              products.filter(
                (p) => parseFloat(p.stock_qty) <= parseFloat(p.min_stock_alert)
              ).length
            }
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <p className="text-zinc-400 text-sm mb-2">Total Stock Value</p>
          <p className="text-3xl font-bold text-emerald-400">
            ₹
            {products
              .reduce(
                (sum, p) => sum + parseFloat(p.stock_qty) * parseFloat(p.sell_price),
                0
              )
              .toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;
