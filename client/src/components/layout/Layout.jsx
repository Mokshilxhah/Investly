import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Plus, TrendingUp } from 'lucide-react';

export const Layout = ({ children, onOpenAddModal, stats = {} }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-[#e9efe9] text-slate-900 flex font-sans antialiased overflow-hidden w-full">
      {/* Desktop Sidebar (Left side - Stable & Fixed) */}
      <div className="hidden md:flex flex-shrink-0 h-screen sticky top-0">
        <Sidebar onOpenAddModal={onOpenAddModal} stats={stats} />
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#e9efe9] flex flex-col h-full p-4">
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-bold text-slate-900 text-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Investly</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-2xl text-slate-600 hover:text-slate-900 bg-white shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              onOpenAddModal={() => {
                setIsMobileMenuOpen(false);
                onOpenAddModal();
              }}
              stats={stats}
            />
          </div>
        </div>
      )}

      {/* Main Content View (Right side - No Horizontal Overflow, Smooth Vertical Scroll) */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full h-screen overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {/* Top Header Bar for Mobile */}
        <div className="flex items-center justify-between mb-6 md:hidden flex-shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-2xl bg-white text-slate-800 shadow-sm border border-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl text-slate-900">Investly</span>
          </div>
          <button
            onClick={onOpenAddModal}
            className="p-2.5 rounded-2xl bg-[#9df5a9] text-slate-900 shadow-sm font-bold"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 w-full max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
