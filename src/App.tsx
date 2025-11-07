import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AddProduct from "./components/AddProduct";
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import HomePage from './components/HomePage';
import CartPage from './components/CartPage';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './utils/supabase/client';

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  description: string;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure we don't get stuck on loading screen
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          // Check if admin
          if (session.user.user_metadata?.role === 'admin') {
            setIsAdmin(true);
          }
        }
        clearTimeout(timeout);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error checking session:', error);
        clearTimeout(timeout);
        setLoading(false);
      });

    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        if (session.user.user_metadata?.role === 'admin') {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('poultryParadiseCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('poultryParadiseCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" /> : <LoginPage setUser={setUser} />}
        />
        <Route
          path="/admin-login"
          element={isAdmin ? <Navigate to="/admin" /> : <AdminLoginPage setUser={setUser} setIsAdmin={setIsAdmin} />}
        />
        <Route
          path="/home"
          element={
            user ? (
              <HomePage
                cart={cart}
                addToCart={addToCart}
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/cart"
          element={
            user ? (
              <CartPage
                cart={cart}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                user={user}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />
        <Route path="/add-product" element={<AddProduct />} />
        {/* Catch-all route - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;