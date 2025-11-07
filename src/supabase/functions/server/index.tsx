import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
process.env.SUPABASE_URL || '',
process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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

// Add new product (admin only)
app.post('/make-server-6c34fe24/products', async (c) => {
  try {
    const contentType = c.req.header('content-type') || '';
    
    let productData: any = {};

    // 1️⃣ Case: JSON input (image link)
    if (contentType.includes('application/json')) {
      productData = await c.req.json();
    } 
    
    // 2️⃣ Case: multipart/form-data (image file upload)
    else if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData();
      const name = formData.get('name');
      const category = formData.get('category');
      const subcategory = formData.get('subcategory');
      const price = parseFloat(formData.get('price') as string);
      const unit = formData.get('unit');
      const description = formData.get('description');
      const stock = parseInt(formData.get('stock') as string);
      const imageFile = formData.get('image') as File | null;

      let imageUrl = '';

      if (imageFile) {
        // Upload image to Supabase storage
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, { upsert: true });

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      productData = { name, category, subcategory, price, unit, description, stock, image: imageUrl };
    }

    // 3️⃣ Save product to KV store
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

app.get('/', (c) => c.text('Hello from Node + Supabase + Hono!'));