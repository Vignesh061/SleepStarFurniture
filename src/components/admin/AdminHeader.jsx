import React from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AdminHeader = ({ onMenuClick, title = 'Administration' }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span>Firebase Mode</span>
        </div>

        <div className="flex items-center space-x-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center text-xs font-semibold">
            {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="hidden md:inline text-xs font-medium text-neutral-700 max-w-[140px] truncate">
            {currentUser?.email || 'Admin'}
          </span>
          <button
            onClick={logout}
            className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

