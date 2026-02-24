import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShoppingBag, Wallet, History, LogOut, User, LayoutDashboard, Bell, Target, Settings, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/order', label: 'New Order', icon: ShoppingBag },
    { path: '/orders', label: 'My Orders', icon: History },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/notifications', label: 'Alerts', icon: Bell },
    { path: '/profile', label: 'Profile', icon: Settings },
    { path: '/feedback', label: 'Feedback', icon: MessageSquare },
  ];

  if (user.role === 'admin') {
    navLinks.push({ path: '/admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-[#00c9a7] rounded-lg flex items-center justify-center font-bold text-black text-sm">DB</div>
          <span className="font-display font-bold text-xl tracking-tight">DOLOR <span className="text-[#00c9a7]">- Boost</span></span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`text-sm font-bold transition-all flex items-center space-x-2 relative py-2 ${isActive(link.path) ? 'text-[#00c9a7]' : 'text-gray-500 hover:text-white'}`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
              {isActive(link.path) && (
                <motion.div 
                  layoutId="nav-dot" 
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00c9a7] rounded-full" 
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#111118] rounded-full border border-white/5">
            <User className="w-4 h-4 text-[#00c9a7]" />
            <span className="text-xs font-bold tracking-tight">{user.fullName?.split(' ')[0]}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
