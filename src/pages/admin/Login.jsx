import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, currentUser, isAdmin, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  // If already logged in and verified as admin, redirect to admin console
  useEffect(() => {
    if (currentUser && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [currentUser, isAdmin, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isConfigured) {
      setError(
        'Firebase configuration is pending. Please configure your live Firebase credentials in the .env file.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.isAdmin) {
        navigate(from, { replace: true });
      } else {
        // Logged in but not an authorized admin
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const code = err.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setError('Invalid administrator email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a moment and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else if (code === 'auth/user-disabled') {
        setError('This administrator account has been disabled.');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Customer Website</span>
        </Link>

        <div className="flex items-center space-x-3 justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            SS
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 uppercase">
              Sleep Star
            </h1>
            <p className="text-[10px] tracking-widest text-neutral-500 uppercase font-medium -mt-1">
              Admin Portal
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-600 max-w-xs mx-auto">
          Authorized business administration access only. Public self-registration is strictly disabled.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 sm:px-10">
          {/* Configuration status alert */}
          {!isConfigured && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold">
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                <span>Firebase Setup Note</span>
              </div>
              <p className="text-amber-700">
                Live Firebase project keys are not yet configured in <code className="bg-amber-100 px-1 py-0.5 rounded">.env</code>. Once you add your Firebase credentials and add an admin in Firebase Console &gt; Authentication, sign in will connect automatically.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sleepstar.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </span>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center space-x-2 text-xs text-neutral-500 justify-center">
              <Shield className="w-4 h-4 text-neutral-400" />
              <span>Protected by Firebase Authentication Rules</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
