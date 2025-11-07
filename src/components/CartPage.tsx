import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Bird, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { CartItem } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface CartPageProps {
  cart: CartItem[];
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  user: any;
  onLogout: () => void;
}

export default function CartPage({
  cart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  user,
  onLogout,
}: CartPageProps) {
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + delivery;

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      setOrderPlaced(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/home" className="flex items-center gap-2">
              <Bird className="w-8 h-8 text-amber-600" />
              <h1 className="text-amber-900">Poultry Paradise</h1>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-amber-700">Welcome, {user?.user_metadata?.name}!</span>
              <Button variant="outline" onClick={onLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/home">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <h2 className="text-amber-900 mb-8 flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          Your Shopping Cart
        </h2>

        {orderPlaced ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-green-900 mb-2">Order Placed Successfully!</h3>
            <p className="text-green-700">Thank you for your order. We'll deliver it fresh to your doorstep!</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <h3 className="text-amber-900 mb-2">Your cart is empty</h3>
            <p className="text-amber-700 mb-6">Add some fresh products to get started!</p>
            <Link to="/home">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-amber-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-amber-600 mb-2">{item.category} - {item.subcategory}</p>
                    <p className="text-amber-900">₹{item.price}/{item.unit}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-amber-900 min-w-[2rem] text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-amber-900 mt-2">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-amber-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4 pb-4 border-b border-amber-100">
                  <div className="flex justify-between text-amber-700">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Delivery Fee</span>
                    <span>₹{delivery.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-amber-900 mb-6">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 mb-3"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
