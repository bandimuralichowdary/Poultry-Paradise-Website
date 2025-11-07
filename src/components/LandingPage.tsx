import { Link } from 'react-router-dom';
import { ShoppingCart, Egg, Bird, Users, ChevronDown, Drumstick, Beef } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

export default function LandingPage() {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const categories = [
    {
      title: 'Country Chicken',
      icon: Bird,
      color: 'amber',
    },
    {
      title: 'Broiler & Layer',
      icon: Drumstick,
      color: 'orange',
    },
    {
      title: 'Quail Bird',
      icon: Beef,
      color: 'yellow',
    },
  ];

  const toggleCategory = (index: number) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bird className="w-8 h-8 text-amber-600" />
            <h1 className="text-amber-900">Poultry Paradise</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                User Login
              </Button>
            </Link>
            <Link to="/admin-login">
              <Button variant="outline">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-amber-900 mb-4">
              Fresh Poultry, Delivered to Your Doorstep
            </h2>
            <p className="text-amber-800 mb-8">
              Premium quality chicken, eggs, and quail products sourced directly from local farms. 
              100% organic, fresh, and healthy options for your family.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800"
              alt="Fresh poultry products"
              className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-3xl shadow-lg mb-16">
        <h2 className="text-center text-amber-900 mb-12">Our Product Categories</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === index;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(index)}
                  className="w-full p-8 hover:bg-amber-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Icon className="w-12 h-12 text-amber-600" />
                    <h3 className="text-amber-900">{category.title}</h3>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-amber-600 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-8 pb-8 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Drumstick className="w-8 h-8 text-amber-600" />
                      <span className="text-amber-900">Chicken</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <Egg className="w-8 h-8 text-amber-600" />
                      <span className="text-amber-900">Eggs</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bird className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-amber-900 mb-2">100% Organic</h3>
            <p className="text-amber-700">Raised without hormones or antibiotics</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-amber-900 mb-2">Easy Ordering</h3>
            <p className="text-amber-700">Shop online and get home delivery</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Egg className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-amber-900 mb-2">Farm Fresh</h3>
            <p className="text-amber-700">Delivered within 24 hours of harvest</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bird className="w-6 h-6" />
            <span>Poultry Paradise</span>
          </div>
          <p className="text-amber-200">Fresh, Organic, and Delivered with Care</p>
        </div>
      </footer>
    </div>
  );
}