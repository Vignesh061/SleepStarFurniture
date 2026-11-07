import React, { useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, LogOut, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { currentUser, isAdmin, loading, logout, verifyAdmin, isConfigured } = useAuth();
  const location = useLocation();
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyAdmin();
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <LoadingSpinner size="lg" text="Verifying administrative credentials..." />
      </div>
    );
  }

  // Not logged in -> send to login page
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Logged in but not an authorized admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-800 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-neutral-900" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs text-neutral-500">
              The signed-in account is not registered as an authorized administrator for Sleep Star Furniture.
            </p>
          </div>

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-left space-y-1 text-xs">
            <div className="text-neutral-500">Signed in as:</div>
            <div className="font-mono font-medium text-neutral-800 break-all">
              {currentUser.email}
            </div>
            <div className="text-[11px] text-neutral-400 pt-1">
              UID: {currentUser.uid}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Verifying & Activating Access...' : 'Activate & Enter Admin Dashboard'}</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Try Another Account</span>
            </button>

            <Link
              to="/"
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-neutral-500 hover:text-neutral-900 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
