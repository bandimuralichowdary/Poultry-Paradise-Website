import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// User signup endpoint
app.post('/make-server-6c34fe24/signup', async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: role || 'user' },
      email_confirm: true, // Automatically confirm email since email server hasn't been configured
    });

    if (error) {
      console.error('Sign up error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already been registered') || error.code === 'email_exists') {
        return c.json({ 
          error: 'A user with this email address has already been registered. Please try signing in instead.' 
        }, 422);
      }
      
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Handle auth errors
    if (error.__isAuthError || error.name === 'AuthApiError') {
      if (error.code === 'email_exists' || error.message?.includes('already been registered')) {
        return c.json({ 
          error: 'A user with this email address has already been registered. Please try signing in instead.' 
        }, 422);
      }
    }
    
    return c.json({ error: error.message || 'Failed to sign up' }, 500);
  }
});

// Get all products
app.get('/make-server-6c34fe24/products', async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products || [] });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return c.json({ error: error.message || 'Failed to fetch products' }, 500);
  }
});

// Add new product (admin only)
app.post('/make-server-6c34fe24/products', async (c) => {
  try {
    const productData = await c.req.json();
    
    const productId = `product:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const product = {
      id: productId,
      ...productData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(productId, product);
    return c.json({ product });
  } catch (error: any) {
    console.error('Error adding product:', error);
    return c.json({ error: error.message || 'Failed to add product' }, 500);
  }
});

// Update product (admin only)
app.put('/make-server-6c34fe24/products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    const productData = await c.req.json();

    const existingProduct = await kv.get(productId);
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updatedProduct = {
      ...existingProduct,
      ...productData,
      id: productId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(productId, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return c.json({ error: error.message || 'Failed to update product' }, 500);
  }
});

// Delete product (admin only)
app.delete('/make-server-6c34fe24/products/:id', async (c) => {
  try {
    const productId = c.req.param('id');
    
    const existingProduct = await kv.get(productId);
    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404);
    }

    await kv.del(productId);
    return c.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return c.json({ error: error.message || 'Failed to delete product' }, 500);
  }
});

// Health check
app.get('/make-server-6c34fe24/health', (c) => {
  return c.json({ status: 'ok' });
});

// Initialize default products (one-time setup)
app.post('/make-server-6c34fe24/init-products', async (c) => {
  try {
    // Check if products already exist
    const existingProducts = await kv.getByPrefix('product:');
    if (existingProducts && existingProducts.length > 0) {
      return c.json({ message: 'Products already initialized', count: existingProducts.length });
    }

    const defaultProducts = [
      {
        name: 'Country Chicken',
        category: 'Country Chicken',
        subcategory: 'Chicken',
        price: 350,
        unit: 'kg',
        description: 'Fresh country chicken, naturally raised without hormones. Rich in protein and authentic taste.',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500',
        stock: 20,
      },
      {
        name: 'Country Chicken Eggs',
        category: 'Country Chicken',
        subcategory: 'Eggs',
        price: 80,
        unit: 'dozen',
        description: 'Farm-fresh country chicken eggs with natural orange yolk. Rich in nutrients and taste.',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
        stock: 50,
      },
      {
        name: 'Broiler Chicken',
        category: 'Broiler & Layer',
        subcategory: 'Chicken',
        price: 180,
        unit: 'kg',
        description: 'Fresh broiler chicken meat, tender and juicy. Perfect for everyday cooking.',
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500',
        stock: 30,
      },
      {
        name: 'Layer Eggs',
        category: 'Broiler & Layer',
        subcategory: 'Eggs',
        price: 60,
        unit: 'dozen',
        description: 'Fresh white eggs from layer chickens. Perfect for daily consumption and baking.',
        image: 'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?w=500',
        stock: 100,
      },
      {
        name: 'Quail Meat',
        category: 'Quail Bird',
        subcategory: 'Meat',
        price: 450,
        unit: 'kg',
        description: 'Premium quail meat, delicate flavor and tender texture. A gourmet delicacy.',
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500',
        stock: 15,
      },
      {
        name: 'Quail Eggs',
        category: 'Quail Bird',
        subcategory: 'Eggs',
        price: 120,
        unit: 'tray',
        description: 'Fresh quail eggs, packed with nutrients. Perfect for health-conscious consumers.',
        image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=500',
        stock: 40,
      },
    ];

    const products = [];
    for (const productData of defaultProducts) {
      const productId = `product:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const product = {
        id: productId,
        ...productData,
        createdAt: new Date().toISOString(),
      };
      await kv.set(productId, product);
      products.push(product);
    }

    return c.json({ message: 'Products initialized successfully', count: products.length, products });
  } catch (error: any) {
    console.error('Error initializing products:', error);
    return c.json({ error: error.message || 'Failed to initialize products' }, 500);
  }
});

Deno.serve(app.fetch);