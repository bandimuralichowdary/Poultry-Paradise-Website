import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative h-48 overflow-hidden bg-amber-50">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-sm">
            Only {product.stock} left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white px-4 py-2 bg-red-600 rounded">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
        <h3 className="text-amber-900 mb-2">{product.name}</h3>
        <p className="text-sm text-amber-700 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-amber-900">₹{product.price}</span>
            <span className="text-sm text-amber-600">/{product.unit}</span>
          </div>
          <span className="text-sm text-amber-600">Stock: {product.stock}</span>
        </div>

        {product.stock > 0 && (
          <>
            <div className="flex items-center justify-center gap-3 mb-3">
              <Button
                size="sm"
                variant="outline"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-amber-900 min-w-[2rem] text-center">{quantity}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={incrementQuantity}
                disabled={quantity >= product.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <Button
              className={`w-full ${added ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
