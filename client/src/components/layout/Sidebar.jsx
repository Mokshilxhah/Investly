import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  GitCompare,
  Plus,
  TrendingUp,
  Target,
} from 'lucide-react';

export const Sidebar = ({ onOpenAddModal, stats = {} }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: BarChart3,
    },
    {
      name: 'Startups',
      path: '/startups',
      icon: Building2,
      badge: stats.totalStartups ? `${stats.totalStartups}` : null,
    },
    {
      name: 'Evaluation',
      path: '/evaluation',
      icon: Target,
    },
    {
      name: 'Comparison',
      path: '/compare',
      icon: GitCompare,
    },
  ];

  return (
    <aside className="w-64 bg-transparent p-4 flex flex-col flex-shrink-0 h-screen sticky top-0 text-slate-800 select-none">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col h-full justify-between">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-[#191919] flex items-center justify-center shadow-sm text-white font-bold">
              <TrendingUp className="w-5 h-5 text-[#9df5a9]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Invest<span className="text-[#10b981]">ly</span>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="py-5">
            <button
              onClick={onOpenAddModal}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black font-display text-slate-950 bg-[#9df5a9] hover:bg-[#8ee59a] shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-sm">Add Startup</span>
              <div className="w-6 h-6 rounded-full bg-[#191919] text-white flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </button>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-display font-extrabold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#191919] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-[#f4f7f4]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center ${
                        isActive ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive
                          ? 'bg-[#9df5a9] text-slate-950'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
