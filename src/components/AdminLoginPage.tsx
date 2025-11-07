import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bird, Mail, Lock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminLoginPageProps {
  setUser: (user: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function AdminLoginPage({ setUser, setIsAdmin }: AdminLoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6c34fe24/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name, role: 'admin' }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Check if email already exists
        if (data.error?.includes('already been registered') || data.error?.includes('email_exists')) {
          throw new Error('This email is already registered. Please try signing in instead.');
        }
        throw new Error(data.error || 'Sign up failed');
      }

      // Auto sign in after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      setUser(signInData.user);
      setIsAdmin(true);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin sign up error:', err);
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user is admin
      if (data.user?.user_metadata?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(data.user);
      setIsAdmin(true);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Bird className="w-10 h-10 text-red-600" />
            <h1 className="text-red-900">Poultry Paradise</h1>
          </Link>
          <div className="flex items-center justify-center gap-2 text-red-700">
            <Shield className="w-5 h-5" />
            <p>Admin Access Portal</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
          <h2 className="text-red-900 mb-6 text-center">
            {isSignUp ? 'Create Admin Account' : 'Admin Sign In'}
          </h2>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Admin Name</Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Bird className="w-5 h-5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Admin Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
                <Mail className="w-5 h-5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Admin Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
                <Lock className="w-5 h-5 text-red-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Admin Account' : 'Sign In as Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-red-600 hover:text-red-700"
            >
              {isSignUp
                ? 'Already have an admin account? Sign In'
                : "Don't have an admin account? Sign Up"}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <Shield className="w-4 h-4 inline mr-1" />
            Restricted to authorized administrators only
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-red-600 hover:text-red-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}