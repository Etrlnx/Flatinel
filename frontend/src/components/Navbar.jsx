import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  User as UserIcon, 
  Bell, 
  LayoutDashboard, 
  ClipboardList, 
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = (path) => {
    const isActive = location.pathname === path;
    return `inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? 'bg-sky-50 text-sky-700' 
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to={isAdmin ? "/admin" : "/resident"} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">Flatinel</span>
                <span className="text-xs font-semibold text-sky-600 tracking-wide uppercase">Society Tracker</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {isAdmin ? (
                <>
                  <Link to="/admin" className={navItemClass('/admin')}>
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Portal
                  </Link>
                  <Link to="/notices" className={navItemClass('/notices')}>
                    <Bell className="w-4 h-4" />
                    Notice Board
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/resident" className={navItemClass('/resident')}>
                    <ClipboardList className="w-4 h-4" />
                    My Complaints
                  </Link>
                  <Link to="/notices" className={navItemClass('/notices')}>
                    <Bell className="w-4 h-4" />
                    Notice Board
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">{user.unit_no || user.email}</span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
