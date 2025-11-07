import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, LogOut, Bird, ChevronDown, Drumstick, Egg, Beef } from 'lucide-react';
import { Button } from './ui/button';
import { Product, CartItem } from '../App';
import ProductCard from './ProductCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface HomePageProps {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  user: any;
  onLogout: () => void;
}

export default function HomePage({ cart, addToCart, user, onLogout }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Country Chicken', 'Broiler & Layer', 'Quail Bird']));

  const categories = [
    { id: 'Country Chicken', name: 'Country Chicken', icon: Bird },
    { id: 'Broiler & Layer', name: 'Broiler & Layer', icon: Drumstick },
    { id: 'Quail Bird', name: 'Quail Bird', icon: Beef },
  ];

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

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

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-amber-600" />
              <h1 className="text-amber-900">Poultry Paradise</h1>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-amber-700">Welcome, {user?.user_metadata?.name || 'Customer'}!</span>
              <Link to="/cart">
                <Button variant="outline" className="relative">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>
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
        {/* Category Filter */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-amber-900 mb-4">Browse by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={expandedCategories.has(category.id) ? 'default' : 'outline'}
                  onClick={() => toggleCategory(category.id)}
                  className={expandedCategories.has(category.id) ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl text-amber-700">Loading products...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-xl text-red-600">Error: {error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Bird className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-amber-900 mb-2">No products available</h3>
            <p className="text-amber-700">Check back soon for fresh products!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => {
              const Icon = category.icon;
              const categoryProducts = products.filter(p => p.category === category.id);
              const isExpanded = expandedCategories.has(category.id);
              
              if (categoryProducts.length === 0) return null;

              const subcategoryGroups: Record<string, Product[]> = {};
              categoryProducts.forEach(product => {
                if (!subcategoryGroups[product.subcategory]) {
                  subcategoryGroups[product.subcategory] = [];
                }
                subcategoryGroups[product.subcategory].push(product);
              });

              return (
                <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-8 h-8 text-amber-600" />
                      <div className="text-left">
                        <h2 className="text-amber-900">{category.name}</h2>
                        <p className="text-sm text-amber-600">{categoryProducts.length} products available</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-amber-600 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 space-y-6">
                      {Object.entries(subcategoryGroups).map(([subcategory, subProducts]) => (
                        <div key={subcategory}>
                          <div className="flex items-center gap-2 mb-4">
                            {subcategory.toLowerCase().includes('egg') ? (
                              <Egg className="w-5 h-5 text-amber-600" />
                            ) : (
                              <Drumstick className="w-5 h-5 text-amber-600" />
                            )}
                            <h3 className="text-amber-900">{subcategory}</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {subProducts.map(product => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}