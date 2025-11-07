import { useState, useEffect } from 'react';
import { Bird, LogOut, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Product } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Link } from "react-router-dom";


interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [initMessage, setInitMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Country Chicken',
    subcategory: 'Chicken',
    price: '',
    unit: 'kg',
    description: '',
    image: '',
    stock: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/products`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeProducts = async () => {
    setLoading(true);
    setInitMessage('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/init-products`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to initialize products');
      }

      const data = await response.json();
      setInitMessage(data.message);
      await fetchProducts();
    } catch (err: any) {
      console.error('Error initializing products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      const url = editingProduct
        ? `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/products/${editingProduct.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/products`;

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      await fetchProducts();
      resetForm();
      setShowAddForm(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price.toString(),
      unit: product.unit,
      description: product.description,
      image: product.image,
      stock: product.stock.toString(),
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Country Chicken',
      subcategory: 'Chicken',
      price: '',
      unit: 'kg',
      description: '',
      image: '',
      stock: '',
    });
    setEditingProduct(null);
    setError('');
  };

  const categories = ['Country Chicken', 'Broiler & Layer', 'Quail Bird'];
  const subcategories: Record<string, string[]> = {
    'Country Chicken': ['Chicken', 'Eggs'],
    'Broiler & Layer': ['Chicken', 'Eggs'],
    'Quail Bird': ['Meat', 'Eggs'],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-red-900">Admin Dashboard</h1>
                <p className="text-sm text-red-600">Poultry Paradise</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-red-700">Admin: {user?.user_metadata?.name || user?.email}</span>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Product Button */}
        <div className="mb-6 flex justify-between items-center">
  <h2 className="text-red-900">Product Management</h2>

  {/* Add Product Button */}
  <div className="flex items-center gap-3">
    <Link
      to="/admin/add-product"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Go to Add Product Page
    </Link>

    <Button
      onClick={() => {
        setShowAddForm(!showAddForm);
        resetForm();
      }}
      className="bg-red-600 hover:bg-red-700"
    >
      {showAddForm ? (
        <>
          <X className="w-5 h-5 mr-2" />
          Cancel
        </>
      ) : (
        <>
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </>
      )}
    </Button>
  </div>
</div>

        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-red-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: string) =>
                      setFormData({
                        ...formData,
                        category: value,
                        subcategory: subcategories[value][0],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value: string) => setFormData({ ...formData, subcategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories[formData.category].map(sub => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: string) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="dozen">dozen</SelectItem>
                      <SelectItem value="tray">tray</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL (from Unsplash or other source)</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        {loading && !showAddForm ? (
          <div className="text-center py-12">
            <div className="text-xl text-red-700">Loading products...</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-red-900">Image</th>
                    <th className="px-4 py-3 text-left text-red-900">Name</th>
                    <th className="px-4 py-3 text-left text-red-900">Category</th>
                    <th className="px-4 py-3 text-left text-red-900">Price</th>
                    <th className="px-4 py-3 text-left text-red-900">Stock</th>
                    <th className="px-4 py-3 text-left text-red-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-red-600">
                        <div className="space-y-4">
                          <p>No products yet. Initialize with default products or add your first product!</p>
                          <Button
                            onClick={initializeProducts}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            {loading ? 'Initializing...' : 'Initialize 6 Default Products'}
                          </Button>
                          {initMessage && (
                            <p className="text-green-600">{initMessage}</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-red-50">
                        <td className="px-4 py-3">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-red-900">{product.name}</div>
                          <div className="text-sm text-red-600">{product.description.slice(0, 50)}...</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-red-900">{product.category}</div>
                          <div className="text-sm text-red-600">{product.subcategory}</div>
                        </td>
                        <td className="px-4 py-3 text-red-900">
                          ₹{product.price}/{product.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              product.stock === 0
                                ? 'bg-red-100 text-red-700'
                                : product.stock <= 5
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}