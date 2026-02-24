import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'motion/react';
import { User, Mail, Shield, Key, Save, LogOut, Lock } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API here
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // API call would go here
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-8 relative z-10"
    >
      <BackButton />

      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-[#00c9a7] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#00c9a7]/20">
          <User className="w-12 h-12 text-black" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{user.fullName}</h1>
        <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">{user.role} Account</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-[#111118] border border-white/5 p-8 rounded-[2.5rem]">
          <h2 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#00c9a7]" />
            <span>Account Settings</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 opacity-50 cursor-not-allowed text-sm font-medium"
                  value={email}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#111118] border border-white/5 p-8 rounded-[2.5rem]">
          <h2 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <Lock className="w-5 h-5 text-[#00c9a7]" />
            <span>Change Password</span>
          </h2>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#00c9a7] transition-colors text-sm font-medium"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full py-4 bg-[#00c9a7] hover:bg-[#00e0ba] text-black rounded-2xl font-bold transition-all shadow-lg shadow-[#00c9a7]/20 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#111118] border border-white/5 p-8 rounded-[2.5rem]">
          <h2 className="text-xl font-bold mb-8 flex items-center space-x-3 text-red-400">
            <Key className="w-5 h-5" />
            <span>Security & Session</span>
          </h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => logout()}
              className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out Everywhere</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
